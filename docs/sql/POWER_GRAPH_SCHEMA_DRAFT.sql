-- POWER movement graph and instructor metadata: DESIGN-REVIEW DRAFT ONLY.
-- DO NOT execute until repository's actual Supabase project and deployed backend
-- are positively identified, current data/roles are inspected, and RLS
-- policies are reviewed in a staging database.
--
-- IMPORTANT: No seed or fake exercises. All links FK to canonical exercises.
-- RLS enabled on every public table; reads require published/reviewed content.
-- Writes intentionally have NO browser policy. Seed/admin tools must use
-- controlled server-side credentials, never service_role in the frontend.

create table if not exists public.power_goals (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  constraint power_goals_slug_safe check (slug ~ '^[a-z0-9-]+$')
);

create table if not exists public.power_goal_exercises (
  goal_id uuid not null references public.power_goals(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete restrict,
  role text not null default 'skill',
  phase text,
  sequence_hint integer,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  primary key(goal_id,exercise_id),
  constraint power_goal_exercises_role_allowed check
    (role in ('skill','regression','accessory','straight_arm','strength','mobility','assessment'))
);
create index if not exists power_goal_exercises_exercise_idx
  on public.power_goal_exercises(exercise_id);

create table if not exists public.power_exercise_relations (
  id uuid primary key default gen_random_uuid(),
  from_exercise_id uuid not null references public.exercises(id) on delete restrict,
  to_exercise_id uuid not null references public.exercises(id) on delete restrict,
  relation_kind text not null,
  rationale text,
  evidence_grade text not null default 'coach_review_required',
  reviewed_at timestamptz,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  constraint power_exercise_relations_distinct check (from_exercise_id <> to_exercise_id),
  constraint power_exercise_relations_allowed check
    (relation_kind in ('prerequisite','regression','progression','assistance','substitute','strength_transfer','technical_transfer','mobility_requirement')),
  constraint power_exercise_relations_unique unique(from_exercise_id,to_exercise_id,relation_kind)
);
create index if not exists power_exercise_relations_from_idx
  on public.power_exercise_relations(from_exercise_id);
create index if not exists power_exercise_relations_to_idx
  on public.power_exercise_relations(to_exercise_id);

create table if not exists public.power_coaches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  official_site text,
  specialty text[],
  credentials_note text,
  identity_verified_at timestamptz,
  content_partner boolean not null default false,
  published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.power_tutorials (
  id uuid primary key default gen_random_uuid(),
  exercise_id uuid not null references public.exercises(id) on delete restrict,
  coach_id uuid references public.power_coaches(id) on delete set null,
  lesson_stage text,
  provider text not null,
  canonical_url text not null,
  duration_seconds integer,
  captions_url text,
  rights_status text not null default 'unreviewed',
  movement_match_status text not null default 'unreviewed',
  last_reviewed_at timestamptz,
  rights_expire_at timestamptz,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  constraint power_tutorial_provider_allowed check (provider in ('youtube','original','licensed','external')),
  constraint power_tutorial_rights_allowed check
    (rights_status in ('unreviewed','embedding_allowed','licensed','original','restricted','expired')),
  constraint power_tutorial_match_allowed check
    (movement_match_status in ('unreviewed','reviewed_match','mismatch')),
  constraint power_tutorial_duration_nonnegative check
    (duration_seconds is null or duration_seconds >= 0)
);
create index if not exists power_tutorials_exercise_idx
  on public.power_tutorials(exercise_id);

create table if not exists public.power_templates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  goal_id uuid references public.power_goals(id) on delete set null,
  difficulty_band text,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  constraint power_templates_difficulty_allowed check
    (difficulty_band is null or difficulty_band in ('beginner','novice','intermediate','advanced','elite'))
);

create table if not exists public.power_template_slots (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.power_templates(id) on delete cascade,
  exercise_id uuid references public.exercises(id) on delete set null,
  slot_kind text not null,
  slot_order integer not null,
  prescribed_sets integer,
  target_reps integer,
  target_seconds integer,
  created_at timestamptz not null default now(),
  constraint power_template_slots_unique unique(template_id, slot_order),
  constraint power_template_slot_allowed check
    (slot_kind in ('preparation','main_skill','easier_skill','strength','accessory','core','mobility','cooldown')),
  constraint power_template_slot_counts check
    ((prescribed_sets is null or prescribed_sets between 1 and 20) and
     (target_reps is null or target_reps between 0 and 500) and
     (target_seconds is null or target_seconds between 0 and 1800))
);
create index if not exists power_template_slots_exercise_idx
  on public.power_template_slots(exercise_id);

alter table public.power_goals enable row level security;
alter table public.power_goal_exercises enable row level security;
alter table public.power_exercise_relations enable row level security;
alter table public.power_coaches enable row level security;
alter table public.power_tutorials enable row level security;
alter table public.power_templates enable row level security;
alter table public.power_template_slots enable row level security;

-- Published curated data is visible without exposing editorial drafts.
create policy power_goals_public_read on public.power_goals for select to anon,authenticated
  using (published = true);
create policy power_goal_exercises_public_read on public.power_goal_exercises for select to anon,authenticated
  using (published = true and exists (
    select 1 from public.power_goals g where g.id = goal_id and g.published = true
  ));
create policy power_relations_public_read on public.power_exercise_relations for select to anon,authenticated
  using (published = true and reviewed_at is not null);
create policy power_coaches_public_read on public.power_coaches for select to anon,authenticated
  using (published = true);
create policy power_tutorials_public_read on public.power_tutorials for select to anon,authenticated
  using (
    published = true
    and movement_match_status = 'reviewed_match'
    and (
      (provider = 'youtube' and rights_status = 'embedding_allowed')
      or rights_status in ('licensed','original')
    )
    and (rights_expire_at is null or rights_expire_at > now())
  );
create policy power_templates_public_read on public.power_templates for select to anon,authenticated
  using (published = true);
create policy power_template_slots_public_read on public.power_template_slots for select to anon,authenticated
  using (exists (
    select 1 from public.power_templates t where t.id = template_id and t.published = true
  ));

-- Public read grants can require adjustment to match the Data API exposure
-- model in the actual Supabase deployment. RLS filters the visible rows.
grant select on public.power_goals, public.power_goal_exercises,
  public.power_exercise_relations, public.power_coaches,
  public.power_tutorials, public.power_templates, public.power_template_slots
  to anon, authenticated;

-- Staging verification checklist before application:
-- 1. Confirm canonical exercises.id datatype is UUID.
-- 2. Verify user_roles permissions and admin content-write pathway.
-- 3. Verify all seven RLS policies, including negative unauthenticated reads.
-- 4. Confirm only reviewed matching videos can be exposed.
-- 5. Add reciprocal relation and cycle checks in editorial ingestion code.
-- 6. Confirm existing workout JSON remains unchanged.
-- 7. Generate Supabase TypeScript types and perform staging rollback tests.
