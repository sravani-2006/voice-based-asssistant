-- View all bookmarks with their article details
SELECT 
  b.id as bookmark_id,
  b.user_id,
  b.article_id,
  a.id as article_in_db_id,
  a.title,
  b.created_at
FROM public.bookmarks b
LEFT JOIN public.articles a ON b.article_id = a.id
ORDER BY b.created_at DESC;

-- Check for encoded URL values in article_id
SELECT 
  id, 
  article_id, 
  user_id,
  created_at 
FROM public.bookmarks 
WHERE article_id LIKE '%https%' 
OR article_id LIKE '%www%'
OR article_id LIKE '%http%'
ORDER BY created_at DESC;

-- Count of bookmarks per user
SELECT 
  user_id, 
  COUNT(*) as bookmark_count 
FROM public.bookmarks 
GROUP BY user_id; 