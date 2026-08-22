'use server';

/**
 * @fileOverview Server actions for Temp Mail Studio.
 * Handles high-fidelity multi-node proxying for temporary email services.
 * Re-engineered for Dropmail (GraphQL), TempMailC, and ThrowawayMail protocols.
 */

const NODES = {
  'guerrilla': 'https://api.guerrillamail.com/ajax.php',
  'tempmailc': 'https://tempmailc.com/api/v1',
  'throwawaymail': 'https://throwawaymail.app/api'
};

/**
 * High-fidelity GraphQL Proxy for Dropmail
 */
async function handleDropmail(token: string, query: string) {
  try {
    const res = await fetch(`https://dropmail.me/api/graphql/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
      cache: 'no-store'
    });
    if (!res.ok) throw new Error(`Dropmail node error: ${res.status}`);
    return await res.json();
  } catch (err) {
    throw new Error("Dropmail node unreachable.");
  }
}

export async function fetchFromProvider(providerId: string, payload: any) {
  try {
    switch (providerId) {
      case 'dropmail':
        if (payload.action === 'genRandomMailbox') {
          const token = Math.random().toString(36).substring(2, 14);
          const query = `mutation { introduceSession { id, expiresAt, addresses { address } } }`;
          const data = await handleDropmail(token, query);
          const session = data.data.introduceSession;
          return { 
            success: true, 
            email: session.addresses[0].address, 
            sid: session.id,
            token: token
          };
        }
        if (payload.action === 'getMessages') {
          const query = `query { session(id: "${payload.sid}") { mails { id, fromAddr, headerSubject, receivedAt } } }`;
          const data = await handleDropmail(payload.token, query);
          const mapped = (data.data.session?.mails || []).map((m: any) => ({
            id: m.id,
            from: m.fromAddr,
            subject: m.headerSubject,
            date: m.receivedAt
          }));
          return { success: true, messages: mapped };
        }
        if (payload.action === 'readMessage') {
          const query = `query { session(id: "${payload.sid}") { mails { id, fromAddr, headerSubject, text, html, receivedAt } } }`;
          const data = await handleDropmail(payload.token, query);
          const mail = data.data.session.mails.find((m: any) => m.id === payload.id);
          return { success: true, message: {
            from: mail.fromAddr,
            subject: mail.headerSubject,
            date: mail.receivedAt,
            htmlBody: mail.html || mail.text || '',
            body: mail.text || mail.html || ''
          }};
        }
        break;

      case 'tempmailc':
        if (payload.action === 'genRandomMailbox') {
          const res = await fetch(`${NODES.tempmailc}/new`, { cache: 'no-store' });
          const data = await res.json();
          return { success: true, email: data.email };
        }
        if (payload.action === 'getMessages') {
          const res = await fetch(`${NODES.tempmailc}/inbox?email=${payload.email}`, { cache: 'no-store' });
          const data = await res.json();
          const mapped = (data.messages || []).map((m: any) => ({
            id: m.id,
            from: m.from,
            subject: m.subject,
            date: m.created_at
          }));
          return { success: true, messages: mapped };
        }
        if (payload.action === 'readMessage') {
          const res = await fetch(`${NODES.tempmailc}/message?email=${payload.email}&msg_id=${payload.id}`, { cache: 'no-store' });
          const data = await res.json();
          return { success: true, message: {
            from: data.from,
            subject: data.subject,
            date: data.created_at,
            htmlBody: data.html_body || data.body || '',
            body: data.body || data.html_body || ''
          }};
        }
        break;

      case 'throwawaymail':
        if (payload.action === 'genRandomMailbox') {
          const res = await fetch(`${NODES.throwawaymail}/mailboxes`, { method: 'POST', cache: 'no-store' });
          const data = await res.json();
          return { success: true, email: data.email, sid: data.id };
        }
        if (payload.action === 'getMessages') {
          const res = await fetch(`${NODES.throwawaymail}/mailboxes/${payload.sid}/messages`, { cache: 'no-store' });
          const data = await res.json();
          const mapped = (data || []).map((m: any) => ({
            id: m.id,
            from: m.from,
            subject: m.subject,
            date: m.created_at
          }));
          return { success: true, messages: mapped };
        }
        if (payload.action === 'readMessage') {
          const res = await fetch(`${NODES.throwawaymail}/mailboxes/${payload.sid}/messages/${payload.id}`, { cache: 'no-store' });
          const data = await res.json();
          return { success: true, message: {
            from: data.from,
            subject: data.subject,
            date: data.created_at,
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
