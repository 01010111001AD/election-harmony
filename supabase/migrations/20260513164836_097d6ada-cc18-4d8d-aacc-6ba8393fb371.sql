
-- Storage bucket for candidate photos
insert into storage.buckets (id, name, public)
values ('candidate-photos', 'candidate-photos', true)
on conflict (id) do nothing;

create policy "Candidate photos public read"
on storage.objects for select
using (bucket_id = 'candidate-photos');

create policy "Election owners upload candidate photos"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'candidate-photos'
  and exists (
    select 1 from public.elections e
    where e.id::text = (storage.foldername(name))[1]
      and e.owner_id = auth.uid()
  )
);

create policy "Election owners update candidate photos"
on storage.objects for update
to authenticated
using (
  bucket_id = 'candidate-photos'
  and exists (
    select 1 from public.elections e
    where e.id::text = (storage.foldername(name))[1]
      and e.owner_id = auth.uid()
  )
);

create policy "Election owners delete candidate photos"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'candidate-photos'
  and exists (
    select 1 from public.elections e
    where e.id::text = (storage.foldername(name))[1]
      and e.owner_id = auth.uid()
  )
);

-- Cascade delete RPC
create or replace function public.delete_election(_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not (public.owns_election(auth.uid(), _id) or public.has_role(auth.uid(), 'platform_admin')) then
    raise exception 'Not authorized';
  end if;
  delete from public.ballots where election_id = _id;
  delete from public.voter_roll where election_id = _id;
  delete from public.candidates where election_id = _id;
  delete from public.audit_log where election_id = _id;
  delete from public.elections where id = _id;
end $$;

-- Public tally RPC (no individual ballots leaked)
create or replace function public.tally_election(_id uuid)
returns table (candidate_id uuid, name text, photo_url text, votes bigint)
language plpgsql
security definer
stable
set search_path = public
as $$
declare
  _status election_status;
begin
  select status into _status from public.elections where id = _id;
  if _status is null then return; end if;
  if _status not in ('open','closed','certified') then return; end if;

  return query
  with sel as (
    select case
      when jsonb_typeof(b.selections) = 'array'
        then (select array_agg(value::text) from jsonb_array_elements_text(b.selections) value)
      when jsonb_typeof(b.selections) = 'object' and b.selections ? 'choices'
        then (select array_agg(value::text) from jsonb_array_elements_text(b.selections->'choices') value)
      when jsonb_typeof(b.selections) = 'object' and b.selections ? 'ranking'
        then array[(b.selections->'ranking'->>0)]
      when jsonb_typeof(b.selections) = 'object' and b.selections ? 'vote'
        then array[b.selections->>'vote']
      else array[]::text[]
    end as ids
    from public.ballots b
    where b.election_id = _id
  ),
  flat as (
    select unnest(ids) as cid from sel
  )
  select c.id, c.name, c.photo_url, coalesce(count(f.cid),0)::bigint
  from public.candidates c
  left join flat f on f.cid = c.id::text
  where c.election_id = _id
  group by c.id, c.name, c.photo_url, c.display_order
  order by c.display_order;
end $$;

grant execute on function public.tally_election(uuid) to anon, authenticated;
grant execute on function public.delete_election(uuid) to authenticated;

-- Realtime on ballots
alter publication supabase_realtime add table public.ballots;
