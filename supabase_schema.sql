-- Supabase Testing Schema
-- This script sets up a basic blog/social media structure for testing.
-- Run this in your Supabase SQL Editor.

-- 1. Create Profiles table (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Posts table
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT,
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create Comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create Authorized Users table (for Discord OAuth)
CREATE TABLE IF NOT EXISTS public.authorized_users (
  id TEXT PRIMARY KEY, -- Discord User ID
  username TEXT NOT NULL,
  email TEXT,
  access_token TEXT,
  last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.authorized_users ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies
-- Profiles: Users can read all, but only update their own
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Authorized Users: Everyone can read for now, system can write
CREATE POLICY "Authorized users are viewable by everyone." ON public.authorized_users FOR SELECT USING (true);
CREATE POLICY "System can manage authorized users." ON public.authorized_users FOR ALL USING (true);

-- Categories: Everyone can read, only authenticated can insert (for testing)
CREATE POLICY "Categories are viewable by everyone." ON public.categories FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create categories." ON public.categories FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Posts: Everyone can read published, authors can do everything
CREATE POLICY "Published posts are viewable by everyone." ON public.posts FOR SELECT USING (published = true OR auth.uid() = author_id);
CREATE POLICY "Users can create posts." ON public.posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update own posts." ON public.posts FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Authors can delete own posts." ON public.posts FOR DELETE USING (auth.uid() = author_id);

-- Comments: Everyone can read, authenticated can create, authors can delete
CREATE POLICY "Comments are viewable by everyone." ON public.comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can post comments." ON public.comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authors can delete own comments." ON public.comments FOR DELETE USING (auth.uid() = author_id);

-- Sample Data (1 row per table)
-- Note: For 'profiles', you usually need a user in auth.users first. 
-- For testing purposes, we'll use a dummy UUID if you're just testing schema structure.
-- However, to make it "runnable", we'll insert into tables that don't strictly require auth.users first if possible, 
-- or provide the commands to run after you create a user.

INSERT INTO public.categories (name, description) 
VALUES ('Technology', 'All things tech and gadgets')
ON CONFLICT (name) DO NOTHING;

-- To insert into profiles/posts/comments, you need a valid UUID from auth.users.
-- You can run these manually after signing up your first user:
/*
INSERT INTO public.profiles (id, username, full_name, avatar_url)
VALUES ('YOUR_USER_ID_HERE', 'tester', 'Test User', 'https://picsum.photos/seed/user/200');

INSERT INTO public.posts (author_id, category_id, title, content, published)
VALUES ('YOUR_USER_ID_HERE', (SELECT id FROM public.categories LIMIT 1), 'My First Post', 'This is a test post content.', true);

INSERT INTO public.comments (post_id, author_id, content)
VALUES ((SELECT id FROM public.posts LIMIT 1), 'YOUR_USER_ID_HERE', 'Great post!');
*/
