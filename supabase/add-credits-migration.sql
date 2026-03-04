-- Atomic add_credits function (mirrors deduct_credits pattern)
-- Prevents race conditions by using SELECT ... FOR UPDATE row locking
CREATE OR REPLACE FUNCTION add_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_description TEXT,
  p_reference_id TEXT DEFAULT NULL,
  p_type TEXT DEFAULT 'admin_adjustment'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_profile_id UUID;
  v_current_balance INTEGER;
  v_new_balance INTEGER;
BEGIN
  -- Lock the row to prevent concurrent modifications
  SELECT id, credits_balance INTO v_profile_id, v_current_balance
  FROM profiles
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_profile_id IS NULL THEN
    RETURN FALSE;
  END IF;

  v_new_balance := v_current_balance + p_amount;

  -- Update balance
  UPDATE profiles
  SET credits_balance = v_new_balance
  WHERE id = v_profile_id;

  -- Insert transaction record
  INSERT INTO credit_transactions (user_id, amount, type, description, reference_id, balance_after)
  VALUES (p_user_id, p_amount, p_type, p_description, p_reference_id, v_new_balance);

  RETURN TRUE;
END;
$$;
