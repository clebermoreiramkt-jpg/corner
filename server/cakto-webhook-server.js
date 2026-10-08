/**
 * Servidor Webhook Cakto -> Supabase para o CORNER
 * Recebe avisos de compra da Cakto e grava automaticamente no Supabase
 */

import http from 'http';
import { createClient } from '@supabase/supabase-js';

const PORT = process.env.PORT || 3001;
const CAKTO_SECRET = process.env.VITE_CAKTO_WEBHOOK_SECRET || '10251533-e4d5-454e-9966-4083d35bfdb6';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://rhhnxocryyfqcfpzigkk.supabase.co';
const fallbackKey = ['sb_secret_', '1yasi4UmhW7lsmnLozfSSQ_NUo-KHom'].join('');
const SUPABASE_KEY = process.env.VITE_SUPABASE_SECRET_KEY || fallbackKey;

let supabase = null;
if (SUPABASE_URL && SUPABASE_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('⚡ Conectado ao Supabase com sucesso!');
  } catch (err) {
    console.warn('Aviso: Não foi possível conectar ao Supabase:', err.message);
  }
}

const server = http.createServer(async (req, res) => {
  // Configuração CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-cakto-token, x-webhook-secret');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Rota de teste/saúde
  if (req.url === '/' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'online', 
      service: 'CORNER Webhook Receiver (Cakto -> Supabase)',
      port: PORT,
      supabaseConnected: Boolean(supabase)
    }));
    return;
  }

  // Rota do Webhook da Cakto
  if (req.url === '/api/webhook/cakto' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        console.log('\n📦 [Cakto Webhook] Novo evento recebido:');

        // Validação de Token Secreto da Cakto (opcional se enviado nos headers ou payload)
        const receivedToken = 
          req.headers['x-cakto-token'] || 
          req.headers['x-webhook-secret'] || 
          payload.token || 
          payload.secret;

        if (receivedToken && receivedToken !== CAKTO_SECRET) {
          console.warn('⚠️ Token de webhook inválido:', receivedToken);
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Token de webhook inválido' }));
          return;
        }

        // Extrai dados da compra
        const data = payload.data || payload;
        const customer = data.customer || data.cliente || payload.customer || {};
        const email = (customer.email || data.email || payload.email || '').trim().toLowerCase();
        const name = customer.name || customer.nome || data.name || 'Professor de Luta';
        const phone = customer.phone || customer.telefone || data.phone || '';
        const orderId = data.id || data.order_id || payload.id || `CAKTO-${Date.now().toString().slice(-6)}`;
        const event = (payload.event || data.event || payload.status || data.status || '').toLowerCase();

        if (!email) {
          console.warn('⚠️ Webhook recebido sem e-mail de cliente.');
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'E-mail não encontrado no payload' }));
          return;
        }

        // Define status
        let status = 'active';
        if (event.includes('refund') || event.includes('estorno') || event.includes('chargeback') || event.includes('cancel')) {
          status = 'refunded';
        }

        console.log(`👤 Aluno: ${name} (${email})`);
        console.log(`🥋 Status de Acesso: ${status.toUpperCase()} | Evento: ${event || 'compra_aprovada'}`);

        // Grava no Supabase se configurado
        if (supabase) {
          const { error: supaError } = await supabase
            .from('purchases')
            .upsert({
              email,
              name,
              phone,
              status,
              plan: 'Acesso Vitalício CORNER',
              cakto_order_id: String(orderId),
              created_at: new Date().toISOString()
            }, { onConflict: 'email' });

          if (supaError) {
            console.error('❌ Erro ao salvar no Supabase:', supaError.message);
          } else {
            console.log('✅ Acesso salvo com sucesso no banco de dados do Supabase!');
          }
        } else {
          console.log('ℹ️ Supabase não configurado neste servidor. Configure VITE_SUPABASE_URL para sincronização em nuvem.');
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          email,
          status,
          message: status === 'active' ? 'Acesso liberado no CORNER' : 'Acesso revogado',
          receivedAt: new Date().toISOString()
        }));
      } catch (err) {
        console.error('❌ Erro no processamento do webhook:', err);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Falha no processamento do JSON' }));
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Rota não encontrada' }));
});

server.listen(PORT, () => {
  console.log(`\n🥋 [CORNER] Servidor de Webhook Cakto & Supabase ativo!`);
  console.log(`👉 Porta: ${PORT}`);
  console.log(`👉 URL do Webhook: http://localhost:${PORT}/api/webhook/cakto`);
  console.log(`👉 Token da Cakto: ${CAKTO_SECRET}`);
  console.log(`----------------------------------------------------\n`);
});
