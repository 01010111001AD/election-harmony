create or replace function public.claim_election_admin()
returns void language plpgsql security definer set search_path=public as $$
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  insert into public.user_roles(user_id, role)
  values (auth.uid(), 'election_admin')
  on conflict do nothing;
end $$;