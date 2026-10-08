-- ========================================================
-- 🥋 CORNER — SCRIPT DE CRIAÇÃO DA TABELA NO SUPABASE
-- ========================================================
-- Como usar:
-- 1. Abra o painel do seu Supabase (https://supabase.com/dashboard)
-- 2. No menu lateral esquerdo, clique em "SQL Editor"
-- 3. Clique em "+ New query"
-- 4. Cole todo o código abaixo e clique no botão verde "Run" (ou pressione Ctrl + Enter)
-- ========================================================

-- 1. Cria a tabela de compras e acessos
create table if not exists public.purchases (
  email text primary key,
  name text,
  phone text,
  status text default 'active',
  plan text default 'Acesso Vitalício CORNER',
  cakto_order_id text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Habilita as políticas de segurança (Row Level Security)
alter table public.purchases enable row level security;

-- 3. Permite que o CORNER consulte se o e-mail tem acesso ativo
drop policy if exists "Permitir consulta de compras no CORNER" on public.purchases;
create policy "Permitir consulta de compras no CORNER"
  on public.purchases for select
  using (true);

-- 4. Permite que o Webhook grave ou atualize compras
drop policy if exists "Permitir inserção e atualização de compras" on public.purchases;
create policy "Permitir inserção e atualização de compras"
  on public.purchases for all
  using (true)
  with check (true);

-- 5. Insere um professor de exemplo para você já poder testar imediatamente
insert into public.purchases (email, name, status, plan, cakto_order_id)
values ('professor@tatame.com', 'Professor Exemplo', 'active', 'Acesso Vitalício CORNER', 'CAKTO-DEMO-001')
on conflict (email) do nothing;
