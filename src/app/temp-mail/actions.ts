'use server';

/**
 * @fileOverview Server actions for Temp Mail Studio.
 * Handles high-fidelity multi-node proxying for temporary email services to bypass CORS.
 * Re-engineered for robust Mail.tm (Hydra v2) and 1secmail (Cluster) protocols.
 */

const NODES = {
  '1secmail': 'https://www.1secmail.com/api/v1/',
  'mailtm': 'https://api.mail.tm',
  'guerrilla': 'https://api.guerrillamail.com/ajax.php'
};

async function handle1secmail(action: string, params: any) {
  const bases = [
    'https://www.1secmail.com/api/v1/',
    'https://1secmail.com/api/v1/',
    'https://www.1secmail.org/api/v1/'
  ];
  
  for (const base of bases) {
    try {
      const url = new URL(base);
      url.searchParams.append('action', action);
      Object.entries(params).forEach(([k, v]) => url.searchParams.append(k, String(v)));
      
      const res = await fetch(url.toString(), { cache: 'no-store' });
      if (res.status === 403) continue; 
      if (!res.ok) throw new Error(`Node error: ${res.status}`);
      return await res.json();
    } catch (e) {
      continue; 
    }
  }
  
  throw new Error("1secmail blocked on this server, use Guerrilla or Mail.tm.");
}

/**
 * High-fidelity Mail.tm Proxy with multi-node failover.
 * Synchronizes with api.mail.tm and api.mail.gw.
 */
async function handleMailTM(endpoint: string, method: string = 'GET', body?: any, token?: string) {
  const bases = ['https://api.mail.tm', 'https://api.mail.gw'];
  let lastError = null;

  for (const base of bases) {
    try {
      const headers: any = { 
        'Content-Type': 'application/json', 
        'Accept': 'application/json' 
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${base}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        cache: 'no-store'
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data['hydra:description'] || data.message || `Node ${base} error: ${res.status}`);
      }
      return data;
    } catch (err) {
      lastError = err;
      continue; 
    }
  }
  
  throw lastError || new Error("Mail.tm nodes unreachable.");
}

export async function fetchFromProvider(providerId: string, payload: any) {
  try {
    switch (providerId) {
      case '1secmail':
        if (payload.action === 'genRandomMailbox') {
          const data = await handle1secmail('genRandomMailbox', { count: 1 });
          if (!data || !data[0]) throw new Error("1secmail identity generation failed.");
          return { success: true, email: data[0] };
        }
        if (payload.action === 'genCustomMailbox') {
          const domains = await handle1secmail('getDomainList', {});
          if (!domains || !Array.isArray(domains) || domains.length === 0) throw new Error("1secmail domains unavailable.");
          const email = `${payload.username}@${domains[0]}`;
          return { success: true, email };
        }
        if (payload.action === 'getMessages') {
          const [login, domain] = payload.email.split('@');
          const data = await handle1secmail('getMessages', { login, domain });
          return { success: true, messages: Array.isArray(data) ? data : [] };
        }
        if (payload.action === 'readMessage') {
          const [login, domain] = payload.email.split('@');
          const data = await handle1secmail('readMessage', { login, domain, id: payload.id });
          return { success: true, message: {
            from: data.from,
            subject: data.subject,
            date: data.date,
            htmlBody: data.htmlBody || data.body || '',
            body: data.body || data.textBody || ''
          }};
        }
        break;

      case 'mailtm':
        if (payload.action === 'genRandomMailbox' || payload.action === 'genCustomMailbox') {
          // 1. Get Domain Matrix with robust Hydra checking
          const domainsData = await handleMailTM('/domains');
          
          // Support various response paths (hydra:member, member, or hydra.member)
          const memberList = domainsData?.['hydra:member'] || 
                             domainsData?.['member'] || 
                             (domainsData?.hydra && domainsData.hydra.member);
          
          if (!memberList || !Array.isArray(memberList) || memberList.length === 0) {
            throw new Error("Mail.tm domains unavailable");
          }
          
          const domain = memberList[0]?.domain;
          if (!domain) throw new Error("Mail.tm domain identity corrupted.");

          const username = payload.username?.trim();
          const login = username || Math.random().toString(36).substring(2, 12);
          const address = `${login}@${domain}`;
          const password = Math.random().toString(36).substring(2, 12);
          
          // 2. Register Account
          try {
            const account = await handleMailTM('/accounts', 'POST', { address, password });
            if (!account || !account.address) throw new Error("Mail.tm registration rejected.");
          } catch (err: any) {
            if (payload.action === 'genCustomMailbox') {
              throw new Error("Custom username not available on this node.");
            }
            throw err;
          }
          
          // 3. Negotiate Bearer Token
          const tokenData = await handleMailTM('/token', 'POST', { address, password });
          if (!tokenData || !tokenData.token) throw new Error("Mail.tm authorization restricted.");
          
          return { 
            success: true, 
            email: address, 
            token: tokenData.token, 
            accountId: tokenData.id 
          };
        }
        if (payload.action === 'getMessages') {
          if (!payload.token) throw new Error("Session token invalid.");
          const data = await handleMailTM('/messages', 'GET', null, payload.token);
          const memberList = data?.['hydra:member'] || data?.['member'] || [];
          const mapped = memberList.map((m: any) => ({
            id: m.id,
            from: m.from?.address || 'Anonymous Sender',
            subject: m.subject || '(No Subject)',
            date: m.createdAt
          }));
          return { success: true, messages: mapped };
        }
        if (payload.action === 'readMessage') {
          if (!payload.token) throw new Error("Session token invalid.");
          const data = await handleMailTM(`/messages/${payload.id}`, 'GET', null, payload.token);
          return { success: true, message: {
            from: data.from?.address || 'Anonymous Sender',
            subject: data.subject || '(No Subject)',
            date: data.createdAt,
            htmlBody: data.html || data.text || '',
            body: data.text || data.html || ''
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
        if (payload.action === 'genCustomMailbox') {
          const resAddr = await fetch(buildUrl('get_email_address'), { cache: 'no-store' });
          const dataAddr = await resAddr.json();
          const resUser = await fetch(buildUrl('set_email_user', { 
            sid_token: dataAddr.sid_token, 
            email_user: payload.username 
          }), { cache: 'no-store' });
          const dataUser = await resUser.json();
          return { success: true, email: dataUser.email_addr, sid: dataUser.sid_token };
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
