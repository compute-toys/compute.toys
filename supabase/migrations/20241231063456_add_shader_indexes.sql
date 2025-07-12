-- Add indexes for better query performance on shader table

-- 1. List page queries: WHERE visibility = 'public' ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_shader_visibility_created_at ON public.shader(visibility, created_at DESC);

-- 2. Search page queries: WHERE visibility = 'public' AND name ILIKE '%query%' ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_shader_public_name ON public.shader(name) 
WHERE visibility = 'public';

-- 3. Profile page queries: WHERE author = $1
CREATE INDEX IF NOT EXISTS idx_shader_author ON public.shader(author);

-- 4. Count queries (used in pagination): WHERE visibility = 'public'
CREATE INDEX IF NOT EXISTS idx_shader_public_count ON public.shader(visibility) 
WHERE visibility = 'public';

-- [redundant because author is non-null] RLS policy optimization: auth.uid() = author
DROP INDEX IF EXISTS idx_shader_author_rls;