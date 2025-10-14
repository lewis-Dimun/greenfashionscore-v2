-- Initial schema for GFS
create table if not exists brands (
  id uuid primary key default gen_random_uuid(),
  name text not null
);

create table if not exists product_types (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null
);

create table if not exists surveys (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  version text not null,
  product_type_id uuid references product_types(id)
);

create table if not exists dimensions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  "order" int not null,
  max_points int not null,
  weight_percent int not null
);

create table if not exists questions (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  text_es text not null,
  dimension_id uuid not null references dimensions(id),
  survey_type text not null,
  version text not null,
  weight numeric,
  unique(code, version)
);

create table if not exists answers_catalog (
  id uuid primary key default gen_random_uuid(),
  question_code text not null,
  answer_code text not null,
  text_es text,
  value_points numeric,
  normalized_value numeric,
  unique(question_code, answer_code)
);

create table if not exists survey_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  survey_id uuid not null references surveys(id),
  brand_id uuid references brands(id),
  created_at timestamptz default now()
);

create table if not exists responses (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references survey_submissions(id) on delete cascade,
  question_code text not null,
  raw_value jsonb,
  normalized_value numeric
);

create table if not exists scores (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references survey_submissions(id) on delete cascade,
  total numeric not null,
  per_dimension jsonb not null,
  grade text not null
);

create table if not exists weights (
  id uuid primary key default gen_random_uuid(),
  version text not null unique,
  global_distribution jsonb not null
);

create table if not exists grading_thresholds (
  id uuid primary key default gen_random_uuid(),
  version text not null unique,
  thresholds jsonb not null
);


