import { useSupabase } from '@/hooks/useSupabase';
import { useUserStore } from '@/store/userStore';
import { useUser } from '@clerk/expo';
import { useCallback, useEffect } from 'react';

export const useUserSync = () => {
  const { user } = useUser();
  const setCurrency = useUserStore((state) => state.setCurrency);
  const setNeedsOnboarding = useUserStore((state) => state.setNeedsOnboarding);
  const syncError = useUserStore((state) => state.syncError);
  const setSyncError = useUserStore((state) => state.setSyncError);
  const authSupabase = useSupabase();

  const syncUser = useCallback(async () => {
    if (!user) {
      setNeedsOnboarding(null);
      setSyncError(null);
      return;
    }

    setSyncError(null);

    try {
      // 1. Look up existing user profile using maybeSingle()
      const { data: existingUser, error: fetchError } = await authSupabase
        .from('users')
        .select('clerk_id, currency')
        .eq('clerk_id', user.id)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching user:', fetchError);
        // Leave needsOnboarding as null on network/fetch errors, expose syncError for retry
        setSyncError(fetchError.message || 'Failed to fetch user data');
        return;
      }

      if (existingUser) {
        setCurrency(existingUser.currency ?? 'INR');
        setNeedsOnboarding(!existingUser.currency);
      } else {
        // Confirmed missing user: upsert new user record
        const email = user.emailAddresses[0]?.emailAddress ?? '';

        const { data: newUser, error: insertError } = await authSupabase
          .from('users')
          .upsert(
            {
              clerk_id: user.id,
              email,
              name: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim(),
              image_url: user.imageUrl,
            },
            { onConflict: 'clerk_id', ignoreDuplicates: false }
          )
          .select('currency')
          .single();

        if (insertError) {
          console.error('Error upserting user:', insertError);
          setSyncError(insertError.message || 'Failed to create user profile');
          return;
        }

        setCurrency(newUser?.currency ?? 'INR');
        setNeedsOnboarding(!newUser?.currency);
      }

      // 2. Idempotent default account check (runs for both new and existing users)
      const { data: defaultAccount, error: accountFetchError } = await authSupabase
        .from('accounts')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_default', true)
        .maybeSingle();

      if (accountFetchError) {
        console.warn('Error checking default account:', accountFetchError);
      } else if (!defaultAccount) {
        const { error: accountInsertError } = await authSupabase.from('accounts').insert({
          user_id: user.id,
          name: 'Cash',
          type: 'CASH',
          balance: 0,
          is_default: true,
        });

        if (accountInsertError) {
          console.error('Error creating default account:', accountInsertError);
        }
      }
    } catch (e: unknown) {
      console.error('Unexpected sync error:', e);
      const msg = e instanceof Error ? e.message : 'An unexpected error occurred during sync';
      setSyncError(msg);
    }
  }, [user, authSupabase, setCurrency, setNeedsOnboarding, setSyncError]);

  useEffect(() => {
    syncUser();
  }, [syncUser]);

  return { syncError, retry: syncUser };
};
