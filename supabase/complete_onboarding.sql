-- Run this in your Supabase SQL Editor to create the complete_onboarding function.
-- This function atomically:
-- 1. Updates the user's selected primary currency.
-- 2. If a starting balance (> 0) is provided, finds or creates their default account
--    and atomically increments the balance.
-- 3. Inserts a "Starting balance" transaction inside the same atomic transaction.

CREATE OR REPLACE FUNCTION complete_onboarding(
  p_currency TEXT,
  p_starting_balance NUMERIC DEFAULT 0
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id TEXT;
  v_account_id UUID;
BEGIN
  -- Extract user ID from Clerk JWT
  v_user_id := auth.jwt()->>'sub';

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 1. Update user primary currency
  UPDATE users
  SET currency = p_currency
  WHERE clerk_id = v_user_id;

  -- 2. If starting balance is provided, update account & create initial transaction
  IF p_starting_balance > 0 THEN
    -- Find or create the default Cash account
    SELECT id INTO v_account_id
    FROM accounts
    WHERE user_id = v_user_id AND is_default = TRUE
    LIMIT 1;

    IF v_account_id IS NULL THEN
      INSERT INTO accounts (user_id, name, type, balance, is_default)
      VALUES (v_user_id, 'Cash', 'CASH', p_starting_balance, TRUE)
      RETURNING id INTO v_account_id;
    ELSE
      -- Atomically increment balance
      UPDATE accounts
      SET balance = COALESCE(balance, 0) + p_starting_balance
      WHERE id = v_account_id;
    END IF;

    -- Record the initial starting balance transaction
    INSERT INTO transactions (
      user_id,
      account_id,
      type,
      amount,
      category,
      description,
      date,
      input_method
    ) VALUES (
      v_user_id,
      v_account_id,
      'INCOME',
      p_starting_balance,
      'other_income',
      'Starting balance',
      NOW(),
      'MANUAL'
    );
  END IF;

  RETURN jsonb_build_object('success', TRUE);
END;
$$;