-- Check if the extension is available before creating
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create articles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'articles' AND schemaname = 'public'
  ) THEN
    CREATE TABLE public.articles (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      content TEXT,
      url TEXT,
      urlToImage TEXT,
      source TEXT,
      author TEXT,
      publishedat TIMESTAMP WITH TIME ZONE,
      category TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
    );
    RAISE NOTICE 'Created articles table';
  ELSE
    RAISE NOTICE 'articles table already exists';
  END IF;
END
$$;

-- Create profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'profiles' AND schemaname = 'public'
  ) THEN
    CREATE TABLE public.profiles (
      id UUID REFERENCES auth.users(id) PRIMARY KEY,
      email TEXT UNIQUE,
      name TEXT,
      avatar_url TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
    );
    RAISE NOTICE 'Created profiles table';
  ELSE
    RAISE NOTICE 'profiles table already exists';
  END IF;
END
$$;

-- Create bookmarks table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'bookmarks' AND schemaname = 'public'
  ) THEN
    CREATE TABLE public.bookmarks (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id) NOT NULL,
      article_id TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
      UNIQUE(user_id, article_id)
    );
    RAISE NOTICE 'Created bookmarks table';
  ELSE
    RAISE NOTICE 'bookmarks table already exists';
  END IF;
END
$$;

-- Enable RLS (Row Level Security)
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- Create policies safely
DO $$
BEGIN
  -- Articles policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'articles' AND policyname = 'Articles are viewable by everyone') THEN
    CREATE POLICY "Articles are viewable by everyone" ON public.articles
      FOR SELECT USING (true);
    RAISE NOTICE 'Created Articles are viewable by everyone policy';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'articles' AND policyname = 'Articles can be inserted by authenticated users') THEN
    CREATE POLICY "Articles can be inserted by authenticated users" ON public.articles
      FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    RAISE NOTICE 'Created Articles can be inserted by authenticated users policy';
  END IF;

  -- Create a new policy to allow anyone to insert articles
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'articles' AND policyname = 'Anyone can insert articles') THEN
    CREATE POLICY "Anyone can insert articles" ON public.articles
      FOR INSERT WITH CHECK (true);
    RAISE NOTICE 'Created Anyone can insert articles policy';
  END IF;

  -- Profiles policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Public profiles are viewable by everyone') THEN
    CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
      FOR SELECT USING (true);
    RAISE NOTICE 'Created Public profiles are viewable by everyone policy';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can insert their own profile') THEN
    CREATE POLICY "Users can insert their own profile" ON public.profiles
      FOR INSERT WITH CHECK (auth.uid() = id);
    RAISE NOTICE 'Created Users can insert their own profile policy';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update their own profile') THEN
    CREATE POLICY "Users can update their own profile" ON public.profiles
      FOR UPDATE USING (auth.uid() = id);
    RAISE NOTICE 'Created Users can update their own profile policy';
  END IF;

  -- Bookmarks policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bookmarks' AND policyname = 'Users can view their own bookmarks') THEN
    CREATE POLICY "Users can view their own bookmarks" ON public.bookmarks
      FOR SELECT USING (auth.uid() = user_id);
    RAISE NOTICE 'Created Users can view their own bookmarks policy';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bookmarks' AND policyname = 'Users can insert their own bookmarks') THEN
    CREATE POLICY "Users can insert their own bookmarks" ON public.bookmarks
      FOR INSERT WITH CHECK (auth.uid() = user_id);
    RAISE NOTICE 'Created Users can insert their own bookmarks policy';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bookmarks' AND policyname = 'Users can delete their own bookmarks') THEN
    CREATE POLICY "Users can delete their own bookmarks" ON public.bookmarks
      FOR DELETE USING (auth.uid() = user_id);
    RAISE NOTICE 'Created Users can delete their own bookmarks policy';
  END IF;
END
$$; 