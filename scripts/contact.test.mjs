import test from 'node:test';
import assert from 'node:assert/strict';
import { handleContact } from '../lib/contact.ts';

const env = { ZOHO_SMTP_HOST: 'smtp.example.test', ZOHO_SMTP_PORT: '465', ZOHO_SMTP_USER: 'test', ZOHO_SMTP_PASSWORD: 'test-only', CONTACT_FROM_EMAIL: 'sender@example.test', CONTACT_TO_EMAIL: 'inbox@example.test' };
function request(values = {}, attachment) {
  const form = new FormData();
  for (const [key, value] of Object.entries({ email: 'person@example.test', description: 'An internal workflow application.', ...values })) form.set(key, value);
  if (attachment) form.set('attachment', attachment);
  return new Request('https://example.test/api/contact', { method: 'POST', body: form });
}
test('invalid input and honeypot do not send or report success', async () => {
  for (const values of [{ email: 'invalid' }, { description: '' }, { companyWebsite: 'bot' }, { expertise: 'unlisted' }, { budget: 'unlisted' }, { email: 'a@b.test\r\nBcc: victim@b.test' }]) {
    let calls = 0;
    const result = await handleContact(request(values), env, async () => { calls++; return { accepted: ['inbox@example.test'] }; });
    assert.equal(result.status, 400); assert.equal(calls, 0); assert.notEqual((await result.json()).delivered, true);
  }
});
test('oversized attachment is rejected before delivery', async () => {
  const result = await handleContact(request({}, new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'large.bin')), env, async () => { assert.fail('must not send'); });
  assert.equal(result.status, 413);
});
test('missing configuration returns useful email fallback', async () => {
  const result = await handleContact(request(), {}, async () => { assert.fail('must not send'); });
  assert.equal(result.status, 503); assert.match((await result.json()).message, /hello@mzfortech.com/);
});
test('SMTP rejection and failure do not falsely report success', async () => {
  for (const deliver of [async () => ({ accepted: [] }), async () => { throw Error('private transport detail'); }]) {
    const result = await handleContact(request(), env, deliver);
    assert.equal(result.status, 502); assert.notEqual((await result.json()).delivered, true);
  }
});
test('successful delivery preserves brief and sanitizes attachment name', async () => {
  const result = await handleContact(request({ expertise: 'Website', referral: 'AI assistant' }, new File(['brief'], '../brief.txt')), env, async (settings, mail) => {
    assert.equal(settings.secure, true); assert.equal(mail.to, env.CONTACT_TO_EMAIL);
    assert.equal(mail.replyTo, 'person@example.test'); assert.match(mail.text, /An internal workflow application/);
    assert.equal(mail.attachments[0].filename, '.._brief.txt');
    return { accepted: ['inbox@example.test'] };
  });
  assert.equal(result.status, 200); assert.equal((await result.json()).delivered, true);
});
test('STARTTLS configuration on port 587', async () => {
  const result = await handleContact(request(), { ...env, ZOHO_SMTP_PORT: '587' }, async (settings) => {
    assert.equal(settings.secure, false); assert.equal(settings.requireTLS, true); return { accepted: ['inbox@example.test'] };
  });
  assert.equal(result.status, 200);
});
