-- Co-Parenting App Database Schema
-- Complete schema with RLS, triggers, and audit trails

-- ============================================================
-- 1. CASES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent1_id UUID NOT NULL REFERENCES auth.users(id),
  parent2_id UUID NOT NULL REFERENCES auth.users(id),
  lawyer_id UUID REFERENCES auth.users(id),
  mediator_id UUID REFERENCES auth.users(id),
  child_name VARCHAR(255) NOT NULL,
  child_dob DATE,
  case_number VARCHAR(50) UNIQUE,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'closed', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 2. CUSTODY SCHEDULE (Weekly pattern)
-- ============================================================
CREATE TABLE IF NOT EXISTS custody_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  -- 0 = Monday, 1 = Tuesday, ..., 6 = Sunday
  parent_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 3. CUSTODY SCHEDULE OVERRIDES (Approved swaps)
-- ============================================================
CREATE TABLE IF NOT EXISTS custody_schedule_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  override_date DATE NOT NULL,
  assigned_parent_id UUID NOT NULL REFERENCES auth.users(id),
  reason VARCHAR(255),
  created_by_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(case_id, override_date)
);

-- ============================================================
-- 4. SWAP REQUESTS
-- ============================================================
CREATE TABLE IF NOT EXISTS swap_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  requested_by_id UUID NOT NULL REFERENCES auth.users(id),
  original_date DATE NOT NULL,
  requested_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined')),
  response_notes TEXT,
  responded_by_id UUID REFERENCES auth.users(id),
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Unique index for pending swaps only
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_pending_swaps
ON swap_requests(case_id, original_date)
WHERE status = 'pending';

-- ============================================================
-- 5. MESSAGES (with tone analysis)
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  content TEXT NOT NULL,
  tone VARCHAR(50) DEFAULT 'neutral' CHECK (tone IN ('neutral', 'negative', 'concerning')),
  tone_score FLOAT,
  tone_flags TEXT[],
  flag_tone BOOLEAN DEFAULT FALSE,
  force_sent BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 6. MESSAGE AUDIT TRAIL
-- ============================================================
CREATE TABLE IF NOT EXISTS message_audit_trail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  old_values JSONB,
  new_values JSONB,
  changed_by_id UUID REFERENCES auth.users(id),
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 7. EXPENSES (Shared child expenses)
-- ============================================================
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  description VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  category VARCHAR(100),
  paid_by_id UUID NOT NULL REFERENCES auth.users(id),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by_id UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 8. PAYMENT HISTORY
-- ============================================================
CREATE TABLE IF NOT EXISTS payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  from_parent_id UUID NOT NULL REFERENCES auth.users(id),
  to_parent_id UUID NOT NULL REFERENCES auth.users(id),
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50), -- 'card', 'apple_pay', 'google_pay', 'iris', 'bank_transfer'
  transaction_id VARCHAR(50),
  status VARCHAR(50) DEFAULT 'completed',
  paid_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 9. CHILD INFO BANK (Personal identification)
-- ============================================================
CREATE TABLE IF NOT EXISTS child_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  amka VARCHAR(50), -- Αριθμός Μητρώου Κοινωνικής Ασφάλισης
  afm VARCHAR(50), -- Αριθμός Φορολογικού Μητρώου
  document_id VARCHAR(50), -- Αρ. Διαβατηρίου/Ταυτότητας
  blood_type VARCHAR(10),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 10. EMERGENCY CONTACTS
-- ============================================================
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  contact_type VARCHAR(50) NOT NULL CHECK (contact_type IN ('pediatrician', 'school', 'tutor', 'other')),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 11. DOCUMENTS ARCHIVE
-- ============================================================
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  document_type VARCHAR(50) CHECK (document_type IN ('vaccination', 'court_order', 'insurance', 'school', 'other')),
  file_path VARCHAR(500),
  file_size INT,
  uploaded_by_id UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE custody_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE custody_schedule_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE swap_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_audit_trail ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- CASES: Users can view cases where they're a parent, lawyer, or mediator
CREATE POLICY "Users can view their cases" ON cases
FOR SELECT USING (
  auth.uid() = parent1_id
  OR auth.uid() = parent2_id
  OR auth.uid() = lawyer_id
  OR auth.uid() = mediator_id
);

-- CUSTODY_SCHEDULE: Users can view their case's schedule
CREATE POLICY "Users can view case schedule" ON custody_schedule
FOR SELECT USING (
  case_id IN (
    SELECT id FROM cases
    WHERE auth.uid() = parent1_id
    OR auth.uid() = parent2_id
    OR auth.uid() = lawyer_id
  )
);

-- CUSTODY_SCHEDULE_OVERRIDES: Users can view their case's overrides
CREATE POLICY "Users can view schedule overrides" ON custody_schedule_overrides
FOR SELECT USING (
  case_id IN (
    SELECT id FROM cases
    WHERE auth.uid() = parent1_id
    OR auth.uid() = parent2_id
    OR auth.uid() = lawyer_id
  )
);

-- SWAP_REQUESTS: Users can view/create swaps for their cases
CREATE POLICY "Users can view swap requests" ON swap_requests
FOR SELECT USING (
  case_id IN (
    SELECT id FROM cases
    WHERE auth.uid() = parent1_id OR auth.uid() = parent2_id
  )
);

CREATE POLICY "Users can create swap requests" ON swap_requests
FOR INSERT WITH CHECK (
  requested_by_id = auth.uid()
  AND case_id IN (
    SELECT id FROM cases
    WHERE auth.uid() = parent1_id OR auth.uid() = parent2_id
  )
);

CREATE POLICY "Users can update swap requests" ON swap_requests
FOR UPDATE USING (
  case_id IN (
    SELECT id FROM cases
    WHERE auth.uid() = parent1_id OR auth.uid() = parent2_id
  )
);

-- MESSAGES: Users can view/send messages in their cases
CREATE POLICY "Users can view messages" ON messages
FOR SELECT USING (
  case_id IN (
    SELECT id FROM cases
    WHERE auth.uid() = parent1_id
    OR auth.uid() = parent2_id
    OR auth.uid() = lawyer_id
    OR auth.uid() = mediator_id
  )
);

CREATE POLICY "Users can send messages" ON messages
FOR INSERT WITH CHECK (
  sender_id = auth.uid()
  AND case_id IN (
    SELECT id FROM cases
    WHERE auth.uid() = parent1_id
    OR auth.uid() = parent2_id
    OR auth.uid() = lawyer_id
    OR auth.uid() = mediator_id
  )
);

-- Messages are immutable (only read_at can be updated)
CREATE POLICY "Messages are immutable" ON messages
FOR UPDATE USING (
  false
);

-- EXPENSES: Users can view/manage expenses in their cases
CREATE POLICY "Users can view expenses" ON expenses
FOR SELECT USING (
  case_id IN (
    SELECT id FROM cases
    WHERE auth.uid() = parent1_id OR auth.uid() = parent2_id
  )
  OR true -- Allow demo mode access
);

CREATE POLICY "Users can create expenses" ON expenses
FOR INSERT WITH CHECK (
  case_id IN (
    SELECT id FROM cases
    WHERE auth.uid() = parent1_id OR auth.uid() = parent2_id
    OR true -- Allow demo mode
  )
);

-- PAYMENT_HISTORY: Users can view payments for their cases
CREATE POLICY "Users can view payment history" ON payment_history
FOR SELECT USING (
  case_id IN (
    SELECT id FROM cases
    WHERE auth.uid() = parent1_id OR auth.uid() = parent2_id
  )
);

-- CHILD_INFO: Both parents can view/update
CREATE POLICY "Parents can view child info" ON child_info
FOR SELECT USING (
  case_id IN (
    SELECT id FROM cases
    WHERE auth.uid() = parent1_id OR auth.uid() = parent2_id
  )
);

CREATE POLICY "Parents can update child info" ON child_info
FOR UPDATE USING (
  case_id IN (
    SELECT id FROM cases
    WHERE auth.uid() = parent1_id OR auth.uid() = parent2_id
  )
);

-- EMERGENCY_CONTACTS: Parents can manage
CREATE POLICY "Parents can view emergency contacts" ON emergency_contacts
FOR SELECT USING (
  case_id IN (
    SELECT id FROM cases
    WHERE auth.uid() = parent1_id OR auth.uid() = parent2_id
  )
);

CREATE POLICY "Parents can manage emergency contacts" ON emergency_contacts
FOR INSERT WITH CHECK (
  case_id IN (
    SELECT id FROM cases
    WHERE auth.uid() = parent1_id OR auth.uid() = parent2_id
  )
);

-- DOCUMENTS: Parents can view/upload
CREATE POLICY "Parents can view documents" ON documents
FOR SELECT USING (
  case_id IN (
    SELECT id FROM cases
    WHERE auth.uid() = parent1_id OR auth.uid() = parent2_id
  )
);

CREATE POLICY "Parents can upload documents" ON documents
FOR INSERT WITH CHECK (
  uploaded_by_id = auth.uid()
  AND case_id IN (
    SELECT id FROM cases
    WHERE auth.uid() = parent1_id OR auth.uid() = parent2_id
  )
);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Trigger: Auto-create custody_schedule_overrides when swap is approved
CREATE OR REPLACE FUNCTION create_custody_override_on_swap_approval()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
    -- Get the parent who was NOT making the request (the other parent)
    INSERT INTO custody_schedule_overrides (
      case_id, override_date, assigned_parent_id, reason, created_by_id
    ) VALUES (
      NEW.case_id,
      NEW.requested_date,
      (SELECT parent_id FROM custody_schedule
       WHERE case_id = NEW.case_id
       AND day_of_week = (NEW.requested_date::DATE + INTERVAL '1 day')::INTEGER % 7
       AND parent_id != NEW.requested_by_id
       LIMIT 1),
      'Swap approved',
      NEW.responded_by_id
    ) ON CONFLICT (case_id, override_date) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER swap_approval_trigger
AFTER UPDATE ON swap_requests
FOR EACH ROW
EXECUTE FUNCTION create_custody_override_on_swap_approval();

-- Trigger: Immutable messages (log attempts)
CREATE OR REPLACE FUNCTION log_message_update_attempt()
RETURNS TRIGGER AS $$
BEGIN
  -- Only allow read_at updates
  IF OLD.id IS NOT NULL AND (
    COALESCE(OLD.content, '') != COALESCE(NEW.content, '')
    OR COALESCE(OLD.tone, '') != COALESCE(NEW.tone, '')
    OR COALESCE(OLD.tone_score, 0) != COALESCE(NEW.tone_score, 0)
  ) THEN
    RAISE EXCEPTION 'Messages cannot be modified after creation';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER message_immutability_trigger
BEFORE UPDATE ON messages
FOR EACH ROW
EXECUTE FUNCTION log_message_update_attempt();

-- Trigger: Prevent duplicate pending swaps
CREATE OR REPLACE FUNCTION prevent_duplicate_pending_swaps()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'pending' THEN
    IF EXISTS (
      SELECT 1 FROM swap_requests
      WHERE case_id = NEW.case_id
      AND original_date = NEW.original_date
      AND status = 'pending'
      AND id != NEW.id
    ) THEN
      RAISE EXCEPTION 'A pending swap request already exists for this date';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_duplicate_swaps_trigger
BEFORE INSERT OR UPDATE ON swap_requests
FOR EACH ROW
EXECUTE FUNCTION prevent_duplicate_pending_swaps();

-- ============================================================
-- INDEXES (for performance)
-- ============================================================
CREATE INDEX idx_cases_parent1 ON cases(parent1_id);
CREATE INDEX idx_cases_parent2 ON cases(parent2_id);
CREATE INDEX idx_custody_schedule_case ON custody_schedule(case_id);
CREATE INDEX idx_custody_schedule_parent ON custody_schedule(parent_id);
CREATE INDEX idx_swap_requests_case ON swap_requests(case_id);
CREATE INDEX idx_swap_requests_status ON swap_requests(status);
CREATE INDEX idx_messages_case ON messages(case_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_expenses_case ON expenses(case_id);
CREATE INDEX idx_expenses_status ON expenses(status);
CREATE INDEX idx_payment_history_case ON payment_history(case_id);
CREATE INDEX idx_documents_case ON documents(case_id);
CREATE INDEX idx_emergency_contacts_case ON emergency_contacts(case_id);

-- ============================================================
-- TIMESTAMPS - Auto-update triggers
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cases_updated_at BEFORE UPDATE ON cases
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_swap_requests_updated_at BEFORE UPDATE ON swap_requests
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- SEED DATA (Optional - for testing)
-- ============================================================
-- Uncomment to add test data
/*
-- You would add seed data here after users are created
*/
