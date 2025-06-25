-- Create enum types
CREATE TYPE project_type AS ENUM ('Architecture', 'Objects', 'Visual');
CREATE TYPE project_role AS ENUM ('Design', 'Build', 'Manage');
CREATE TYPE company_type AS ENUM ('Take Place', 'Design-Built', '5468796 Architecture', 'Personal');

-- Create projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  year INTEGER NOT NULL CHECK (year >= 1900 AND year <= 2100),
  company company_type NOT NULL,
  type project_type[] NOT NULL,
  role project_role[] NOT NULL,
  description_short TEXT NOT NULL,
  description_long TEXT NOT NULL,
  media TEXT[] NOT NULL,
  media_settings JSONB[] NOT NULL DEFAULT ARRAY[]::JSONB[], -- Each element can contain: { autoplay: boolean, start: number, end: number }
  cover TEXT NOT NULL,
  importance INTEGER NOT NULL CHECK (importance >= 1 AND importance <= 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT prevent_screensaver_deletion CHECK (
    CASE 
      WHEN slug = 'screensaver' THEN true
      ELSE true
    END
  )
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to prevent screensaver deletion
CREATE OR REPLACE FUNCTION prevent_screensaver_deletion()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.slug = 'screensaver' THEN
    RAISE EXCEPTION 'Cannot delete the screensaver project';
  END IF;
  RETURN OLD;
END;
$$ language 'plpgsql';

-- Create trigger to prevent screensaver deletion
CREATE TRIGGER prevent_screensaver_deletion_trigger
  BEFORE DELETE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION prevent_screensaver_deletion();

-- Create RLS policies
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access
CREATE POLICY "Allow anonymous read access" 
  ON projects FOR SELECT 
  USING (true);

-- Allow authenticated users to insert/update
CREATE POLICY "Allow authenticated create" 
  ON projects FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update" 
  ON projects FOR UPDATE 
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to delete (except screensaver)
CREATE POLICY "Allow authenticated delete"
  ON projects FOR DELETE
  USING (auth.role() = 'authenticated' AND slug != 'screensaver');

-- Create sample screensaver project
INSERT INTO projects (
  slug,
  name,
  year,
  company,
  type,
  role,
  description_short,
  description_long,
  media,
  media_settings,
  cover,
  importance
) VALUES (
  'screensaver',
  'Screensaver',
  2025,
  'Take Place',
  ARRAY['Architecture']::project_type[],
  ARRAY['Design']::project_role[],
  'Landing page screensaver images',
  'A collection of images used for the landing page screensaver.',
  ARRAY[
    'https://example.com/image1.jpg',
    'https://example.com/image2.jpg'
  ],
  ARRAY[
    '{"autoplay": true}'::jsonb,
    '{"autoplay": true}'::jsonb
  ],
  'https://example.com/cover.jpg',
  1
); 