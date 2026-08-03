-- ============================================================================
-- RANKED QUIZ — User management + gamification
-- ============================================================================
-- Colle ce fichier entier dans Supabase > SQL Editor > Run.
-- Idempotent : tu peux le relancer sans casser l'existant.
--
-- NOTE sur le nommage : la table s'appelle `profiles` et non `users`.
-- Supabase possede deja `auth.users` (gere par le systeme d'auth). Creer un
-- `public.users` en parallele est une source de confusion permanente et
-- empeche la contrainte de cle etrangere propre vers l'auth. `profiles` est
-- la convention Supabase officielle.
-- ============================================================================

-- ---------------------------------------------------------------- extensions
create extension if not exists "pgcrypto";

-- ================================================================== PROFILES
create table if not exists public.profiles (
  id                uuid primary key references auth.users(id) on delete cascade,
  email             text unique not null,
  username          text unique not null,
  level             integer not null default 1 check (level >= 1 and level <= 100),
  total_xp          integer not null default 0 check (total_xp >= 0),
  profile_photo_url text,
  avatar_default    text not null default 'avatar_1',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

comment on table public.profiles is 'Profil public d''un joueur, 1-1 avec auth.users.';

-- ===================================================================== GAMES
create table if not exists public.games (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references public.profiles(id) on delete cascade,
  mode                  text not null default 'time_attack'
                          check (mode in ('time_attack','jetpunk','quiz_du_jour','1vs1','ranked','chaos','thematique')),
  score                 integer not null check (score >= 0),
  correct_answers       integer not null check (correct_answers >= 0),
  total_questions       integer not null check (total_questions > 0),
  longest_streak        integer not null default 0 check (longest_streak >= 0),
  avg_time_per_question double precision not null default 0 check (avg_time_per_question >= 0),
  difficulty            text not null default 'mixed'
                          check (difficulty in ('easy','medium','hard','mixed')),
  xp_earned             integer not null default 0 check (xp_earned >= 0),
  played_at             timestamptz not null default now(),
  week_number           text not null,          -- 'YYYY-Www' (ISO), ex: 2026-W32
  season                integer not null default 1,
  constraint games_correct_lte_total check (correct_answers <= total_questions)
);

-- ====================================================== LEADERBOARD (weekly)
create table if not exists public.leaderboard_weekly (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  week          text not null,
  rank          integer,
  total_xp_week integer not null default 0,
  games_count   integer not null default 0,
  avg_score     double precision not null default 0,
  best_score    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (user_id, week)
);

-- ===================================================== LEADERBOARD (alltime)
create table if not exists public.leaderboard_alltime (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null unique references public.profiles(id) on delete cascade,
  rank        integer,
  total_xp    integer not null default 0,
  games_count integer not null default 0,
  best_score  integer not null default 0,
  best_streak integer not null default 0,
  updated_at  timestamptz not null default now()
);

-- =================================================================== INDEXES
create index if not exists idx_games_user_id        on public.games(user_id);
create index if not exists idx_games_week           on public.games(week_number);
create index if not exists idx_games_user_played    on public.games(user_id, played_at desc);
create index if not exists idx_games_mode           on public.games(mode);

create index if not exists idx_lb_weekly_rank       on public.leaderboard_weekly(week, rank);
create index if not exists idx_lb_weekly_xp         on public.leaderboard_weekly(week, total_xp_week desc);
create index if not exists idx_lb_alltime_rank      on public.leaderboard_alltime(rank);
create index if not exists idx_lb_alltime_xp        on public.leaderboard_alltime(total_xp desc);

create index if not exists idx_profiles_total_xp    on public.profiles(total_xp desc);

-- ================================================================== HELPERS
-- Semaine ISO au format 2026-W32. Le lundi 00:00 UTC ouvre une nouvelle semaine.
create or replace function public.iso_week(ts timestamptz default now())
returns text language sql immutable as $$
  select to_char(ts at time zone 'UTC', 'IYYY-"W"IW');
$$;

-- Niveau derive de l'XP : 500 XP par niveau, cap 100.
-- Doit rester synchrone avec src/lib/xp.ts (calculateLevelFromXp).
create or replace function public.level_from_xp(p_xp integer)
returns integer language sql immutable as $$
  select least(100, greatest(1, (p_xp / 500) + 1));
$$;

-- ------------------------------------------------------------- FORMULE XP --
-- base    = score / total_questions
-- bonus   = pourcentages de la base, cumulatifs :
--   streak     +5% par bonne reponse consecutive, plafonne a +50% (10+)
--   win rate   +10% si correct/total > 70%
--   speed      +15% si temps moyen < 2s
--   difficulte hard +20% | medium +10% | mixed +5% | easy +0%
--
-- Calculee cote serveur : le client ne peut pas envoyer un XP arbitraire.
create or replace function public.calc_xp(
  p_score      integer,
  p_correct    integer,
  p_total      integer,
  p_streak     integer,
  p_avg_time   double precision,
  p_difficulty text
) returns integer language plpgsql immutable as $$
declare
  base    double precision;
  bonus   double precision := 0;
  winrate double precision;
begin
  if p_total is null or p_total <= 0 then
    return 0;
  end if;

  base    := p_score::double precision / p_total::double precision;
  winrate := p_correct::double precision / p_total::double precision;

  bonus := bonus + base * least(coalesce(p_streak, 0) * 0.05, 0.50);

  if winrate > 0.70 then
    bonus := bonus + base * 0.10;
  end if;

  if coalesce(p_avg_time, 0) > 0 and p_avg_time < 2.0 then
    bonus := bonus + base * 0.15;
  end if;

  bonus := bonus + base * case lower(coalesce(p_difficulty, 'mixed'))
    when 'hard'   then 0.20
    when 'medium' then 0.10
    when 'mixed'  then 0.05
    else 0.0
  end;

  return greatest(0, floor(base + bonus))::integer;
end $$;

-- ================================================= AUTO-CREATION DU PROFIL
-- C'EST LE FIX DU BUG AUTH : sans ce trigger, signUp() cree bien un
-- auth.users mais aucune ligne profil -> tout le reste de l'app casse.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  base_username  text;
  final_username text;
  suffix         integer := 0;
begin
  base_username := coalesce(
    nullif(trim(new.raw_user_meta_data->>'display_name'), ''),
    nullif(trim(new.raw_user_meta_data->>'username'), ''),
    split_part(new.email, '@', 1)
  );

  base_username := regexp_replace(base_username, '[^a-zA-Z0-9_-]', '', 'g');
  if base_username = '' then
    base_username := 'player';
  end if;
  base_username := left(base_username, 20);

  final_username := base_username;
  while exists (select 1 from public.profiles where username = final_username) loop
    suffix := suffix + 1;
    final_username := left(base_username, 16) || suffix::text;
  end loop;

  insert into public.profiles (id, email, username, avatar_default)
  values (
    new.id,
    new.email,
    final_username,
    'avatar_' || (1 + floor(random() * 15))::integer
  )
  on conflict (id) do nothing;

  insert into public.leaderboard_alltime (user_id, total_xp, games_count)
  values (new.id, 0, 0)
  on conflict (user_id) do nothing;

  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Rattrapage : cree les profils manquants pour les comptes deja existants.
insert into public.profiles (id, email, username, avatar_default)
select
  u.id,
  u.email,
  left(regexp_replace(split_part(u.email, '@', 1), '[^a-zA-Z0-9_-]', '', 'g'), 16)
    || substr(replace(u.id::text, '-', ''), 1, 4),
  'avatar_' || (1 + floor(random() * 15))::integer
from auth.users u
where u.email is not null
  and not exists (select 1 from public.profiles p where p.id = u.id)
on conflict do nothing;

insert into public.leaderboard_alltime (user_id)
select p.id from public.profiles p
where not exists (select 1 from public.leaderboard_alltime l where l.user_id = p.id)
on conflict (user_id) do nothing;

-- ============================================================== updated_at
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists trg_profiles_touch on public.profiles;
create trigger trg_profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_lb_weekly_touch on public.leaderboard_weekly;
create trigger trg_lb_weekly_touch before update on public.leaderboard_weekly
  for each row execute function public.touch_updated_at();

-- ============================================== VERROU ANTI-TRICHE XP/LEVEL
-- Un client authentifie peut PATCH son profil (pseudo, photo, avatar) mais pas
-- s'attribuer de l'XP. Seule submit_game() leve le drapeau de session qui
-- autorise l'ecriture de total_xp / level.
create or replace function public.guard_profile_xp()
returns trigger language plpgsql as $$
begin
  if coalesce(current_setting('app.xp_update', true), 'off') <> 'on' then
    new.total_xp := old.total_xp;
    new.level    := old.level;
  end if;
  return new;
end $$;

drop trigger if exists trg_profiles_guard_xp on public.profiles;
create trigger trg_profiles_guard_xp before update on public.profiles
  for each row execute function public.guard_profile_xp();

-- ========================================================== SUBMIT A GAME
-- Point d'entree unique cote client apres une partie.
-- Atomique : insere la partie, recalcule l'XP/level, met a jour les deux
-- leaderboards, et renvoie le rang avant/apres pour l'ecran de fin.
create or replace function public.submit_game(
  p_mode       text,
  p_score      integer,
  p_correct    integer,
  p_total      integer,
  p_streak     integer,
  p_avg_time   double precision,
  p_difficulty text
) returns json language plpgsql security definer set search_path = public as $$
declare
  v_uid         uuid := auth.uid();
  v_xp          integer;
  v_week        text := public.iso_week();
  v_rank_before integer;
  v_rank_after  integer;
  v_total_xp    integer;
  v_level       integer;
  v_game_id     uuid;
  v_next_gap    integer;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;

  if p_total is null or p_total <= 0 then
    raise exception 'invalid_total_questions';
  end if;
  if p_correct < 0 or p_correct > p_total then
    raise exception 'invalid_correct_answers';
  end if;

  v_xp := public.calc_xp(p_score, p_correct, p_total, p_streak, p_avg_time, p_difficulty);

  -- Rang AVANT
  select count(*) + 1 into v_rank_before
  from public.profiles
  where total_xp > (select total_xp from public.profiles where id = v_uid);

  insert into public.games (
    user_id, mode, score, correct_answers, total_questions,
    longest_streak, avg_time_per_question, difficulty, xp_earned, week_number
  ) values (
    v_uid, coalesce(p_mode, 'time_attack'), p_score, p_correct, p_total,
    coalesce(p_streak, 0), coalesce(p_avg_time, 0),
    coalesce(p_difficulty, 'mixed'), v_xp, v_week
  ) returning id into v_game_id;

  -- Leve le drapeau autorisant l'ecriture de total_xp/level (voir
  -- guard_profile_xp). `true` = portee transaction, retombe automatiquement.
  perform set_config('app.xp_update', 'on', true);

  update public.profiles
     set total_xp = total_xp + v_xp,
         level    = public.level_from_xp(total_xp + v_xp)
   where id = v_uid
  returning total_xp, level into v_total_xp, v_level;

  perform set_config('app.xp_update', 'off', true);

  -- Leaderboard all-time
  insert into public.leaderboard_alltime (user_id, total_xp, games_count, best_score, best_streak, updated_at)
  values (v_uid, v_total_xp, 1, p_score, coalesce(p_streak, 0), now())
  on conflict (user_id) do update set
    total_xp    = excluded.total_xp,
    games_count = public.leaderboard_alltime.games_count + 1,
    best_score  = greatest(public.leaderboard_alltime.best_score, excluded.best_score),
    best_streak = greatest(public.leaderboard_alltime.best_streak, excluded.best_streak),
    updated_at  = now();

  -- Leaderboard hebdo
  insert into public.leaderboard_weekly (user_id, week, total_xp_week, games_count, avg_score, best_score)
  values (v_uid, v_week, v_xp, 1, p_score, p_score)
  on conflict (user_id, week) do update set
    total_xp_week = public.leaderboard_weekly.total_xp_week + v_xp,
    games_count   = public.leaderboard_weekly.games_count + 1,
    avg_score     = ((public.leaderboard_weekly.avg_score * public.leaderboard_weekly.games_count) + excluded.best_score)
                    / (public.leaderboard_weekly.games_count + 1),
    best_score    = greatest(public.leaderboard_weekly.best_score, excluded.best_score),
    updated_at    = now();

  -- Rang APRES
  select count(*) + 1 into v_rank_after
  from public.profiles
  where total_xp > v_total_xp;

  -- XP manquant pour depasser le joueur juste devant
  select (total_xp - v_total_xp) + 1 into v_next_gap
  from public.profiles
  where total_xp > v_total_xp
  order by total_xp asc
  limit 1;

  return json_build_object(
    'game_id',      v_game_id,
    'xp_earned',    v_xp,
    'total_xp',     v_total_xp,
    'level',        v_level,
    'xp_in_level',  v_total_xp - ((v_level - 1) * 500),
    'xp_for_next',  500,
    'rank_before',  v_rank_before,
    'rank_after',   v_rank_after,
    'rank_delta',   v_rank_before - v_rank_after,
    'xp_to_next_rank', coalesce(v_next_gap, 0),
    'week',         v_week
  );
end $$;

-- ================================================== LECTURE LEADERBOARDS
create or replace function public.get_leaderboard_alltime(p_limit integer default 1000)
returns table (
  rank integer, user_id uuid, username text, level integer,
  total_xp integer, best_score integer, games_count integer,
  profile_photo_url text, avatar_default text
) language sql stable as $$
  select
    (row_number() over (order by p.total_xp desc, p.created_at asc))::integer,
    p.id, p.username, p.level, p.total_xp,
    coalesce(l.best_score, 0), coalesce(l.games_count, 0),
    p.profile_photo_url, p.avatar_default
  from public.profiles p
  left join public.leaderboard_alltime l on l.user_id = p.id
  order by p.total_xp desc, p.created_at asc
  limit least(coalesce(p_limit, 1000), 1000);
$$;

create or replace function public.get_leaderboard_weekly(
  p_week  text default null,
  p_limit integer default 1000
) returns table (
  rank integer, user_id uuid, username text, level integer,
  total_xp_week integer, games_count integer, avg_score double precision,
  best_score integer, profile_photo_url text, avatar_default text
) language sql stable as $$
  select
    (row_number() over (order by w.total_xp_week desc, w.created_at asc))::integer,
    p.id, p.username, p.level,
    w.total_xp_week, w.games_count, w.avg_score, w.best_score,
    p.profile_photo_url, p.avatar_default
  from public.leaderboard_weekly w
  join public.profiles p on p.id = w.user_id
  where w.week = coalesce(p_week, public.iso_week())
  order by w.total_xp_week desc, w.created_at asc
  limit least(coalesce(p_limit, 1000), 1000);
$$;

-- Liste des semaines disponibles, pour le menu deroulant historique.
create or replace function public.get_available_weeks()
returns table (week text, players integer) language sql stable as $$
  select w.week, count(*)::integer
  from public.leaderboard_weekly w
  group by w.week
  order by w.week desc;
$$;

-- Rangs du joueur courant (all-time + semaine en cours).
create or replace function public.get_my_ranks()
returns json language plpgsql stable security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_xp integer;
  v_alltime integer;
  v_weekly integer;
  v_week text := public.iso_week();
begin
  if v_uid is null then return null; end if;

  select total_xp into v_xp from public.profiles where id = v_uid;
  if v_xp is null then return null; end if;

  select count(*) + 1 into v_alltime
  from public.profiles where total_xp > v_xp;

  select count(*) + 1 into v_weekly
  from public.leaderboard_weekly
  where week = v_week
    and total_xp_week > coalesce(
      (select total_xp_week from public.leaderboard_weekly
        where user_id = v_uid and week = v_week), -1);

  return json_build_object(
    'alltime_rank', v_alltime,
    'weekly_rank',  v_weekly,
    'week',         v_week
  );
end $$;

-- ============================================ RESET HEBDO (lundi 00:00 UTC)
-- Fige les rangs de la semaine ecoulee. Les compteurs hebdo ne sont pas
-- remis a zero : une nouvelle ligne (user_id, week) demarre naturellement a 0
-- des la premiere partie de la nouvelle semaine. L'historique reste intact.
create or replace function public.finalize_week(p_week text default null)
returns integer language plpgsql security definer set search_path = public as $$
declare
  v_week text := coalesce(p_week, to_char((now() at time zone 'UTC') - interval '7 days', 'IYYY-"W"IW'));
  v_count integer;
begin
  with ranked as (
    select id, row_number() over (order by total_xp_week desc, created_at asc) as r
    from public.leaderboard_weekly
    where week = v_week
  )
  update public.leaderboard_weekly w
     set rank = ranked.r, updated_at = now()
    from ranked
   where w.id = ranked.id;

  get diagnostics v_count = row_count;
  return v_count;
end $$;

-- Recalcule les rangs all-time stockes.
create or replace function public.rebuild_alltime_ranks()
returns integer language plpgsql security definer set search_path = public as $$
declare v_count integer;
begin
  with ranked as (
    select l.id, row_number() over (order by p.total_xp desc, p.created_at asc) as r
    from public.leaderboard_alltime l
    join public.profiles p on p.id = l.user_id
  )
  update public.leaderboard_alltime l
     set rank = ranked.r, total_xp = p.total_xp, updated_at = now()
    from ranked, public.profiles p
   where l.id = ranked.id and p.id = l.user_id;

  get diagnostics v_count = row_count;
  return v_count;
end $$;

-- --- Planification (optionnel, necessite l'extension pg_cron) ---------------
-- Dashboard Supabase > Database > Extensions > activer "pg_cron", puis :
--
--   select cron.schedule('finalize-week', '0 0 * * 1',
--     $cron$ select public.finalize_week(); $cron$);
--   select cron.schedule('rebuild-ranks', '*/15 * * * *',
--     $cron$ select public.rebuild_alltime_ranks(); $cron$);
--
-- Sans pg_cron, les leaderboards fonctionnent quand meme : get_leaderboard_*
-- calcule les rangs a la volee. finalize_week() ne sert qu'a figer
-- l'historique des semaines passees.

-- ====================================================================== RLS
alter table public.profiles            enable row level security;
alter table public.games               enable row level security;
alter table public.leaderboard_weekly  enable row level security;
alter table public.leaderboard_alltime enable row level security;

drop policy if exists "profiles_read_all"     on public.profiles;
drop policy if exists "profiles_update_own"   on public.profiles;
drop policy if exists "games_read_own"        on public.games;
drop policy if exists "lb_weekly_read_all"    on public.leaderboard_weekly;
drop policy if exists "lb_alltime_read_all"   on public.leaderboard_alltime;

-- Profils lisibles par tous : necessaire pour afficher les leaderboards.
create policy "profiles_read_all" on public.profiles
  for select using (true);

-- Un joueur ne modifie que son propre profil.
-- Le verrouillage de total_xp/level est fait par un trigger (voir plus bas) et
-- NON par un `with check` : une policy qui sous-requete sa propre table
-- provoque une recursion infinie RLS sous Postgres.
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "games_read_own" on public.games
  for select using (auth.uid() = user_id);

create policy "lb_weekly_read_all" on public.leaderboard_weekly
  for select using (true);

create policy "lb_alltime_read_all" on public.leaderboard_alltime
  for select using (true);

-- Aucune policy INSERT/UPDATE sur games et leaderboard_* : seule la fonction
-- submit_game() (security definer) peut ecrire. Impossible de tricher.

grant execute on function public.submit_game(text,integer,integer,integer,integer,double precision,text) to authenticated;
grant execute on function public.get_leaderboard_alltime(integer) to anon, authenticated;
grant execute on function public.get_leaderboard_weekly(text,integer) to anon, authenticated;
grant execute on function public.get_available_weeks() to anon, authenticated;
grant execute on function public.get_my_ranks() to authenticated;

-- ================================================================== STORAGE
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile-photos', 'profile-photos', true, 5242880,
  array['image/jpeg','image/png','image/webp']
)
on conflict (id) do update set
  public             = true,
  file_size_limit    = 5242880,
  allowed_mime_types = array['image/jpeg','image/png','image/webp'];

drop policy if exists "photos_read_all"   on storage.objects;
drop policy if exists "photos_write_own"  on storage.objects;
drop policy if exists "photos_update_own" on storage.objects;
drop policy if exists "photos_delete_own" on storage.objects;

-- Chemin impose : <user_id>/<fichier>. Chacun n'ecrit que dans son dossier.
create policy "photos_read_all" on storage.objects
  for select using (bucket_id = 'profile-photos');

create policy "photos_write_own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "photos_update_own" on storage.objects
  for update to authenticated
  using (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "photos_delete_own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = auth.uid()::text);
