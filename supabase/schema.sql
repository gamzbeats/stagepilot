-- StagePilot Database Schema
-- Run this in your Supabase SQL Editor

create table if not exists applications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  company text not null,
  role text not null,
  status text default 'saved' check (status in ('saved', 'applied', 'interview', 'rejected', 'offer')),
  job_description text,
  extracted_skills jsonb,
  notes text,
  applied_at timestamptz,
  created_at timestamptz default now() not null
);

-- Row Level Security
alter table applications enable row level security;

-- Users can only access their own applications
create policy "Users can manage their own applications"
  on applications
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Index for performance
create index if not exists applications_user_id_idx on applications(user_id);
create index if not exists applications_status_idx on applications(status);
create index if not exists applications_created_at_idx on applications(created_at desc);
