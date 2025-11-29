// /.netlify/functions/contact.js
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  try {
    const payload = JSON.parse(event.body || '{}');
    // TODO: send via provider (SendGrid/Mailgun) using secrets
    console.log('Contact form payload:', payload);
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (e){
    return { statusCode: 500, body: JSON.stringify({ ok: false, error: e.message }) };
  }
};
