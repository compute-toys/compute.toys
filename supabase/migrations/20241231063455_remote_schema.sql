alter table "public"."profile" drop constraint "profile_username_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user_private()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$

declare new_username text;

begin

  new_username := new.raw_user_meta_data->>'username';

  

  if exists (select username, email from public.user where (username = new_username or email = new.email)) 

  then

      raise exception 'Username or email already exists';

  end if;

  

  if exists (select username from public.profile where (username = new_username)) 

  then

      raise exception 'Username or email already exists';

  end if;

  

  insert into public.user (id, email, username)

  values (new.id, new.email, new_username);

  

  insert into public.profile (id, username)

  values (new.id, new_username);

  

  return new;

end;

$function$
;

CREATE OR REPLACE FUNCTION public.notify_discord()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
declare
  shader_url text;
  json_payload text;
  response_record record;
begin
  -- Construct the shader URL
  shader_url := 'https://compute.toys/view/' || new.id;

  -- Create the JSON payload as text
  json_payload := '{"content": "A new shader has been made public: ' || shader_url || '"}';

  -- Perform the HTTP POST request using pgsql-http
--   select
--     "status", "content"::jsonb
--   into response_record
--   from
--     http_post(
--       'https://discord.com/api/webhooks/XXXXXXXXXXXXXXXXXXX/XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
--       json_payload,
--       'application/json'
--     );

  -- Optionally, you can handle the response or log it if needed
  -- Example: raise notice 'Status: %, Response: %', response_record.status, response_record.content;

  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.set_user_on_add_shader()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$

BEGIN

  IF NEW.author IS NULL THEN

    NEW.author := auth.uid();

  END IF;

  RETURN NEW;

END;

$function$
;


