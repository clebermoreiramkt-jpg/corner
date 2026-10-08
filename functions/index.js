const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

/**
 * Endpoint de Webhook da Plataforma Cakto para liberação do CORNER
 * URL de produção: https://<seu-projeto>.cloudfunctions.net/caktoWebhook
 */
exports.caktoWebhook = functions.https.onRequest(async (req, res) => {
  // Apenas aceita requisições POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Use POST.' });
  }

  try {
    const payload = req.body || {};
    console.log('Recebido Webhook Cakto:', JSON.stringify(payload));

    // 1. Extração flexível dos dados do comprador enviados pela Cakto
    // A Cakto pode enviar dentro de payload.data ou diretamente no payload raiz
    const data = payload.data || payload;
    const customer = data.customer || data.cliente || data.buyer || payload.customer || {};

    const rawEmail = customer.email || data.email || payload.email;
    if (!rawEmail) {
      console.warn('Webhook recebido sem e-mail do cliente:', payload);
      return res.status(400).json({ error: 'E-mail do comprador não encontrado no payload' });
    }

    const email = String(rawEmail).trim().toLowerCase();
    const name = customer.name || customer.nome || data.name || 'Professor de Luta';
    const phone = customer.phone || customer.telefone || data.phone || '';
    const orderId = String(data.id || data.order_id || payload.order_id || `ORD-${Date.now()}`);

    // 2. Mapeamento do status da compra
    // Eventos e status comuns da Cakto:
    // compra_aprovada, purchase_approved, order_approved, paid, approved, completed
    // estorno, refunded, chargeback, refund, cancelled
    const event = String(payload.event || data.event || payload.status || data.status || '').toLowerCase();

    let status = 'active'; // padrão para compra confirmada
    if (
      event.includes('refund') ||
      event.includes('estorno') ||
      event.includes('chargeback') ||
      event.includes('cancel')
    ) {
      status = 'refunded';
    } else if (
      event.includes('pix_gerado') ||
      event.includes('waiting') ||
      event.includes('pending') ||
      event.includes('aguardando')
    ) {
      status = 'pending';
    }

    // 3. Atualizar ou Criar documento do usuário no Firestore
    const userRef = db.collection('users').doc(email);
    const purchaseData = {
      email,
      name,
      phone,
      status,
      plan: 'Acesso Vitalício CORNER — 99 Templates',
      caktoOrderId: orderId,
      lastEvent: event,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      source: 'cakto_webhook',
    };

    if (status === 'active') {
      purchaseData.activatedAt = admin.firestore.FieldValue.serverTimestamp();
    }

    await userRef.set(purchaseData, { merge: true });

    // Também registra histórico detalhado na coleção de logs/compras
    await db.collection('purchases').doc(`${orderId}_${Date.now()}`).set({
      ...purchaseData,
      rawPayload: payload,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`Sucesso! Acesso do e-mail ${email} atualizado para status: ${status}`);

    return res.status(200).json({
      received: true,
      email,
      status,
      orderId,
      message: status === 'active' ? 'Acesso liberado com sucesso' : 'Status atualizado',
    });
  } catch (error) {
    console.error('Erro crítico no processamento do webhook Cakto:', error);
    return res.status(500).json({
      error: 'Erro interno ao processar webhook',
      details: error.message,
    });
  }
});
