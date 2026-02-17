-- Smart Bookmark App - Supabase SQL Schema
-- Run this in your Supabase SQL Editor

-- Create bookmarks table
create table public.bookmarks (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  url text not null,
  user_id uuid references auth.users(id) on delete cascade not null
);

-- Enable Row Level Security
alter table public.bookmarks enable row level security;

-- Create policy for users to view only their own bookmarks
create policy "Users can view their own bookmarks"
  on public.bookmarks for select
  using (auth.uid() = user_id);

-- Create policy for users to insert their own bookmarks
create policy "Users can insert their own bookmarks"
  on public.bookmarks for insert
  with check (auth.uid() = user_id);

-- Create policy for users to update their own bookmarks
create policy "Users can update their own bookmarks"
  on public.bookmarks for update
  using (auth.uid() = user_id);

-- Create policy for users to delete their own bookmarks
create policy "Users can delete their own bookmarks"
  on public.bookmarks for delete
  using (auth.uid() = user_id);

-- Create an index for better query performance
create index bookmarks_user_id_idx on public.bookmarks(user_id);

-- Create an index for created_at for efficient sorting
create index bookmarks_created_at_idx on public.bookmarks(created_at desc);

-- Optional: Create a function to get bookmark count for a user
create or replace function get_bookmark_count(user_uuid uuid)
returns integer as $$
  select count(*)::integer
  from public.bookmarks
  where user_id = user_uuid;
$$ language sql stable;
