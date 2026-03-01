-- ============================================================
-- Chat/Messaging Feature
-- ============================================================

-- ============================================================
-- CONVERSATIONS
-- ============================================================
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  participant_2 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT conversations_ordered_participants CHECK (participant_1 < participant_2),
  CONSTRAINT conversations_unique_pair UNIQUE (participant_1, participant_2)
);

-- ============================================================
-- MESSAGES
-- ============================================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_conversations_participant_1 ON conversations (participant_1);
CREATE INDEX idx_conversations_participant_2 ON conversations (participant_2);
CREATE INDEX idx_messages_conversation_created ON messages (conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender_id ON messages (sender_id);
CREATE INDEX idx_messages_receiver_id ON messages (receiver_id);
CREATE INDEX idx_messages_unread ON messages (receiver_id) WHERE is_read = false;

-- ============================================================
-- TRIGGERS
-- ============================================================
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations SET updated_at = NEW.created_at WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_new_message_update_conversation
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION update_conversation_on_message();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view conversations"
  ON conversations FOR SELECT
  USING (auth.uid() IN (participant_1, participant_2));

CREATE POLICY "Users can create conversations they participate in"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() IN (participant_1, participant_2));

CREATE POLICY "Participants can update conversations"
  ON conversations FOR UPDATE
  USING (auth.uid() IN (participant_1, participant_2));

CREATE POLICY "Participants can view messages"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND auth.uid() IN (c.participant_1, c.participant_2)
    )
  );

CREATE POLICY "Participants can send messages"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND auth.uid() IN (c.participant_1, c.participant_2)
    )
  );

CREATE POLICY "Participants can update messages"
  ON messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND auth.uid() IN (c.participant_1, c.participant_2)
    )
  );

-- ============================================================
-- FUNCTION: Get or create conversation
-- ============================================================
CREATE OR REPLACE FUNCTION get_or_create_conversation(
  user_a UUID,
  user_b UUID
)
RETURNS UUID AS $$
DECLARE
  p1 UUID;
  p2 UUID;
  conv_id UUID;
BEGIN
  IF user_a < user_b THEN
    p1 := user_a;
    p2 := user_b;
  ELSE
    p1 := user_b;
    p2 := user_a;
  END IF;

  SELECT id INTO conv_id
  FROM conversations
  WHERE participant_1 = p1 AND participant_2 = p2;

  IF conv_id IS NULL THEN
    INSERT INTO conversations (participant_1, participant_2)
    VALUES (p1, p2)
    RETURNING id INTO conv_id;
  END IF;

  RETURN conv_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FUNCTION: Get conversations with details
-- ============================================================
CREATE OR REPLACE FUNCTION get_user_conversations(p_user_id UUID)
RETURNS TABLE (
  conversation_id UUID,
  other_user_id UUID,
  other_user_role user_role,
  other_user_name TEXT,
  other_user_avatar TEXT,
  last_message_content TEXT,
  last_message_sender_id UUID,
  last_message_at TIMESTAMPTZ,
  unread_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id AS conversation_id,
    CASE WHEN c.participant_1 = p_user_id THEN c.participant_2 ELSE c.participant_1 END AS other_user_id,
    u.role AS other_user_role,
    COALESCE(wp.full_name, fp.company_name, u.email, 'Người dùng') AS other_user_name,
    COALESCE(wp.avatar_url, fp.logo_url) AS other_user_avatar,
    lm.content AS last_message_content,
    lm.sender_id AS last_message_sender_id,
    lm.created_at AS last_message_at,
    (
      SELECT COUNT(*)
      FROM messages m2
      WHERE m2.conversation_id = c.id
        AND m2.sender_id != p_user_id
        AND m2.is_read = false
    ) AS unread_count
  FROM conversations c
  JOIN users u ON u.id = CASE WHEN c.participant_1 = p_user_id THEN c.participant_2 ELSE c.participant_1 END
  LEFT JOIN worker_profiles wp ON wp.user_id = u.id
  LEFT JOIN factory_profiles fp ON fp.user_id = u.id
  LEFT JOIN LATERAL (
    SELECT m.content, m.sender_id, m.created_at
    FROM messages m
    WHERE m.conversation_id = c.id
    ORDER BY m.created_at DESC
    LIMIT 1
  ) lm ON true
  WHERE c.participant_1 = p_user_id OR c.participant_2 = p_user_id
  ORDER BY COALESCE(lm.created_at, c.created_at) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FUNCTION: Get unread message count
-- ============================================================
CREATE OR REPLACE FUNCTION get_unread_message_count(p_user_id UUID)
RETURNS BIGINT AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM messages m
    JOIN conversations c ON c.id = m.conversation_id
    WHERE (c.participant_1 = p_user_id OR c.participant_2 = p_user_id)
      AND m.sender_id != p_user_id
      AND m.is_read = false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- Enable Realtime
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
