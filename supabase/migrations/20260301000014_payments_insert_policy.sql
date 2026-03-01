-- Allow factory users to insert their own payments (for bank transfer flow)
CREATE POLICY "Factories can create own payments" ON payments
  FOR INSERT WITH CHECK (auth.uid() = factory_id);
