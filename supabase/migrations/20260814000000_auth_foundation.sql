-- Authentication foundation: profiles, organizations, memberships, and RLS.

create extension if not exists pgcrypto;

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  owner_id uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text,
  organization_id uuid references public.organizations(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organization_memberships (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create index organization_memberships_user_id_idx on public.organization_memberships (user_id);

create function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
create trigger organizations_set_updated_at before update on public.organizations
for each row execute function public.set_updated_at();

create function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (user_id, full_name)
  values (new.id, nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''));
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

create function public.handle_new_organization()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.organization_memberships (organization_id, user_id)
  values (new.id, new.owner_id);
  return new;
end;
$$;

create trigger organizations_add_owner_membership after insert on public.organizations
for each row execute function public.handle_new_organization();

-- Security-definer helpers avoid RLS policy recursion while keeping table access scoped.
create function public.is_organization_member(target_organization_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.organization_memberships
    where organization_id = target_organization_id and user_id = auth.uid()
  );
$$;

create function public.is_organization_owner(target_organization_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.organizations
    where id = target_organization_id and owner_id = auth.uid()
  );
$$;

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_memberships enable row level security;

create policy "Users can view their own profile" on public.profiles for select to authenticated
using (user_id = auth.uid());
create policy "Users can create their own profile" on public.profiles for insert to authenticated
with check (user_id = auth.uid());
create policy "Users can update their own profile" on public.profiles for update to authenticated
using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "Members can view their organizations" on public.organizations for select to authenticated
using (public.is_organization_member(id));
create policy "Users can create organizations they own" on public.organizations for insert to authenticated
with check (owner_id = auth.uid());
create policy "Owners can update their organizations" on public.organizations for update to authenticated
using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "Owners can delete their organizations" on public.organizations for delete to authenticated
using (owner_id = auth.uid());

create policy "Members can view organization memberships" on public.organization_memberships for select to authenticated
using (user_id = auth.uid() or public.is_organization_owner(organization_id));
create policy "Owners can add organization memberships" on public.organization_memberships for insert to authenticated
with check (public.is_organization_owner(organization_id));
create policy "Owners can remove organization memberships" on public.organization_memberships for delete to authenticated
using (public.is_organization_owner(organization_id));
