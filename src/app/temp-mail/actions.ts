'use server';

/**
 * @fileOverview Server actions for Temp Mail Studio.
 * Handles high-fidelity multi-node proxying for temporary email services.
 * Supports Guerrilla, TempMail.lol, Mailnesia, TempMailC, MailForSpam, Temporam, and Sharklasers.
 */

const NODES = {
  guerrilla: 'https://api.guerrillamail.com/ajax.php',
  tempmail_lol: 'https://api.tempmail.lol',
  mailnesia: 'https://mailnesia.com/api',
  tempmailc: 'https://tempmailc.com/api/v1',
  mailforspam: 'https://www.mailforspam.com/api',
  temporam: 'https://temporam.com/api',
  sharklasers: 'https://www.sharklasers.com/ajax.php'
};

export async function fetchFromProvider(providerId: string, payload: any) {
  try {
    switch (providerId) {
      /**
       * Node: Sharklasers (Mirror)
       */
      case 'sharklasers':
        const buildSharkUrl = (f: string, extra = {}) => {
          const u = new URL(NODES.sharklasers);
          u.searchParams.append('f', f);
          u.searchParams.append('ip', '127.0.0.1');
          u.searchParams.append('agent', 'Mozilla/5.0');
          Object.entries(extra).forEach(([k, v]) => u.searchParams.append(k, String(v)));
          return u.toString();
        };

        if (payload.action === 'genRandomMailbox') {
          const res = await fetch(buildSharkUrl('get_email_address'), { cache: 'no-store' });
          const data = await res.json();
          return { success: true, email: data.email_addr, sid: data.sid_token };
        }
        if (payload.action === 'genCustomMailbox') {
          const resAddr = await fetch(buildSharkUrl('get_email_address'), { cache: 'no-store' });
          const dataAddr = await resAddr.json();
          const resUser = await fetch(buildSharkUrl('set_email_user', { 
            sid_token: dataAddr.sid_token, 
            email_user: payload.username 
          }), { cache: 'no-store' });
          const dataUser = await resUser.json();
          return { success: true, email: dataUser.email_addr, sid: dataUser.sid_token };
        }
        if (payload.action === 'getMessages') {
          const res = await fetch(buildSharkUrl('check_email', { sid_token: payload.sid, seq: 0 }), { cache: 'no-store' });
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
          const res = await fetch(buildSharkUrl('fetch_email', { sid_token: payload.sid, email_id: payload.id }), { cache: 'no-store' });
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

      /**
       * Node: TempMailC
       */
      case 'tempmailc':
        if (payload.action === 'genRandomMailbox' || payload.action === 'genCustomMailbox') {
          const res = await fetch(`${NODES.tempmailc}/new`, { cache: 'no-store' });
          const data = await res.json();
          if (!data.email) throw new Error("TempMailC node restricted.");
          return { success: true, email: data.email };
        }
        if (payload.action === 'getMessages') {
          const res = await fetch(`${NODES.tempmailc}/inbox?email=${encodeURIComponent(payload.email)}`, { cache: 'no-store' });
          const data = await res.json();
          const mapped = (data || []).map((m: any) => ({
            id: m.id || m.msg_id,
            from: m.from || m.sender,
            subject: m.subject,
            date: m.date || new Date().toLocaleString(),
            htmlBody: m.html || m.body || '',
            body: m.body || m.text || ''
          }));
          return { success: true, messages: mapped };
        }
        if (payload.action === 'readMessage') {
          const res = await fetch(`${NODES.tempmailc}/message?email=${encodeURIComponent(payload.email)}&msg_id=${payload.id}`, { cache: 'no-store' });
          const data = await res.json();
          return { success: true, message: {
            from: data.from || data.sender,
            subject: data.subject,
            date: data.date || new Date().toLocaleString(),
            htmlBody: data.html || data.body || '',
            body: data.body || data.text || ''
          }};
        }
        break;

      /**
       * Node: MailForSpam
       */
      case 'mailforspam':
        if (payload.action === 'genRandomMailbox') {
          const name = Math.random().toString(36).substring(2, 10);
          return { success: true, email: `${name}@mailforspam.com`, username: name };
        }
        if (payload.action === 'genCustomMailbox') {
          return { success: true, email: `${payload.username}@mailforspam.com`, username: payload.username };
        }
        if (payload.action === 'getMessages') {
          const user = payload.email.split('@')[0];
          const res = await fetch(`${NODES.mailforspam}/mailboxes/${user}/emails`, { cache: 'no-store' });
          const data = await res.json();
          const mapped = (data || []).map((m: any) => ({
            id: m.id,
            from: m.from,
            subject: m.subject,
            date: m.receivedAt || new Date().toLocaleString()
          }));
          return { success: true, messages: mapped };
        }
        if (payload.action === 'readMessage') {
          const user = payload.email.split('@')[0];
          const res = await fetch(`${NODES.mailforspam}/mailboxes/${user}/emails/${payload.id}`, { cache: 'no-store' });
          const data = await res.json();
          return { success: true, message: {
            from: data.from,
            subject: data.subject,
            date: data.receivedAt || new Date().toLocaleString(),
            htmlBody: data.html || data.text || '',
            body: data.text || data.html || ''
          }};
        }
        break;

      /**
       * Node: Temporam
       */
      case 'temporam':
        if (payload.action === 'genRandomMailbox' || payload.action === 'genCustomMailbox') {
          const dRes = await fetch(`${NODES.temporam}/domains`, { cache: 'no-store' });
          const domains = await dRes.json();
          const domain = domains[0] || 'temporam.com';
          const name = payload.username || Math.random().toString(36).substring(2, 10);
          return { success: true, email: `${name}@${domain}` };
        }
        if (payload.action === 'getMessages') {
          const res = await fetch(`${NODES.temporam}/emails?email=${encodeURIComponent(payload.email)}`, { cache: 'no-store' });
          const data = await res.json();
          const mapped = (data || []).map((m: any) => ({
            id: m.id,
            from: m.from,
            subject: m.subject,
            date: m.createdAt || new Date().toLocaleString()
          }));
          return { success: true, messages: mapped };
        }
        if (payload.action === 'readMessage') {
          const res = await fetch(`${NODES.temporam}/emails/${payload.id}`, { cache: 'no-store' });
          const data = await res.json();
          return { success: true, message: {
            from: data.from,
            subject: data.subject,
            date: data.createdAt || new Date().toLocaleString(),
            htmlBody: data.html || data.text || '',
            body: data.text || data.html || ''
          }};
        }
        break;

      /**
       * Node: TempMail.lol (V2 Protocol)
       */
      case 'tempmail_lol':
        if (payload.action === 'genRandomMailbox' || payload.action === 'genCustomMailbox') {
          const res = await fetch(`${NODES.tempmail_lol}/v2/inbox/create`, {
            method: 'POST',
            cache: 'no-store'
          });
          const data = await res.json();
          if (!data.address) throw new Error("TempMail.lol node restricted.");
          return { 
            success: true, 
            email: data.address, 
            token: data.token 
          };
        }
        if (payload.action === 'getMessages') {
          const res = await fetch(`${NODES.tempmail_lol}/v2/inbox?token=${payload.token}`, { cache: 'no-store' });
          const data = await res.json();
          const mapped = (data.emails || []).map((m: any) => ({
            id: m.id || Math.random().toString(36).substr(2, 9),
            from: m.from,
            subject: m.subject,
            date: new Date(m.date * 1000).toLocaleString(),
            htmlBody: m.html || m.body || '',
            body: m.body || m.html || ''
          }));
          return { success: true, messages: mapped };
        }
        if (payload.action === 'readMessage') {
          return { success: true };
        }
        break;

      /**
       * Node: Mailnesia
       */
      case 'mailnesia':
        if (payload.action === 'genRandomMailbox') {
          const name = Math.random().toString(36).substring(2, 10);
          return { success: true, email: `${name}@mailnesia.com`, username: name };
        }
        if (payload.action === 'genCustomMailbox') {
          return { success: true, email: `${payload.username}@mailnesia.com`, username: payload.username };
        }
        if (payload.action === 'getMessages') {
          return { success: true, messages: [] };
        }
        break;

      /**
       * Node: Guerrilla Mail
       */
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
            from: data.from,
            subject: data.subject,
            date: data.date,
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
