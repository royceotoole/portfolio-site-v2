-- Enable RLS for both buckets
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policy for project-media bucket
CREATE POLICY "Give public access to project media"
ON storage.objects FOR SELECT
USING (bucket_id = 'project-media');

-- Create policy for screensaver bucket
CREATE POLICY "Give public access to screensaver media"
ON storage.objects FOR SELECT
USING (bucket_id = 'screensaver');

-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload files"
ON storage.objects FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' AND
  (bucket_id = 'project-media' OR bucket_id = 'screensaver')
);

-- Allow authenticated users to update their own files
CREATE POLICY "Allow authenticated users to update files"
ON storage.objects FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to delete their own files
CREATE POLICY "Allow authenticated users to delete files"
ON storage.objects FOR DELETE
USING (auth.role() = 'authenticated'); 