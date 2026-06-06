-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "postgis";

-- ─── ENUMS ────────────────────────────────────────────────────────────────────

create type user_role as enum ('user', 'free_owner', 'paid_owner', 'moderator', 'admin');
create type business_status as enum ('pending', 'active', 'suspended', 'rejected');
create type subscription_status as enum ('none', 'active', 'past_due', 'canceled');
create type business_category as enum (
  'food-dining', 'beauty-wellness', 'health-medical', 'legal-financial',
  'home-construction', 'automotive', 'professional-services', 'education-childcare',
  'retail-products', 'faith-community', 'real-estate', 'entertainment-travel'
);
create type analytics_event_type as enum (
  'view', 'phone_click', 'website_click', 'directions_click',
  'share', 'checkin', 'follow', 'recommendation'
);
create type boost_type as enum ('7day', '30day');

-- ─── USER PROFILES ────────────────────────────────────────────────────────────

create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  role user_role not null default 'user',
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── BUSINESSES ───────────────────────────────────────────────────────────────

create table public.businesses (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references public.profiles(id) on delete set null,
  slug text unique not null,
  name text not null,
  category business_category not null,
  status business_status not null default 'pending',
  subscription_status subscription_status not null default 'none',
  stripe_customer_id text,
  stripe_subscription_id text,

  -- Location
  address text,
  city text not null,
  state char(2) not null,
  zip text,
  location geometry(Point, 4326),
  is_mobile_service boolean not null default false,

  -- Branding
  logo_url text,
  cover_photo_url text,
  photos text[] not null default '{}',
  description text,

  -- Contact (visible on paid pages)
  phone text,
  website text,
  email text,
  hours jsonb,

  -- Trust
  gold_shield boolean not null default false,
  honor_pledge boolean not null default false,
  sos_verified boolean not null default false,
  phone_verified boolean not null default false,
  website_reachable boolean not null default false,
  proof_photo_url text,
  shield_approved_at timestamptz,
  shield_approved_by uuid references public.profiles(id),

  -- Social
  external_rating_url text,
  rating_avg numeric(3,2),
  rating_count integer not null default 0,
  checkin_count integer not null default 0,
  follow_count integer not null default 0,

  -- Meta
  profile_completion integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index businesses_location_idx on public.businesses using gist(location);
create index businesses_city_state_idx on public.businesses(city, state);
create index businesses_category_idx on public.businesses(category);
create index businesses_status_idx on public.businesses(status);
create index businesses_slug_idx on public.businesses(slug);

alter table public.businesses enable row level security;

create policy "Active businesses are publicly visible" on public.businesses
  for select using (status = 'active');

create policy "Owners can see their own business" on public.businesses
  for select using (owner_id = auth.uid());

create policy "Owners can update their own business" on public.businesses
  for update using (owner_id = auth.uid());

create policy "Signed-in users can insert businesses" on public.businesses
  for insert with check (auth.uid() is not null);

-- ─── RATINGS ──────────────────────────────────────────────────────────────────

create table public.ratings (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references public.businesses(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  score integer not null check (score >= 3 and score <= 5),
  created_at timestamptz not null default now(),
  unique(business_id, user_id)
);

alter table public.ratings enable row level security;

create policy "Ratings are publicly visible" on public.ratings for select using (true);
create policy "Users can rate businesses" on public.ratings
  for insert with check (auth.uid() = user_id);
create policy "Users can update their rating" on public.ratings
  for update using (auth.uid() = user_id);

-- ─── CHECK-INS ────────────────────────────────────────────────────────────────

create table public.checkins (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references public.businesses(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.checkins enable row level security;
create policy "Checkins are insertable by auth users" on public.checkins
  for insert with check (auth.uid() = user_id);

-- ─── FOLLOWS ──────────────────────────────────────────────────────────────────

create table public.follows (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references public.businesses(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(business_id, user_id)
);

alter table public.follows enable row level security;
create policy "Users can follow/unfollow" on public.follows
  for all using (auth.uid() = user_id);

-- ─── SAVES / FAVORITES ────────────────────────────────────────────────────────

create table public.saves (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references public.businesses(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(business_id, user_id)
);

alter table public.saves enable row level security;
create policy "Users manage their own saves" on public.saves
  for all using (auth.uid() = user_id);

-- ─── EVENTS ───────────────────────────────────────────────────────────────────

create table public.events (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references public.businesses(id) on delete cascade,
  title text not null,
  description text,
  start_date timestamptz not null,
  end_date timestamptz,
  location text,
  image_url text,
  is_free boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.events enable row level security;
create policy "Events are publicly visible" on public.events for select using (true);
create policy "Owners manage their own events" on public.events
  for all using (
    exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
  );

-- ─── DEALS ────────────────────────────────────────────────────────────────────

create table public.deals (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references public.businesses(id) on delete cascade,
  title text not null,
  description text,
  discount_text text,
  expires_at timestamptz,
  image_url text,
  created_at timestamptz not null default now()
);

alter table public.deals enable row level security;
create policy "Deals are publicly visible" on public.deals for select using (true);
create policy "Owners manage their deals" on public.deals
  for all using (
    exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
  );

-- ─── JOBS ─────────────────────────────────────────────────────────────────────

create table public.jobs (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references public.businesses(id) on delete cascade,
  title text not null,
  description text,
  location text,
  is_remote boolean not null default false,
  pay_range text,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table public.jobs enable row level security;
create policy "Jobs are publicly visible" on public.jobs for select using (true);
create policy "Owners manage their jobs" on public.jobs
  for all using (
    exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
  );

-- ─── COMMUNITY REQUESTS ───────────────────────────────────────────────────────

create table public.community_requests (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  category business_category,
  city text not null,
  state char(2) not null,
  is_open boolean not null default true,
  reply_count integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.community_requests enable row level security;
create policy "Requests are publicly visible" on public.community_requests
  for select using (true);
create policy "Auth users can post requests" on public.community_requests
  for insert with check (auth.uid() = user_id);

create table public.community_replies (
  id uuid primary key default uuid_generate_v4(),
  request_id uuid references public.community_requests(id) on delete cascade,
  business_id uuid references public.businesses(id) on delete cascade,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.community_replies enable row level security;
-- Only paid owners can see replies (enforced in application layer via RLS)
create policy "Paid owners can manage replies" on public.community_replies
  for all using (
    exists (
      select 1 from public.businesses b
      where b.id = business_id
        and b.owner_id = auth.uid()
        and b.subscription_status = 'active'
    )
  );

-- ─── ANALYTICS EVENTS ─────────────────────────────────────────────────────────

create table public.analytics_events (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references public.businesses(id) on delete cascade,
  event_type analytics_event_type not null,
  user_id uuid references public.profiles(id) on delete set null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index analytics_events_business_idx on public.analytics_events(business_id);
create index analytics_events_created_idx on public.analytics_events(created_at);

alter table public.analytics_events enable row level security;
create policy "Anyone can insert analytics" on public.analytics_events
  for insert with check (true);
create policy "Owners see their business analytics" on public.analytics_events
  for select using (
    exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
  );

-- ─── SPOTLIGHT ────────────────────────────────────────────────────────────────

create table public.spotlights (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references public.businesses(id) on delete cascade,
  week_of date not null unique,
  blurb text,
  created_at timestamptz not null default now()
);

alter table public.spotlights enable row level security;
create policy "Spotlights are publicly visible" on public.spotlights for select using (true);

-- ─── BOOSTS ───────────────────────────────────────────────────────────────────

create table public.boosts (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references public.businesses(id) on delete cascade,
  city text not null,
  state char(2) not null,
  category business_category,
  boost_type boost_type not null,
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table public.boosts enable row level security;
create policy "Boosts viewable by all" on public.boosts for select using (true);

-- ─── REPORTS ──────────────────────────────────────────────────────────────────

create table public.reports (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references public.businesses(id) on delete cascade,
  reporter_id uuid references public.profiles(id) on delete set null,
  reason text not null,
  details text,
  resolved boolean not null default false,
  resolved_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

alter table public.reports enable row level security;
create policy "Auth users can submit reports" on public.reports
  for insert with check (auth.uid() = reporter_id);

-- ─── SHIELD QUEUE ─────────────────────────────────────────────────────────────

create table public.shield_applications (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references public.businesses(id) on delete cascade unique,
  stripe_payment_intent_id text,
  proof_photo_url text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewer_id uuid references public.profiles(id),
  reviewer_notes text,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz
);

alter table public.shield_applications enable row level security;
create policy "Owners can see their shield app" on public.shield_applications
  for select using (
    exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
  );
