# 🥋 GUIA OFICIAL: LOGIN SEM SENHA & WEBHOOK CAKTO — CORNER

Este guia explica como funciona e como colocar em produção a autenticação por **Magic Link (login sem senha)** e o **Webhook de cobranças da Cakto**.

---

## ⚡ 1. Visão Geral da Arquitetura

```
[ Professor compra na Cakto ]
             │
             ▼
[ Cakto envia Webhook POST ] ───► [ Cloud Function / Endpoint ]
                                           │
                                           ▼ (Grava status: "active")
                                 [ Cloud Firestore: users/{email} ]
                                           ▲
                                           │ (Valida se o e-mail comprou)
[ Professor clica no Magic Link ] ─────────┘
             │
             ▼
[ Acesso Liberado no CORNER ]
```

1. O professor faz o pagamento no checkout da **Cakto**.
2. A Cakto dispara uma notificação via **Webhook** com o e-mail do aluno.
3. O webhook grava o registro no **Cloud Firestore** com `status: "active"`.
4. O professor abre o **CORNER**, digita o mesmo e-mail da compra e recebe um **Magic Link** (link seguro sem senha).
5. Ao clicar no link, o Firebase autentica e o CORNER valida que o e-mail possui compra ativa, liberando todos os 99 templates e combos!

---

## 🚀 2. Configurando o Firebase (Passo a Passo)

### 2.1 Criar Projeto no Firebase
1. Acesse [firebase.google.com](https://firebase.google.com) e crie um novo projeto (ex: `corner-luta`).
2. No menu lateral, clique em **Criação > Authentication > Primeiros Passos**.
3. Na aba **Método de login (Sign-in method)**:
   * Clique em **E-mail/senha**.
   * Ative **E-mail/senha**.
   * **IMPORTANTE**: Ative a opção **"Link do e-mail (login sem senha)"**.
   * Salve as alterações.
4. Na aba **Domínios autorizados (Authorized domains)**:
   * Adicione o domínio onde o CORNER estiver hospedado (ex: `localhost`, `corner.app`, `seusite.com.br`).

### 2.2 Ativar o Cloud Firestore
1. No menu lateral, clique em **Criação > Firestore Database > Criar banco de dados**.
2. Selecione o modo de produção ou teste (em São Paulo `southamerica-east1` ou EUA).
3. Regras de segurança básicas para `firestore.rules`:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{email} {
      allow read: if request.auth != null && request.auth.token.email == email;
      allow write: if false; // Apenas o backend/webhook pode gravar
    }
  }
}
```

### 2.3 Obter as Chaves Web
1. Vá em **Configurações do Projeto (ícone de engrenagem) > Geral**.
2. Na seção *Seus aplicativos*, clique no ícone **Web (</>)**.
3. Copie o objeto `firebaseConfig` com:
   * `apiKey`
   * `authDomain`
   * `projectId`
4. Você pode colar essas chaves direto no modal de **Configurações do CORNER** no próprio app ou criar um arquivo `.env`:
```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto
```

---

## 📦 3. Configurando o Webhook na Cakto

1. Acesse o painel da **Cakto** ([cakto.com.br](https://cakto.com.br)).
2. Vá no seu produto do **CORNER** > **Integrações** > **Webhooks** (ou Configurações de Webhook).
3. Clique em **Adicionar Webhook**:
   * **URL do Webhook**: `https://<seu-projeto>.cloudfunctions.net/caktoWebhook` (ou URL do seu servidor).
   * **Eventos para selecionar**:
     * `Compra Aprovada` / `Pedido Pago` (Libera o acesso)
     * `Reembolso` / `Estorno` / `Chargeback` (Revoga o acesso)
4. Salve o webhook.

---

## 🛠️ 4. Testando Imediatamente (Sem precisar comprar na Cakto)

O CORNER já vem com um **Simulador de Webhook integrado**:

1. No app, clique no botão **Entrar** ou vá em **Meu Corner > Configurar Webhook & Login**.
2. Abra a aba **Webhook Cakto**.
3. No campo *Simulador de Compra Cakto*:
   * Digite qualquer e-mail (ex: `professor@tatame.com`).
   * Escolha `Compra Aprovada`.
   * Clique em **Disparar Simulação**.
4. Pronto! O acesso agora está registrado.
5. Volte para a aba **Login sem Senha**, digite `professor@tatame.com` e clique em **Enviar Link Mágico**.
6. No modo de teste, um botão de atalho **"ENTRAR AGORA COM ESTE E-MAIL"** aparecerá para testar instantaneamente a experiência completa!
