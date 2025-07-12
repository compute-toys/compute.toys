-- set check_function_bodies = off;

-- CREATE OR REPLACE FUNCTION storage.extension(name text)
--  RETURNS text
--  LANGUAGE plpgsql
-- AS $function$
-- DECLARE
-- _parts text[];
-- _filename text;
-- BEGIN
-- 	select string_to_array(name, '/') into _parts;
-- 	select _parts[array_length(_parts,1)] into _filename;
-- 	-- @todo return the last part instead of 2
-- 	return split_part(_filename, '.', 2);
-- END
-- $function$
-- ;

-- CREATE OR REPLACE FUNCTION storage.filename(name text)
--  RETURNS text
--  LANGUAGE plpgsql
-- AS $function$
-- DECLARE
-- _parts text[];
-- BEGIN
-- 	select string_to_array(name, '/') into _parts;
-- 	return _parts[array_length(_parts,1)];
-- END
-- $function$
-- ;

-- CREATE OR REPLACE FUNCTION storage.foldername(name text)
--  RETURNS text[]
--  LANGUAGE plpgsql
-- AS $function$
-- DECLARE
-- _parts text[];
-- BEGIN
-- 	select string_to_array(name, '/') into _parts;
-- 	return _parts[1:array_length(_parts,1)-1];
-- END
-- $function$
-- ;

-- CREATE OR REPLACE FUNCTION storage.get_size_by_bucket()
--  RETURNS TABLE(size bigint, bucket_id text)
--  LANGUAGE plpgsql
-- AS $function$
-- BEGIN
--     return query
--         select sum((metadata->>'size')::int) as size, obj.bucket_id
--         from "storage".objects as obj
--         group by obj.bucket_id;
-- END
-- $function$
-- ;

create policy "ALL avatars are publicly accessible."
on "storage"."objects"
as permissive
for select
to public
using ((bucket_id = 'avatar'::text));


create policy "ALL shader thumbs are publicly accessible."
on "storage"."objects"
as permissive
for select
to public
using ((bucket_id = 'shaderthumb'::text));


create policy "Authenticated users can insert a shader in their subdirectory."
on "storage"."objects"
as permissive
for insert
to public
with check (((bucket_id = 'shaderthumb'::text) AND (auth.role() = 'authenticated'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));


create policy "Authenticated users can insert an avatar in their subdirectory."
on "storage"."objects"
as permissive
for insert
to public
with check (((bucket_id = 'avatar'::text) AND (auth.role() = 'authenticated'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));


create policy "Authenticated users can update a shader in their subdirectory."
on "storage"."objects"
as permissive
for update
to public
using (((bucket_id = 'shaderthumb'::text) AND (auth.role() = 'authenticated'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])))
with check (((bucket_id = 'shaderthumb'::text) AND (auth.role() = 'authenticated'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));


create policy "Authenticated users can update an avatar in their subdirectory."
on "storage"."objects"
as permissive
for update
to public
using (((bucket_id = 'avatar'::text) AND (auth.role() = 'authenticated'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])))
with check (((bucket_id = 'avatar'::text) AND (auth.role() = 'authenticated'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));



