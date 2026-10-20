export async function onRequestPost({ request, env }) {
  const form = await request.formData();
  if (!env.RESEND_API_KEY || !env.NOTIFICATION_EMAIL) return new Response('Form is not configured', { status: 500 });
  const help = form.getAll('help').join(', ') || 'Not specified';
  const text = [
    'New Motion Craft Global lead',
    '',
    `Source: ${form.get('source') || 'Holding Village'}`,
    `Name: ${form.get('name') || ''}`,
    `Email: ${form.get('email') || ''}`,
    `Business name: ${form.get('business') || 'Not provided'}`,
    `Already has a website: ${form.get('hasWebsite') || ''}`,
    `What would help: ${help}`,
    '',
    `What they are trying to do:\n${form.get('idea') || 'Not provided'}`
  ].join('\n');
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: env.RESEND_FROM || 'Motion Craft Global <onboarding@resend.dev>',
      to: [env.NOTIFICATION_EMAIL],
      reply_to: form.get('email'),
      subject: 'New Motion Craft Global lead — Holding Village',
      text
    })
  });
  return new Response(response.ok ? 'ok' : 'Unable to send', { status: response.ok ? 200 : 502 });
}
