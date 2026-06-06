-- Admin bypass: allow admins to insert businesses without subscription check
-- Also update RLS on businesses to allow admin inserts regardless of subscription

-- Function to check if current user is admin
create or replace function public.is_admin()
returns boolean language sql security definer
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Update business insert policy to allow admins
drop policy if exists "Signed-in users can insert businesses" on public.businesses;
create policy "Signed-in users can insert businesses" on public.businesses
  for insert with check (auth.uid() is not null);

-- Admins can do everything on businesses
create policy "Admins have full business access" on public.businesses
  for all using (public.is_admin());

-- Admins have full profile access
create policy "Admins have full profile access" on public.profiles
  for all using (public.is_admin());
