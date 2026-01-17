-- Add code column to expenses
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS code TEXT;

-- Update existing expenses with a code based on ID
UPDATE expenses SET code = 'EXP-' || LPAD(id::TEXT, 5, '0') WHERE code IS NULL;

-- Function to generate expense code using a sequence
CREATE SEQUENCE IF NOT EXISTS expense_code_seq;

-- Sync sequence with max id if needed (optional, depends on if we want to match IDs)
SELECT setval('expense_code_seq', (SELECT COALESCE(MAX(id), 0) FROM expenses));

CREATE OR REPLACE FUNCTION generate_expense_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.code IS NULL THEN
        NEW.code := 'EXP-' || LPAD(nextval('expense_code_seq')::TEXT, 5, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_expense_code ON expenses;
CREATE TRIGGER set_expense_code
    BEFORE INSERT ON expenses
    FOR EACH ROW
    EXECUTE FUNCTION generate_expense_code();

-- Add code column to revenue
ALTER TABLE revenue ADD COLUMN IF NOT EXISTS code TEXT;

-- Update existing revenue
UPDATE revenue SET code = 'REV-' || LPAD(id::TEXT, 5, '0') WHERE code IS NULL;

-- Function to generate revenue code
CREATE SEQUENCE IF NOT EXISTS revenue_code_seq;
SELECT setval('revenue_code_seq', (SELECT COALESCE(MAX(id), 0) FROM revenue));

CREATE OR REPLACE FUNCTION generate_revenue_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.code IS NULL THEN
        NEW.code := 'REV-' || LPAD(nextval('revenue_code_seq')::TEXT, 5, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_revenue_code ON revenue;
CREATE TRIGGER set_revenue_code
    BEFORE INSERT ON revenue
    FOR EACH ROW
    EXECUTE FUNCTION generate_revenue_code();
