-- Datasheets: raise the upload limit to 60 MB and accept more file types.
-- The product-datasheets bucket enforces the size and type list itself, so
-- the website's own checks (60 MB; PDF, Word, Excel, PowerPoint, ZIP, PNG,
-- JPG) hold even if the browser check is bypassed. Idempotent.
--
-- Note: Supabase also has a project-wide upload cap (Dashboard > Storage >
-- Settings > Upload file size limit). It must be 60 MB or higher, or uploads
-- over that cap are refused no matter what this bucket allows.

update storage.buckets
set file_size_limit = 62914560,  -- 60 MB
    allowed_mime_types = array[
      'application/pdf',
      'application/msword',
      'application/vnd.ms-excel',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/zip',
      'image/png',
      'image/jpeg'
    ]
where id = 'product-datasheets';
