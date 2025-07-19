drop trigger if exists "shader_visibility_public_insert_webhook" on "public"."shader";

drop trigger if exists "shader_visibility_public_webhook" on "public"."shader";

drop function if exists "public"."notify_discord"();

drop index if exists "public"."idx_shader_author_rls";

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


