'use server';

/**
 * @fileOverview Server actions for Temp Mail Studio.
 * Handles high-fidelity multi-node proxying for temporary email services to bypass CORS.
 */

const NODES = {
  '1secmail': 'https://www.1secmail.com/api/v1/',
  'mailtm': 'https://api.mail.tm',
  'guerrilla': 'https://api.guerrillamail.com/ajax.php'
};

async function handle1secmail(action: string, params: any) {
  const url = new URL(NODES['1secmail']);
  url.searchParams.append('action', action);
  Object.entries(params).forEach(([k, v]) => url.searchParams.append(k, String(v)));
  
  const res = await fetch(url.toString(), { cache: 'no-store' });
  return res.json();
}

async function handleMailTM(endpoint: string, method: string = 'GET', body?: any, token?: string) {
  const headers: any = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${NODES['mailtm']}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store'
  });
  return res.json();
}

export async function fetchFromProvider(providerId: string, payload: any) {
  try {
    switch (providerId) {
      case '1secmail':
        if (payload.action === 'genRandomMailbox') {
          const data = await handle1secmail('genRandomMailbox', { count: 1 });
          return { success: true, email: data[0] };
        }
        if (payload.action === 'getMessages') {
          const [login, domain] = payload.email.split('@');
          const data = await handle1secmail('getMessages', { login, domain });
          return { success: true, messages: data };
        }
        if (payload.action === 'readMessage') {
          const [login, domain] = payload.email.split('@');
          const data = await handle1secmail('readMessage', { login, domain, id: payload.id });
          return { success: true, message: data };
        }
        break;

      case 'mailtm':
        if (payload.action === 'genRandomMailbox') {
          const domains = await handleMailTM('/domains');
          const domain = domains['hydra:member'][0].domain;
          const login = Math.random().toString(36).substring(2, 12);
          const password = Math.random().toString(36).substring(2, 12);
          const account = await handleMailTM('/accounts', 'POST', { address: `${login}@${domain}`, password });
          const tokenData = await handleMailTM('/token', 'POST', { address: `${login}@${domain}`, password });
          return { success: true, email: account.address, token: tokenData.token, accountId: account.id };
        }
        if (payload.action === 'getMessages') {
          const data = await handleMailTM('/messages', 'GET', null, payload.token);
          const mapped = (data['hydra:member'] || []).map((m: any) => ({
            id: m.id,
            from: m.from.address,
            subject: m.subject,
            date: m.createdAt
          }));
          return { success: true, messages: mapped };
        }
        if (payload.action === 'readMessage') {
          const data = await handleMailTM(`/messages/${payload.id}`, 'GET', null, payload.token);
          return { success: true, message: {
            from: data.from.address,
            subject: data.subject,
            date: data.createdAt,
            htmlBody: data.html || data.text,
            body: data.text || data.html
          }};
        }
        break;

      case 'guerrilla':
        const buildUrl = (f: string, extra = {}) => {
          const u = new URL(NODES['guerrilla']);
          u.searchParams.append('f', f);
          u.searchParams.append('ip', '127.0.0.1');
          u.searchParams.append('agent', 'Mozilla/5.0');
          Object.entries(extra).forEach(([k, v]) => u.searchParams.append(k, String(v)));
          return u.toString();
        };

        if (payload.action === 'genRandomMailbox') {
          const res = await fetch(buildUrl('get_email_address'), { cache: 'no-store' });
          const data = await res.json();
          return { success: true, email: data.email_addr, sid: data.sid_token };
        }
        if (payload.action === 'getMessages') {
          const res = await fetch(buildUrl('check_email', { sid_token: payload.sid, seq: 0 }), { cache: 'no-store' });
          const data = await res.json();
          const mapped = (data.list || []).map((m: any) => ({
            id: m.mail_id,
            from: m.mail_from,
            subject: m.mail_subject,
            date: m.mail_date
          }));
          return { success: true, messages: mapped };
        }
        if (payload.action === 'readMessage') {
          const res = await fetch(buildUrl('fetch_email', { sid_token: payload.sid, email_id: payload.id }), { cache: 'no-store' });
          const data = await res.json();
          return { success: true, message: {
            from: data.mail_from,
            subject: data.mail_subject,
            date: data.mail_date,
            htmlBody: data.mail_body,
            body: data.mail_body
          }};
        }
        break;
    }
    return { success: false, error: 'Protocol Mismatch' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
