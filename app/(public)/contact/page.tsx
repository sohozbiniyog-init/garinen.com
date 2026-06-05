"use client";

import { useState } from 'react';
import { showToast } from '@/components/common/Toast';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/[^\d]/g, '') || '8801616449801';
  const whatsappDefaultMessage = process.env.NEXT_PUBLIC_WHATSAPP_DEFAULT_MESSAGE || 'Hello, I need help with Ghuri Automobiles.';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, message }),
      });

      if (!res.ok) throw new Error('Failed to send message');
      setStatus('sent');
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
      showToast('Message sent — we will reply within one business day.', { type: 'success' });
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <main className="min-h-screen w-full px-6 py-10 lg:px-10">
      <section className="rounded-[2rem] border border-black/10 bg-white/80 p-8 shadow-soft max-w-3xl">
        <p className="text-sm uppercase tracking-[0.2em] text-smoke">Contact</p>
        <h1 className="mt-3 text-3xl font-bold text-ink">Get in touch</h1>
        <p className="mt-3 text-sm leading-7 text-smoke">Send us a message and our sales/support team will respond within one business day.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-ink">Full name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="mt-2 w-full rounded-lg border border-black/10 px-4 py-3" placeholder="Your full name" required />
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="mt-2 w-full rounded-lg border border-black/10 px-4 py-3" placeholder="you@example.com" required />
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink">Phone (optional)</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-2 w-full rounded-lg border border-black/10 px-4 py-3" placeholder="Optional phone for follow-up" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink">Message</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={6} className="mt-2 w-full rounded-lg border border-black/10 px-4 py-3" placeholder="How can we help?" required />
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={status === 'sending'} className="rounded-full bg-moss px-6 py-3 text-white font-semibold">
              {status === 'sending' ? 'Sending…' : 'Send Message'}
            </button>
            <a href={`mailto:info@ghuriautomobiles.com?subject=${encodeURIComponent('Website contact')}&body=${encodeURIComponent(message)}`} className="rounded-full border px-6 py-3 text-ink">Open mail app</a>
            <a href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappDefaultMessage)}`} target="_blank" rel="noreferrer" className="rounded-full border px-6 py-3 text-ink">Contact via WhatsApp</a>
          </div>

          {status === 'sent' && <div role="status" className="mt-4 rounded-lg bg-emerald-50 p-3 text-emerald-800">Thanks — your message was sent. We&apos;ll reply shortly.</div>}
          {status === 'error' && <div role="alert" className="mt-4 rounded-lg bg-rose-50 p-3 text-rose-800">Unable to send message. Please try again or use the email link.</div>}
        </form>

        <div className="mt-8 border-t pt-6 text-sm text-slate-600">
          <p>Prefer direct contact? Email us at <a href="mailto:info@ghuriautomobiles.com" className="underline">info@ghuriautomobiles.com</a> or WhatsApp <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noreferrer" className="underline">+{whatsappNumber}</a>.</p>
        </div>
      </section>
    </main>
  );
}
