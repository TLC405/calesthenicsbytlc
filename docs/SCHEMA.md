# TLC Planner - Database Schema

## Overview

TLC Planner uses PostgreSQL with Row Level Security (RLS) policies for data protection.

## Tables

### profiles
Extends auth.users with additional user information.

```sql
- id: UUID (PK, references auth.users)
- email: TEXT
- display_name: TEXT
- role: app_role ENUM (user, coach, admin)
- pin_hash: TEXT (optional second factor)
- pin_salt: TEXT (for PIN hashing)
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

### user_roles
Role-based access control table.

```sql
- id: UUID (PK)
- user_id: UUID (FK to profiles)
- role: app_role ENUM
- created_at: TIMESTAMPTZ
```

### exercises
Exercise library with detailed metadata.

```sql
- id: UUID (PK)
- slug: TEXT (unique)
- name: TEXT
- category: TEXT
- primary_muscles: TEXT[]
- secondary_muscles: TEXT[]
- equipment: TEXT[]
- cues: JSONB (coaching points)
- media_url: TEXT (optional)
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

### progressions
Skill progression pathways.

```sql
- id: UUID (PK)
- exercise_id: UUID (FK to exercises)
- level: INTEGER
- name: TEXT
- description: TEXT
- prerequisites: JSONB
- created_at: TIMESTAMPTZ
```

### workout_templates
Reusable workout structures.

```sql
- id: UUID (PK)
- owner_id: UUID (FK to profiles)
- name: TEXT
- blocks: JSONB (workout structure)
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

### workouts
Logged training sessions.

```sql
- id: UUID (PK)
- user_id: UUID (FK to profiles)
- date: DATE
- notes: TEXT
- entries: JSONB (exercises, sets, reps)
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

### analytics_events
User activity tracking.

```sql
- id: UUID (PK)
- user_id: UUID (FK to profiles, nullable)
- kind: TEXT
- payload: JSONB
- created_at: TIMESTAMPTZ
```

### feature_flags
Toggle features for different audiences.

```sql
- key: TEXT (PK)
- enabled: BOOLEAN
- audience: JSONB
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

## RLS Policies

### Security Model

- **Users** can only access their own data
- **Coaches** can view client workouts and templates
- **Admins** have full access to all data
- Exercise library is publicly readable

### Role Checking

Uses security definer function `has_role()` to prevent RLS recursion:

```sql
CREATE FUNCTION has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
```

## Triggers

### Auto-Update Timestamps
Tables with `updated_at` columns use triggers to automatically update on modification.

### Auto-Create Profile
When a user signs up, a trigger creates their profile and assigns the 'user' role.

## Indexes

- Primary keys on all `id` columns
- Unique constraint on `exercises.slug`
- Unique constraint on `user_roles(user_id, role)`
- Foreign key indexes for relationships

## JSONB Structures

### workout_templates.blocks
```json
[
  {
    "type": "warm-up",
    "duration": 300,
    "exercises": []
  },
  {
    "type": "strength",
    "exercises": [
      {
        "id": "uuid",
        "sets": 3,
        "reps": 8,
        "rest": 120
      }
    ]
  }
]
```

### workouts.entries
```json
[
  {
    "exercise_id": "uuid",
    "sets": [
      {
        "reps": 8,
        "rpe": 7,
        "tempo": "3010"
      }
    ]
  }
]
```

### exercises.cues
```json
[
  "Keep core tight",
  "Full range of motion",
  "Control the descent"
]
```

## Migrations

All schema changes are managed through Lovable Cloud migrations. See `/supabase/migrations/` for history.
