import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useAuth, useUser } from '@clerk/expo';
import { useRouter } from 'expo-router';
import { useSupabase } from '@/hooks/useSupabase';
import { useUserStore } from '@/store/userStore';
import ProfileSection from './ProfileSection';
import ProfileRow from './ProfileRow';

export default function UserActionsSection() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const authSupabase = useSupabase();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              useUserStore.getState().setNeedsOnboarding(null);
              useUserStore.getState().setSyncError(null);
              await signOut();
              router.replace('/(auth)/sign_in');
            } catch (error) {
              console.error('Sign out failed:', error);
              Alert.alert('Error', 'Unable to sign out. Please try again.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action is permanent and will delete all your data.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!user) return;
            setIsDeleting(true);
            try {
              // 1. Clean up user data in Supabase first while auth session is still valid
              try {
                await authSupabase.from('transactions').delete().eq('user_id', user.id);
                await authSupabase.from('accounts').delete().eq('user_id', user.id);
                await authSupabase.from('users').delete().eq('clerk_id', user.id);
              } catch (dbError) {
                console.warn('Supabase data cleanup warning:', dbError);
              }

              // 2. Delete Clerk user account
              await user.delete();

              // 3. Clear user store state
              useUserStore.getState().setNeedsOnboarding(null);
              useUserStore.getState().setSyncError(null);

              // 4. Sign out and redirect
              await signOut();
              router.replace('/(auth)/sign_in');
            } catch (error: any) {
              console.error('Delete account failed:', error);
              const message =
                error?.errors?.[0]?.longMessage ||
                error?.errors?.[0]?.message ||
                error?.message ||
                'Unable to delete account. Please try again.';
              Alert.alert('Error', message);
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <ProfileSection title="User actions">
      <ProfileRow
        icon="log-out-outline"
        title="Sign out"
        destructive
        showChevron={false}
        borderBottom={true}
        disabled={isDeleting}
        onPress={handleSignOut}
      />
      <ProfileRow
        icon="trash-outline"
        title="Delete account"
        destructive
        showChevron={false}
        borderBottom={false}
        disabled={isDeleting}
        loading={isDeleting}
        onPress={handleDeleteAccount}
      />
    </ProfileSection>
  );
}

