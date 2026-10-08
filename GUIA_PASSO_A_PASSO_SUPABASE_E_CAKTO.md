# 🥋 GUIA PASSO A PASSO — CAKTO + SUPABASE NO CORNER
### Para quem é leigo: siga estes 4 passos simples para deixar tudo funcionando 100%!

Suas chaves que já estão salvas no sistema:
* **Chave Secreta Webhook Cakto:** `10251533-e4d5-454e-9966-4083d35bfdb6`
* **Chave Secreta Supabase:** `sb_secret_...` (já configurada no sistema)

---

## 📌 PASSO 1: CRIAR A TABELA NO SUPABASE (Leva 1 minuto)

1. Acesse o seu painel do Supabase: [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Abra o seu projeto.
3. No menu lateral esquerdo, clique no ícone **SQL Editor** (parece um terminal `>_`).
4. Clique no botão **"+ New query"** (Nova consulta).
5. Abra o arquivo `SUPABASE_SETUP.sql` deste projeto (ou copie o código abaixo):

```sql
create table if not exists public.purchases (
  email text primary key,
  name text,
  phone text,
  status text default 'active',
  plan text default 'Acesso Vitalício CORNER',
  cakto_order_id text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.purchases enable row level security;

create policy "Permitir consulta de compras no CORNER"
  on public.purchases for select
  using (true);

create policy "Permitir inserção e atualização de compras"
  on public.purchases for all
  using (true)
  with check (true);
```

6. Cole no campo de texto e clique no botão verde **"Run"** (no canto inferior direito).
7. Aparecerá a mensagem: **"Success. No rows returned"**. Pronto! Sua tabela de compradores está criada.

---

## 📌 PASSO 2: PEGAR A URL DO SEU SUPABASE E COLOCAR NO CORNER

No Supabase:
1. No menu lateral esquerdo do Supabase, clique no ícone da engrenagem **Project Settings** (Configurações do Projeto).
2. Clique na aba **"API"**.
3. Procure pelo campo **"Project URL"** (é algo no formato `https://xxxxxxxxxxxxxxxx.supabase.co`).
4. Clique em **"Copy"** para copiar essa URL.

No CORNER:
1. Abra o arquivo `.env` na pasta do CORNER e cole a URL na linha:
   ```env
   VITE_SUPABASE_URL=https://sua-url-aqui.supabase.co
   ```
   *(Ou cole direto na janela do CORNER na aba "Supabase & Cakto" e clique em Salvar!)*

---

## 📌 PASSO 3: CONFIGURAR O WEBHOOK NA CAKTO

1. Acesse sua conta na **Cakto**: [https://app.cakto.com.br](https://app.cakto.com.br)
2. No menu lateral, acesse **Apps** ou **Integrações** > **Webhooks**.
3. Clique em **"Criar Webhook"** ou **"Novo Webhook"**.
4. Preencha os campos:
   - **Nome do Webhook:** `CORNER - Liberação de Alunos`
   - **URL do Webhook:** 
     - Se o seu site estiver no ar (ex: na Vercel/Netlify): `https://seu-dominio.com/api/webhook/cakto`
     - Se estiver usando o servidor Node do CORNER: `https://seu-servidor.com/api/webhook/cakto`
   - **Chave Secreta / Token de Validação:** Cole a sua chave:
     ```
     10251533-e4d5-454e-9966-4083d35bfdb6
     ```
   - **Eventos que devem disparar:**
     - Marque: `Compra Aprovada` (ou Pagamento Aprovado)
     - Marque: `Reembolso` (ou Estorno)
     - Marque: `Chargeback`
5. Clique em **Salvar**.

---

## 📌 PASSO 4: COMO FUNCIONA PARA O SEU CLIENTE (PROFESSOR DE LUTA)

1. O professor compra o CORNER na sua página de vendas da **Cakto**.
2. A Cakto envia o webhook para o CORNER em menos de 2 segundos.
3. O e-mail dele é gravado como **`status: active`** no Supabase.
4. O professor entra no CORNER, clica em **"Já comprei (Entrar)"** e digita o mesmo e-mail.
5. O sistema localiza a compra dele no Supabase e **libera imediatamente** o acesso completo aos 99 templates!
