-- Create content table for images and text slides
CREATE TABLE content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('image', 'text')),
  
  -- Image-specific fields
  file_url TEXT,
  file_size BIGINT,
  file_type VARCHAR(100),
  width INTEGER,
  height INTEGER,
  
  -- Text slide-specific fields
  title TEXT,
  content_text TEXT,
  background_color VARCHAR(7) DEFAULT '#000000',
  text_color VARCHAR(7) DEFAULT '#FFFFFF',
  font_family VARCHAR(100) DEFAULT 'Inter',
  font_size INTEGER DEFAULT 24,
  
  -- Metadata
  thumbnail_url TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create slideshows table
CREATE TABLE slideshows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Display settings
  default_slide_duration INTEGER DEFAULT 10, -- seconds
  transition_type VARCHAR(50) DEFAULT 'fade' CHECK (transition_type IN ('fade', 'slide', 'none')),
  transition_duration INTEGER DEFAULT 1000, -- milliseconds
  
  -- Configuration
  auto_advance BOOLEAN DEFAULT true,
  show_progress BOOLEAN DEFAULT false,
  background_color VARCHAR(7) DEFAULT '#000000',
  
  -- Analytics
  view_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMPTZ,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  published_at TIMESTAMPTZ,
  
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create slideshow_slides junction table for ordering and slide-specific settings
CREATE TABLE slideshow_slides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slideshow_id UUID NOT NULL REFERENCES slideshows(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  
  -- Ordering and timing
  slide_order INTEGER NOT NULL,
  duration INTEGER NOT NULL DEFAULT 10, -- seconds, overrides slideshow default
  
  -- Slide-specific overrides
  transition_type VARCHAR(50),
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(slideshow_id, content_id),
  UNIQUE(slideshow_id, slide_order)
);

-- Create display_sessions table for analytics
CREATE TABLE display_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slideshow_id UUID NOT NULL REFERENCES slideshows(id) ON DELETE CASCADE,
  session_id VARCHAR(255) NOT NULL, -- Browser session or device ID
  ip_address INET,
  user_agent TEXT,
  
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_ping_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  
  -- Statistics
  total_duration INTEGER DEFAULT 0, -- seconds
  slides_viewed INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add updated_at triggers for new tables
CREATE TRIGGER update_content_updated_at BEFORE UPDATE ON content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_slideshows_updated_at BEFORE UPDATE ON slideshows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_slideshow_slides_updated_at BEFORE UPDATE ON slideshow_slides FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS for new tables
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE slideshows ENABLE ROW LEVEL SECURITY;
ALTER TABLE slideshow_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE display_sessions ENABLE ROW LEVEL SECURITY;

-- Content RLS Policies
CREATE POLICY "Users can view content in their organizations" ON content
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_roles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create content in their organizations" ON content
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT ur.organization_id 
      FROM user_roles ur 
      JOIN roles r ON ur.role_id = r.id 
      WHERE ur.user_id = auth.uid() 
      AND r.permissions && ARRAY['signage:write', '*']
    )
    AND created_by = auth.uid()
  );

CREATE POLICY "Users can update content in their organizations" ON content
  FOR UPDATE USING (
    organization_id IN (
      SELECT ur.organization_id 
      FROM user_roles ur 
      JOIN roles r ON ur.role_id = r.id 
      WHERE ur.user_id = auth.uid() 
      AND r.permissions && ARRAY['signage:write', '*']
    )
  );

CREATE POLICY "Users can delete their own content or admins can delete any" ON content
  FOR DELETE USING (
    created_by = auth.uid()
    OR organization_id IN (
      SELECT ur.organization_id 
      FROM user_roles ur 
      JOIN roles r ON ur.role_id = r.id 
      WHERE ur.user_id = auth.uid() 
      AND r.name IN ('owner', 'admin')
    )
  );

-- Slideshows RLS Policies
CREATE POLICY "Users can view slideshows in their organizations" ON slideshows
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_roles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create slideshows in their organizations" ON slideshows
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT ur.organization_id 
      FROM user_roles ur 
      JOIN roles r ON ur.role_id = r.id 
      WHERE ur.user_id = auth.uid() 
      AND r.permissions && ARRAY['signage:write', '*']
    )
    AND created_by = auth.uid()
  );

CREATE POLICY "Users can update slideshows in their organizations" ON slideshows
  FOR UPDATE USING (
    organization_id IN (
      SELECT ur.organization_id 
      FROM user_roles ur 
      JOIN roles r ON ur.role_id = r.id 
      WHERE ur.user_id = auth.uid() 
      AND r.permissions && ARRAY['signage:write', '*']
    )
  );

CREATE POLICY "Users can delete their own slideshows or admins can delete any" ON slideshows
  FOR DELETE USING (
    created_by = auth.uid()
    OR organization_id IN (
      SELECT ur.organization_id 
      FROM user_roles ur 
      JOIN roles r ON ur.role_id = r.id 
      WHERE ur.user_id = auth.uid() 
      AND r.name IN ('owner', 'admin')
    )
  );

-- Slideshow Slides RLS Policies
CREATE POLICY "Users can view slideshow slides in their organizations" ON slideshow_slides
  FOR SELECT USING (
    slideshow_id IN (
      SELECT id FROM slideshows WHERE organization_id IN (
        SELECT organization_id FROM user_roles WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage slideshow slides in their organizations" ON slideshow_slides
  FOR ALL USING (
    slideshow_id IN (
      SELECT s.id FROM slideshows s
      JOIN user_roles ur ON s.organization_id = ur.organization_id
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.permissions && ARRAY['signage:write', '*']
    )
  );

-- Display Sessions RLS Policies (public read for display, limited write)
CREATE POLICY "Anyone can read active display sessions" ON display_sessions
  FOR SELECT USING (true);

CREATE POLICY "Anyone can create display sessions" ON display_sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own display sessions" ON display_sessions
  FOR UPDATE USING (
    slideshow_id IN (
      SELECT id FROM slideshows WHERE organization_id IN (
        SELECT organization_id FROM user_roles WHERE user_id = auth.uid()
      )
    )
    OR auth.uid() IS NULL -- Allow anonymous updates for tracking
  );

-- Indexes for performance
CREATE INDEX idx_content_organization_id ON content(organization_id);
CREATE INDEX idx_content_type ON content(type);
CREATE INDEX idx_content_created_by ON content(created_by);

CREATE INDEX idx_slideshows_organization_id ON slideshows(organization_id);
CREATE INDEX idx_slideshows_is_active ON slideshows(is_active);
CREATE INDEX idx_slideshows_created_by ON slideshows(created_by);

CREATE INDEX idx_slideshow_slides_slideshow_id ON slideshow_slides(slideshow_id);
CREATE INDEX idx_slideshow_slides_content_id ON slideshow_slides(content_id);
CREATE INDEX idx_slideshow_slides_order ON slideshow_slides(slideshow_id, slide_order);

CREATE INDEX idx_display_sessions_slideshow_id ON display_sessions(slideshow_id);
CREATE INDEX idx_display_sessions_session_id ON display_sessions(session_id);
CREATE INDEX idx_display_sessions_started_at ON display_sessions(started_at);

-- Function to increment slideshow view count
CREATE OR REPLACE FUNCTION increment_slideshow_views(slideshow_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE slideshows 
  SET view_count = view_count + 1, last_viewed_at = NOW()
  WHERE id = slideshow_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reorder slides when inserting/updating
CREATE OR REPLACE FUNCTION reorder_slides()
RETURNS TRIGGER AS $$
BEGIN
  -- If inserting and no order specified, put at end
  IF TG_OP = 'INSERT' AND NEW.slide_order IS NULL THEN
    NEW.slide_order = COALESCE(
      (SELECT MAX(slide_order) + 1 FROM slideshow_slides WHERE slideshow_id = NEW.slideshow_id),
      1
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_reorder_slides
  BEFORE INSERT ON slideshow_slides
  FOR EACH ROW EXECUTE FUNCTION reorder_slides();

-- Create storage bucket for content files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'content',
  'content',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Storage policies for content bucket
CREATE POLICY "Users can view content files" ON storage.objects FOR SELECT USING (bucket_id = 'content');

CREATE POLICY "Authenticated users can upload content files" ON storage.objects 
  FOR INSERT WITH CHECK (
    bucket_id = 'content'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own content files" ON storage.objects 
  FOR UPDATE USING (
    bucket_id = 'content'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete their own content files" ON storage.objects 
  FOR DELETE USING (
    bucket_id = 'content'
    AND auth.role() = 'authenticated'
  );