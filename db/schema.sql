create table if not exists site_settings (
  id smallint primary key default 1 check (id = 1),
  welcome_message text not null default 'Welcome. We gather to grow in Christ, study Scripture, and serve one another in love.',
  next_meeting_title text not null default 'Sunday Fellowship & Bible Study',
  next_meeting_time timestamptz,
  next_meeting_location text not null default 'Main Fellowship Hall',
  next_meeting_details text not null default 'Join us for worship, fellowship, and guided Scripture study.',
  contact_email text default '',
  contact_phone text default '',
  contact_address text default '',
  updated_at timestamptz not null default now()
);

insert into site_settings (id) values (1) on conflict (id) do nothing;

create table if not exists leaders (
  id bigserial primary key,
  name text not null,
  role text not null,
  bio text not null default '',
  email text default '',
  created_at timestamptz not null default now()
);

create table if not exists events (
  id bigserial primary key,
  title text not null,
  description text not null default '',
  location text not null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  recurrence_type text not null default 'NONE' check (recurrence_type in ('NONE', 'WEEKLY')),
  recurrence_until timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists events_start_at_idx on events (start_at);
create index if not exists events_recurrence_type_idx on events (recurrence_type);

create table if not exists studies (
  id bigserial primary key,
  slug text not null unique,
  title text not null,
  summary text not null default '',
  study_date date not null default current_date,
  body_md text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

alter table studies
add column if not exists deleted_at timestamptz;

alter table studies
add column if not exists summary text;

alter table studies
add column if not exists study_date date;

update studies
set summary = left(trim(regexp_replace(body_md, E'[\\r\\n]+', ' ', 'g')), 320)
where summary is null
   or btrim(summary) = '';

update studies
set study_date = created_at::date
where study_date is null;

alter table studies
alter column summary set default '';

alter table studies
alter column summary set not null;

alter table studies
alter column study_date set default current_date;

alter table studies
alter column study_date set not null;

create index if not exists studies_deleted_at_idx on studies (deleted_at);
create index if not exists studies_study_date_idx on studies (study_date desc);

create table if not exists study_tags (
  id bigserial primary key,
  name text not null unique
);

create table if not exists study_tag_links (
  study_id bigint not null references studies(id) on delete cascade,
  tag_id bigint not null references study_tags(id) on delete cascade,
  primary key (study_id, tag_id)
);

create index if not exists study_tags_name_idx on study_tags (name);

create table if not exists prayer_requests (
  id bigserial primary key,
  requester_name text,
  requester_email text,
  is_anonymous boolean not null default true,
  request_text text not null,
  reviewed boolean not null default false,
  reviewer_note text not null default '',
  submitted_ip_hash text not null,
  created_at timestamptz not null default now()
);

create index if not exists prayer_requests_created_at_idx on prayer_requests (created_at desc);
create index if not exists prayer_requests_reviewed_idx on prayer_requests (reviewed);

create table if not exists resources_links (
  id bigserial primary key,
  category text not null check (category in ('BOOK', 'ARTICLE', 'TOOL')),
  title text not null,
  url text not null,
  description text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists rate_limits (
  action text not null,
  identifier text not null,
  window_start timestamptz not null,
  request_count integer not null default 0,
  primary key (action, identifier, window_start)
);

create index if not exists rate_limits_window_start_idx on rate_limits (window_start);
