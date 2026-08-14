-- Certificate infrastructure and safe public verification.

create extension if not exists pgcrypto;

-- Tighten the inherited profile policies before the certificate UI uses
-- organization_id to resolve a user's active organization.
drop policy if exists "Users can create their own profile" on public.profiles;
create policy "Users can create their own profile"
on public.profiles for insert
to authenticated
with check (
  user_id = auth.uid()
  and (organization_id is null or public.is_organization_member(organization_id))
);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles for update
to authenticated
using (user_id = auth.uid())
with check (
  user_id = auth.uid()
  and (organization_id is null or public.is_organization_member(organization_id))
);

create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  certificate_id text not null unique,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  recipient_name text not null,
  recipient_email text,
  title text not null,
  description text,
  issue_date date not null default current_date,
  status text not null default 'issued' check (status in ('issued', 'revoked')),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint certificates_public_id_format check (certificate_id ~ '^CERT-[A-Z0-9]{12}$')
);

create index certificates_organization_id_idx on public.certificates (organization_id);
create index certificates_created_by_idx on public.certificates (created_by);
create index certificates_status_idx on public.certificates (status);

create function public.generate_certificate_id()
returns text
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  candidate text;
begin
  loop
    candidate := 'CERT-' || upper(encode(gen_random_bytes(6), 'hex'));
    exit when not exists (
      select 1 from public.certificates where certificate_id = candidate
    );
  end loop;
  return candidate;
end;
$$;

alter table public.certificates
  alter column certificate_id set default public.generate_certificate_id();

create trigger certificates_set_updated_at
before update on public.certificates
for each row execute function public.set_updated_at();

create function public.prevent_certificate_identity_change()
returns trigger
language plpgsql
set search_path = public, pg_catalog
as $$
begin
  if new.certificate_id <> old.certificate_id
    or new.organization_id <> old.organization_id
    or new.created_by <> old.created_by then
    raise exception 'Certificate identity cannot be changed';
  end if;
  return new;
end;
$$;

create trigger certificates_prevent_identity_change
before update on public.certificates
for each row execute function public.prevent_certificate_identity_change();

alter table public.certificates enable row level security;

create policy "Organization members can view certificates"
on public.certificates for select
to authenticated
using (public.is_organization_member(organization_id));

create policy "Organization members can create certificates"
on public.certificates for insert
to authenticated
with check (
  created_by = auth.uid()
  and public.is_organization_member(organization_id)
);

create policy "Creators and owners can update certificates"
on public.certificates for update
to authenticated
using (
  created_by = auth.uid()
  or public.is_organization_owner(organization_id)
)
with check (
  public.is_organization_member(organization_id)
  and (created_by = auth.uid() or public.is_organization_owner(organization_id))
);

create policy "Creators and owners can delete certificates"
on public.certificates for delete
to authenticated
using (
  created_by = auth.uid()
  or public.is_organization_owner(organization_id)
);

create or replace function public.verify_certificate(lookup_certificate_id text)
returns table (
  certificate_id text,
  recipient_name text,
  title text,
  description text,
  issue_date date,
  status text,
  organization_name text
)
language sql
stable
security definer
set search_path = public, pg_catalog
as $$
  select
    c.certificate_id,
    c.recipient_name,
    c.title,
    c.description,
    c.issue_date,
    c.status,
    o.name as organization_name
  from public.certificates as c
  join public.organizations as o on o.id = c.organization_id
  where c.certificate_id = upper(trim(lookup_certificate_id))
  limit 1;
$$;

revoke all on function public.generate_certificate_id() from public;
revoke all on function public.verify_certificate(text) from public;
grant execute on function public.generate_certificate_id() to authenticated;
grant execute on function public.verify_certificate(text) to anon, authenticated;
