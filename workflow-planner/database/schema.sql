-- Workflow Planner Database Schema
-- Run this in Supabase SQL Editor to create all required tables

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE session_status AS ENUM ('active', 'completed', 'abandoned');
CREATE TYPE conversation_stage AS ENUM ('initial', 'clarifying', 'diagram_generated', 'json_generated');
CREATE TYPE message_role AS ENUM ('user', 'assistant', 'system');
CREATE TYPE workflow_category AS ENUM ('business_process', 'content_creation', 'data_processing', 'communication', 'automation', 'integration');

-- 1. Sessions Table - Track user sessions
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status session_status DEFAULT 'active',
    user_agent TEXT,
    ip_address INET,
    session_duration INTERVAL,
    total_conversations INTEGER DEFAULT 0,
    total_messages INTEGER DEFAULT 0,
    user_id UUID -- For future user authentication
);

-- 2. Workflow Types Reference Table
CREATE TABLE workflow_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    category workflow_category NOT NULL,
    description TEXT,
    popularity_score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Conversations Table - Track individual workflow planning conversations
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    workflow_type_id UUID REFERENCES workflow_types(id),
    initial_prompt TEXT NOT NULL,
    stage conversation_stage DEFAULT 'initial',
    clarification_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    duration INTERVAL,
    user_satisfaction_rating INTEGER CHECK (user_satisfaction_rating BETWEEN 1 AND 5)
);

-- 4. Messages Table - Store conversation messages
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    role message_role NOT NULL,
    content TEXT NOT NULL,
    message_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    tokens_used INTEGER,
    model_used TEXT,
    processing_time INTERVAL
);

-- 5. Workflow JSONs Table - Store generated n8n workflow files
CREATE TABLE workflow_jsons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    workflow_type_id UUID REFERENCES workflow_types(id),
    json_content JSONB NOT NULL,
    node_count INTEGER,
    complexity_score INTEGER CHECK (complexity_score BETWEEN 1 AND 10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    downloaded BOOLEAN DEFAULT FALSE,
    download_count INTEGER DEFAULT 0,
    last_downloaded_at TIMESTAMP WITH TIME ZONE
);

-- 6. Mermaid Diagrams Table - Track diagram generations and iterations
CREATE TABLE mermaid_diagrams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    diagram_code TEXT NOT NULL,
    diagram_order INTEGER DEFAULT 1, -- For tracking iterations
    nodes_count INTEGER,
    edges_count INTEGER,
    diagram_type TEXT, -- flowchart, sequence, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_final BOOLEAN DEFAULT FALSE,
    user_feedback TEXT
);

-- 7. Analytics Events Table - Track user interactions and app usage
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- 'button_click', 'input_submit', 'diagram_view', etc.
    event_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    page_url TEXT,
    element_id TEXT
);

-- Create indexes for performance
CREATE INDEX idx_sessions_created_at ON sessions(created_at);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_conversations_session_id ON conversations(session_id);
CREATE INDEX idx_conversations_workflow_type_id ON conversations(workflow_type_id);
CREATE INDEX idx_conversations_stage ON conversations(stage);
CREATE INDEX idx_conversations_created_at ON conversations(created_at);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_role ON messages(role);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_workflow_jsons_conversation_id ON workflow_jsons(conversation_id);
CREATE INDEX idx_workflow_jsons_downloaded ON workflow_jsons(downloaded);
CREATE INDEX idx_mermaid_diagrams_conversation_id ON mermaid_diagrams(conversation_id);
CREATE INDEX idx_mermaid_diagrams_is_final ON mermaid_diagrams(is_final);
CREATE INDEX idx_analytics_events_session_id ON analytics_events(session_id);
CREATE INDEX idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some default workflow types
INSERT INTO workflow_types (name, display_name, category, description, popularity_score) VALUES
('invoice_processing', 'Invoice Processing Pipeline', 'business_process', 'Automate invoice extraction, validation, and processing', 95),
('email_automation', 'Email Automation', 'communication', 'Automated email workflows and responses', 90),
('lead_nurturing', 'Lead Nurturing', 'business_process', 'Automated lead qualification and follow-up sequences', 85),
('content_creation', 'AI Content Creation', 'content_creation', 'Automated content generation and publishing', 80),
('data_pipeline', 'Data Processing Pipeline', 'data_processing', 'ETL and data transformation workflows', 75),
('social_media', 'Social Media Automation', 'content_creation', 'Automated social media posting and engagement', 70),
('customer_support', 'Customer Support Automation', 'communication', 'Automated ticket routing and responses', 85),
('ecommerce', 'E-commerce Automation', 'business_process', 'Order processing and inventory management', 80),
('reporting', 'Automated Reporting', 'data_processing', 'Scheduled reports and dashboards', 75),
('integration', 'API Integration', 'integration', 'Connect different systems and services', 70);

-- Enable Row Level Security (RLS) - Optional for future user authentication
-- ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Analytics Views for easy querying
CREATE VIEW conversation_analytics AS
SELECT 
    c.id,
    c.session_id,
    wt.display_name as workflow_type,
    wt.category,
    c.stage,
    c.clarification_count,
    c.created_at,
    c.duration,
    COUNT(m.id) as message_count,
    COUNT(CASE WHEN m.role = 'user' THEN 1 END) as user_messages,
    COUNT(CASE WHEN m.role = 'assistant' THEN 1 END) as assistant_messages,
    COUNT(md.id) as diagram_count,
    COUNT(wj.id) as workflow_json_count,
    COALESCE(wj.downloaded, false) as workflow_downloaded
FROM conversations c
LEFT JOIN workflow_types wt ON c.workflow_type_id = wt.id
LEFT JOIN messages m ON c.id = m.conversation_id
LEFT JOIN mermaid_diagrams md ON c.id = md.conversation_id
LEFT JOIN workflow_jsons wj ON c.id = wj.conversation_id
GROUP BY c.id, c.session_id, wt.display_name, wt.category, c.stage, c.clarification_count, c.created_at, c.duration, wj.downloaded;

CREATE VIEW daily_usage_stats AS
SELECT 
    DATE(created_at) as date,
    COUNT(DISTINCT session_id) as unique_sessions,
    COUNT(*) as total_conversations,
    COUNT(CASE WHEN stage = 'json_generated' THEN 1 END) as completed_workflows,
    AVG(clarification_count) as avg_clarifications,
    COUNT(CASE WHEN duration IS NOT NULL THEN 1 END) as completed_conversations,
    AVG(EXTRACT(EPOCH FROM duration)/60) as avg_duration_minutes
FROM conversations 
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Comments for documentation
COMMENT ON TABLE sessions IS 'User sessions tracking browser sessions and overall app usage';
COMMENT ON TABLE workflow_types IS 'Reference table for categorizing different types of workflows';
COMMENT ON TABLE conversations IS 'Individual workflow planning conversations between user and AI';
COMMENT ON TABLE messages IS 'All messages in conversations including user inputs and AI responses';
COMMENT ON TABLE workflow_jsons IS 'Generated n8n workflow JSON files ready for download';
COMMENT ON TABLE mermaid_diagrams IS 'Generated Mermaid diagrams with iteration tracking';
COMMENT ON TABLE analytics_events IS 'User interaction events for behavior analysis';