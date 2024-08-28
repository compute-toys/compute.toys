SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- Dumped from database version 15.1 (Debian 15.1-1.pgdg110+1)
-- Dumped by pg_dump version 15.7 (Ubuntu 15.7-1.pgdg20.04+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', '73aa2740-4bcc-4805-9582-36099b8bb08f', 'authenticated', 'authenticated', 'user@example.com', '$2a$10$O8VlU9qGXkLM1gSo.zTXnuYqGdx0N.dm9dLMeZrqJK3AQb4FkB73W', '2024-08-27 11:18:14.260273+00', NULL, '', NULL, '', NULL, '', '', NULL, '2024-08-27 11:19:50.962962+00', '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2024-08-27 11:18:14.213863+00', '2024-08-27 11:19:51.050923+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('73aa2740-4bcc-4805-9582-36099b8bb08f', '73aa2740-4bcc-4805-9582-36099b8bb08f', '{"sub": "73aa2740-4bcc-4805-9582-36099b8bb08f", "email": "user@example.com", "email_verified": false, "phone_verified": false}', 'email', '2024-08-27 11:18:14.258054+00', '2024-08-27 11:18:14.258102+00', '2024-08-27 11:18:14.258102+00', 'c70d6336-85e9-429f-aaa0-d12000934c0c');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: key; Type: TABLE DATA; Schema: pgsodium; Owner: supabase_admin
--



--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."user" ("id", "email", "username") VALUES
	('73aa2740-4bcc-4805-9582-36099b8bb08f', 'user@example.com', 'user');


--
-- Data for Name: profile; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."profile" ("id", "username", "created_at", "about", "avatar_url") VALUES
	('73aa2740-4bcc-4805-9582-36099b8bb08f', 'user', '2024-08-27 11:18:14.213524+00', 'Bio', '73aa2740-4bcc-4805-9582-36099b8bb08f/avatar.png');


--
-- Data for Name: shader; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."shader" ("id", "created_at", "name", "description", "license", "body", "author", "visibility", "thumb_url") VALUES
	(1, '2024-08-27 11:19:57.782122+00', 'New Shader', '', NULL, '"{\"code\":\"\\\"\\\\n@compute @workgroup_size(16, 16)\\\\nfn main_image(@builtin(global_invocation_id) id: vec3u) {\\\\n    // Viewport resolution (in pixels)\\\\n    let screen_size = textureDimensions(screen);\\\\n\\\\n    // Prevent overdraw for workgroups on the edge of the viewport\\\\n    if (id.x >= screen_size.x || id.y >= screen_size.y) { return; }\\\\n\\\\n    // Pixel coordinates (centre of pixel, origin at bottom left)\\\\n    let fragCoord = vec2f(f32(id.x) + .5, f32(screen_size.y - id.y) - .5);\\\\n\\\\n    // Normalised pixel coordinates (from 0 to 1)\\\\n    let uv = fragCoord / vec2f(screen_size);\\\\n\\\\n    // Time varying pixel colour\\\\n    var col = .5 + .5 * cos(time.elapsed + uv.xyx + vec3f(0.,2.,4.));\\\\n\\\\n    // Convert from gamma-encoded to linear colour space\\\\n    col = pow(col, vec3f(2.2));\\\\n\\\\n    // Output to screen (linear colour space)\\\\n    textureStore(screen, id.xy, vec4f(col, 1.));\\\\n}\\\\n\\\"\",\"uniforms\":[],\"textures\":[{\"img\":\"/textures/blank.png\"},{\"img\":\"/textures/blank.png\"}],\"float32Enabled\":false}"', '73aa2740-4bcc-4805-9582-36099b8bb08f', 'public', '73aa2740-4bcc-4805-9582-36099b8bb08f/1.jpg');


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: hooks; Type: TABLE DATA; Schema: supabase_functions; Owner: supabase_functions_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--



--
-- Name: key_key_id_seq; Type: SEQUENCE SET; Schema: pgsodium; Owner: supabase_admin
--

SELECT pg_catalog.setval('"pgsodium"."key_key_id_seq"', 1, false);


--
-- Name: shader_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."shader_id_seq"', 1, true);


--
-- Name: hooks_id_seq; Type: SEQUENCE SET; Schema: supabase_functions; Owner: supabase_functions_admin
--

SELECT pg_catalog.setval('"supabase_functions"."hooks_id_seq"', 1, false);


--
-- PostgreSQL database dump complete
--

RESET ALL;
