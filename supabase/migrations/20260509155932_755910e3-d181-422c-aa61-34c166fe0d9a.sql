CREATE POLICY "open elections public read"
ON public.elections FOR SELECT
TO anon, authenticated
USING (status = 'open');

CREATE POLICY "open election candidates public read"
ON public.candidates FOR SELECT
TO anon, authenticated
USING (EXISTS (SELECT 1 FROM public.elections e WHERE e.id = candidates.election_id AND e.status = 'open'));