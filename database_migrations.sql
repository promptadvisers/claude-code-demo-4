-- Database Schema for Chat History, Mermaid Diagrams, and Prompts
-- Execute these migrations in order

-- Migration 1: Create conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL DEFAULT 'New Conversation',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Migration 2: Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    message_order INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    tokens_used INTEGER,
    model_used TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    UNIQUE(conversation_id, message_order)
);

-- Migration 3: Create prompts table
CREATE TABLE IF NOT EXISTS public.prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    prompt_type TEXT NOT NULL CHECK (prompt_type IN ('initial', 'system', 'template', 'follow-up')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expected_output_type TEXT,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Migration 4: Create mermaid_diagrams table
CREATE TABLE IF NOT EXISTS public.mermaid_diagrams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
    prompt_id UUID REFERENCES public.prompts(id) ON DELETE SET NULL,
    diagram_code TEXT NOT NULL,
    diagram_type TEXT NOT NULL CHECK (diagram_type IN ('flowchart', 'sequence', 'gantt', 'class', 'state', 'er', 'journey', 'git', 'pie', 'requirement', 'other')),
    title TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    render_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Migration 5: Create update trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Migration 6: Create triggers
CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON public.conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Migration 7: Create indexes for performance
-- Conversations indexes
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON public.conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON public.conversations(updated_at DESC);

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_role ON public.messages(role);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_order ON public.messages(conversation_id, message_order);

-- Prompts indexes
CREATE INDEX IF NOT EXISTS idx_prompts_conversation_id ON public.prompts(conversation_id);
CREATE INDEX IF NOT EXISTS idx_prompts_type ON public.prompts(prompt_type);
CREATE INDEX IF NOT EXISTS idx_prompts_created_at ON public.prompts(created_at DESC);

-- Mermaid diagrams indexes
CREATE INDEX IF NOT EXISTS idx_mermaid_conversation_id ON public.mermaid_diagrams(conversation_id);
CREATE INDEX IF NOT EXISTS idx_mermaid_message_id ON public.mermaid_diagrams(message_id);
CREATE INDEX IF NOT EXISTS idx_mermaid_prompt_id ON public.mermaid_diagrams(prompt_id);
CREATE INDEX IF NOT EXISTS idx_mermaid_type ON public.mermaid_diagrams(diagram_type);
CREATE INDEX IF NOT EXISTS idx_mermaid_created_at ON public.mermaid_diagrams(created_at DESC);

-- Migration 8: Sample queries for testing
-- Insert sample conversation
-- INSERT INTO public.conversations (title) VALUES ('Sample Chat Session');

-- Insert sample message
-- INSERT INTO public.messages (conversation_id, role, content, message_order)
-- VALUES (
--     (SELECT id FROM public.conversations LIMIT 1),
--     'user',
--     'Create a flowchart showing user authentication flow',
--     1
-- );

-- Insert sample prompt
-- INSERT INTO public.prompts (conversation_id, content, prompt_type, expected_output_type)
-- VALUES (
--     (SELECT id FROM public.conversations LIMIT 1),
--     'Create a detailed flowchart for user authentication including OAuth and 2FA',
--     'initial',
--     'mermaid'
-- );

-- Insert sample mermaid diagram
-- INSERT INTO public.mermaid_diagrams (conversation_id, diagram_code, diagram_type, title)
-- VALUES (
--     (SELECT id FROM public.conversations LIMIT 1),
--     'flowchart TD\n    A[User Login] --> B{Authenticated?}\n    B -->|Yes| C[Dashboard]\n    B -->|No| D[Login Form]',
--     'flowchart',
--     'User Authentication Flow'
-- );