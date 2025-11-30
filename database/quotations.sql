-- Create quotations table
-- This table stores quotation/price quote information

CREATE TABLE IF NOT EXISTS quotations (
  id SERIAL PRIMARY KEY,
  quotation_number VARCHAR(50) UNIQUE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  client_name VARCHAR(255) NOT NULL,
  customer_id VARCHAR(50) REFERENCES customers(customer_id) ON DELETE SET NULL,
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'مسودة' CHECK (status IN ('مسودة', 'مرسل', 'مقبول', 'مرفوض')),
  valid_until DATE,
  items_count INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on customer_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_quotations_customer_id ON quotations(customer_id);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status);

-- Create index on date for sorting
CREATE INDEX IF NOT EXISTS idx_quotations_date ON quotations(date DESC);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_quotations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER quotations_updated_at_trigger
BEFORE UPDATE ON quotations
FOR EACH ROW
EXECUTE FUNCTION update_quotations_updated_at();

-- Insert sample data (optional - remove if not needed)
INSERT INTO quotations (quotation_number, date, client_name, total_amount, status, valid_until, items_count, notes)
VALUES 
  ('QUO-2025-001', '2025-11-25', 'شركة النور للتجارة', 45000, 'مرسل', '2025-12-25', 5, 'عرض سعر لمشروع التوسعة'),
  ('QUO-2025-002', '2025-11-23', 'مؤسسة الأمل', 32000, 'مقبول', '2025-12-23', 3, 'عرض سعر معدات مكتبية'),
  ('QUO-2025-003', '2025-11-20', 'شركة المستقبل', 28500, 'مسودة', '2025-12-20', 4, 'عرض سعر أولي'),
  ('QUO-2025-004', '2025-11-18', 'مكتب الإبداع', 15000, 'مرفوض', '2025-12-18', 2, 'عرض سعر خدمات استشارية')
ON CONFLICT (quotation_number) DO NOTHING;

COMMENT ON TABLE quotations IS 'جدول عروض الأسعار - يحتوي على جميع عروض الأسعار المقدمة للعملاء';
COMMENT ON COLUMN quotations.quotation_number IS 'رقم عرض السعر الفريد';
COMMENT ON COLUMN quotations.status IS 'حالة عرض السعر: مسودة، مرسل، مقبول، أو مرفوض';
COMMENT ON COLUMN quotations.valid_until IS 'تاريخ انتهاء صلاحية العرض';
COMMENT ON COLUMN quotations.items_count IS 'عدد الأصناف في عرض السعر';
