
-- Organizations
CREATE TABLE public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  logo_url text,
  brand_color text DEFAULT '#0B1F3A',
  accent_color text DEFAULT '#C9A227',
  tagline text,
  parent_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TYPE public.org_member_role AS ENUM ('owner','admin','member','observer');

CREATE TABLE public.organization_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role org_member_role NOT NULL DEFAULT 'member',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, user_id)
);

ALTER TABLE public.elections ADD COLUMN organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL;

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- Helpers
CREATE OR REPLACE FUNCTION public.is_org_member(_user_id uuid, _org_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.organization_members WHERE user_id=_user_id AND organization_id=_org_id) $$;

CREATE OR REPLACE FUNCTION public.is_org_admin(_user_id uuid, _org_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.organization_members WHERE user_id=_user_id AND organization_id=_org_id AND role IN ('owner','admin')) $$;

-- Organizations policies
CREATE POLICY "branding readable to all" ON public.organizations FOR SELECT USING (true);
CREATE POLICY "members create orgs" ON public.organizations FOR INSERT WITH CHECK (created_by = auth.uid());
CREATE POLICY "admins update org" ON public.organizations FOR UPDATE USING (public.is_org_admin(auth.uid(), id));
CREATE POLICY "owners delete org" ON public.organizations FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.organization_members WHERE organization_id=id AND user_id=auth.uid() AND role='owner')
);

-- Members policies
CREATE POLICY "members read roster" ON public.organization_members FOR SELECT USING (
  user_id = auth.uid() OR public.is_org_member(auth.uid(), organization_id)
);
CREATE POLICY "admins manage members" ON public.organization_members FOR ALL
  USING (public.is_org_admin(auth.uid(), organization_id) OR user_id = auth.uid())
  WITH CHECK (public.is_org_admin(auth.uid(), organization_id) OR user_id = auth.uid());

-- Auto-add creator as owner
CREATE OR REPLACE FUNCTION public.handle_new_org()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.organization_members(organization_id, user_id, role) VALUES (NEW.id, NEW.created_by, 'owner');
  RETURN NEW;
END $$;

CREATE TRIGGER on_org_created AFTER INSERT ON public.organizations
FOR EACH ROW EXECUTE FUNCTION public.handle_new_org();

CREATE TRIGGER touch_orgs BEFORE UPDATE ON public.organizations
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Extend elections RLS for org members & observers
CREATE POLICY "org members read elections" ON public.elections FOR SELECT
  USING (organization_id IS NOT NULL AND public.is_org_member(auth.uid(), organization_id));
