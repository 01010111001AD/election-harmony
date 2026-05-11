
-- Member status
DO $$ BEGIN
  CREATE TYPE public.member_status AS ENUM ('active','invited','suspended');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Directory of an org's potential voters
CREATE TABLE IF NOT EXISTS public.org_members_directory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  external_id text,
  tags text[] NOT NULL DEFAULT '{}',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  status public.member_status NOT NULL DEFAULT 'active',
  user_id uuid,
  invited_at timestamptz,
  joined_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, email)
);

CREATE INDEX IF NOT EXISTS idx_omd_org ON public.org_members_directory(organization_id);
CREATE INDEX IF NOT EXISTS idx_omd_tags ON public.org_members_directory USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_omd_email ON public.org_members_directory(email);

ALTER TABLE public.org_members_directory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members read directory" ON public.org_members_directory
  FOR SELECT USING (public.is_org_member(auth.uid(), organization_id));

CREATE POLICY "admins manage directory" ON public.org_members_directory
  FOR ALL USING (public.is_org_admin(auth.uid(), organization_id))
  WITH CHECK (public.is_org_admin(auth.uid(), organization_id));

CREATE TRIGGER trg_omd_touch BEFORE UPDATE ON public.org_members_directory
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- API keys per org for ingest
CREATE TABLE IF NOT EXISTS public.org_api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  key_prefix text NOT NULL,
  key_hash text NOT NULL,
  created_by uuid NOT NULL,
  last_used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_oak_org ON public.org_api_keys(organization_id);
CREATE INDEX IF NOT EXISTS idx_oak_prefix ON public.org_api_keys(key_prefix);

ALTER TABLE public.org_api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members view api keys" ON public.org_api_keys
  FOR SELECT USING (public.is_org_member(auth.uid(), organization_id));

CREATE POLICY "admins manage api keys" ON public.org_api_keys
  FOR ALL USING (public.is_org_admin(auth.uid(), organization_id))
  WITH CHECK (public.is_org_admin(auth.uid(), organization_id));

-- Storage bucket for org logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('org-logos','org-logos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read org logos" ON storage.objects
  FOR SELECT USING (bucket_id = 'org-logos');

CREATE POLICY "Org admins upload logos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'org-logos'
    AND public.is_org_admin(auth.uid(), ((storage.foldername(name))[1])::uuid)
  );

CREATE POLICY "Org admins update logos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'org-logos'
    AND public.is_org_admin(auth.uid(), ((storage.foldername(name))[1])::uuid)
  );

CREATE POLICY "Org admins delete logos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'org-logos'
    AND public.is_org_admin(auth.uid(), ((storage.foldername(name))[1])::uuid)
  );

-- Tag-based voter enrollment
CREATE OR REPLACE FUNCTION public.enroll_voters_by_tag(_election_id uuid, _tag text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _org uuid;
  _owner uuid;
  _count integer := 0;
BEGIN
  SELECT organization_id, owner_id INTO _org, _owner FROM public.elections WHERE id = _election_id;
  IF _org IS NULL THEN RAISE EXCEPTION 'Election has no organization'; END IF;
  IF _owner <> auth.uid() AND NOT public.is_org_admin(auth.uid(), _org) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  WITH inserted AS (
    INSERT INTO public.voter_roll (election_id, email, voting_token)
    SELECT _election_id, m.email, encode(gen_random_bytes(16), 'hex')
    FROM public.org_members_directory m
    WHERE m.organization_id = _org
      AND m.status = 'active'
      AND (_tag IS NULL OR _tag = '' OR _tag = ANY(m.tags))
    ON CONFLICT DO NOTHING
    RETURNING 1
  )
  SELECT count(*) INTO _count FROM inserted;
  RETURN _count;
END $$;
