export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/submit' && request.method === 'POST') {
      if (!env.RESEND_API_KEY || !env.NOTIFICATION_EMAIL) {
        return new Response('Form is not configured', { status: 500 });
      }

      const form = await request.formData();
      const help = form.getAll('help').join(', ') || 'Not specified';
      const source = form.get('source') || 'Motion Craft Business Services';

      const lines = [
        'New Motion Craft Global lead',
        '',
        'Source: ' + source,
        'Name: ' + (form.get('name') || ''),
        'Email: ' + (form.get('email') || ''),
        'Business name: ' + (form.get('business') || 'Not provided'),
        'Already has a website: ' + (form.get('hasWebsite') || ''),
        'What would help: ' + help,
        '',
        'What they are trying to do:',
        form.get('idea') || 'Not provided'
      ];

      const text = lines.join('\n');

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + env.RESEND_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: env.RESEND_FROM || 'Motion Craft Global <onboarding@resend.dev>',
          to: [env.NOTIFICATION_EMAIL],
          reply_to: form.get('email') || undefined,
          subject: 'New lead — Motion Craft Global',
          text: text
        })
      });

      if (!response.ok) {
        const errBody = await response.text();
        return new Response('Resend error: ' + errBody, { status: 502 });
      }
      return new Response('ok', { status: 200 });
    }

    return env.ASSETS.fetch(request);
  }
};
