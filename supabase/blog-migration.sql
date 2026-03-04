-- ============================================================
-- Blog Posts table
-- Run in Supabase SQL Editor after the main migration.sql
-- ============================================================

create table if not exists public.blog_posts (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  title text not null,
  excerpt text not null default '',
  content text not null default '',
  category text not null default 'Announcement',
  cover_image_url text,
  author_name text not null default 'Tynkerlab.ai Team',
  author_role text not null default 'Engineering',
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  read_time text not null default '3 min read',
  meta_title text,
  meta_description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index for public listing (published posts by date)
create index if not exists idx_blog_posts_published
  on public.blog_posts (status, published_at desc);

-- Unique slug index
create unique index if not exists idx_blog_posts_slug
  on public.blog_posts (slug);

-- Enable RLS
alter table public.blog_posts enable row level security;

-- Public can read published posts
create policy "Public can read published blog posts"
  on public.blog_posts for select
  using (status = 'published');

-- Service role bypasses RLS for admin operations
-- (admin API routes use createAdminClient which uses service role)

-- Auto-update updated_at
create or replace function update_blog_posts_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger blog_posts_updated_at
  before update on public.blog_posts
  for each row execute function update_blog_posts_updated_at();
