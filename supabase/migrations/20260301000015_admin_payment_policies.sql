-- Admin needs full access to payments and subscriptions for payment confirmation flow
CREATE POLICY "Admin can manage all payments" ON payments
  FOR ALL USING (is_admin());

CREATE POLICY "Admin can manage all subscriptions" ON subscriptions
  FOR ALL USING (is_admin());
