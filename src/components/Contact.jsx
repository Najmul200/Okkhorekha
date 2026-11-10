import { useState } from 'react';
import emailjs from '@emailjs/browser';
import { SITE } from '../data/content.js';
import { supabase } from '../lib/supabase';
import useSeo from '../hooks/useSeo.js';

export default function Contact() {
  useSeo({
    title: `Contact – ${SITE.name} | Architecture & Interior Design`,
    path: '/contact',
  });

  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = e.currentTarget;
    const values = new FormData(form);

    // ==========================================
    // Get form data
    // ==========================================

    const formData = {
      name: String(values.get('name') || '').trim(),
      email: String(values.get('email') || '').trim(),
      title: String(values.get('title') || '').trim(),
      message: String(values.get('message') || '').trim(),
    };

    // ==========================================
    // Validate form
    // ==========================================

    if (
      !formData.name ||
      !formData.email ||
      !formData.title ||
      !formData.message
    ) {
      console.error('Form validation failed:', formData);

      setFeedback('Please fill in all required fields.');

      return;
    }

    // ==========================================
    // Start sending
    // ==========================================

    setSending(true);
    setFeedback('');

    let inboxSaved = false;
    try {
      const { error: inboxError } = await supabase.from('contact_messages').insert({
        name: formData.name,
        email: formData.email,
        subject: formData.title,
        message: formData.message,
      });
      if (inboxError) throw new Error(`Could not save your inquiry: ${inboxError.message}`);
      inboxSaved = true;

      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
      if (!serviceId || !templateId || !publicKey) {
        throw new Error('Email notification is not configured.');
      }

      // ========================================
      // Data sent to EmailJS
      // ========================================

      const emailData = {
        to_email: SITE.email,
        from_name: formData.name,
        reply_to: formData.email,
        name: formData.name,
        email: formData.email,
        title: formData.title,
        time: new Date().toLocaleString(),
        message: formData.message,
      };

      // ========================================
      // Send email
      // ========================================

      await emailjs.send(serviceId, templateId, emailData, publicKey);

      // ========================================
      // Success
      // ========================================

      form.reset();

      setFeedback('Thank you. Your inquiry has been sent successfully.');
    } catch (error) {
      const errorMessage = typeof error?.text === 'string'
        ? error.text
        : error instanceof Error
          ? error.message
          : 'Unknown EmailJS error';

      console.error('EmailJS request failed:', {
        status: error?.status,
        message: errorMessage,
      });

      setFeedback(inboxSaved
        ? `Your inquiry was saved to our admin inbox, but the email notification failed (${errorMessage}).`
        : errorMessage);
    } finally {
      setSending(false);
    }
  };

  return (
    <section
      className="py-20 max-[700px]:py-14"
      id="contact"
      aria-labelledby="contact-title"
      data-reveal
    >
      <div className="mx-auto w-[min(1280px,calc(100%-3rem))] max-[700px]:w-[calc(100%-2rem)] max-[360px]:w-[calc(100%-1.5rem)]">

        <div className="grid grid-cols-[0.9fr_1.1fr] items-start gap-12 pt-4 max-[900px]:grid-cols-1 max-[900px]:gap-8">

          {/* =====================================
              Contact Information
          ====================================== */}

          <div>

            <span className="mb-4 inline-block text-xs font-bold uppercase tracking-[0.13em] text-ink">
              Start a conversation
            </span>

            <h1 className="mb-4 max-w-xl font-display text-5xl font-medium leading-tight max-[700px]:text-4xl" id="contact-title">
              Let’s build something extraordinary.
            </h1>

            <p className="max-w-lg text-muted">
              Tell us what you are planning. We will get back to you
              to discuss the next steps.
            </p>

            <ul className="mt-8 list-none">

              <li className="my-3 text-muted">
                <strong>Studio</strong>
                <br />
                {SITE.address}
              </li>

              <li className="my-3 text-muted">
                <strong>Phone</strong>
                <br />
                <a href={SITE.phoneHref}>
                  {SITE.phone}
                </a>
              </li>

              <li className="my-3 text-muted">
                <strong>Email</strong>
                <br />
                <a href={`mailto:${SITE.email}`}>
                  {SITE.email}
                </a>
              </li>

            </ul>

          </div>


          {/* =====================================
              Contact Form
          ====================================== */}

          <div className="rounded-sm border border-neutral-300 bg-surface p-6 max-[700px]:p-4">

            <form
              id="inquiryForm"
              className="grid gap-4"
              onSubmit={handleSubmit}
            >

              {/* Name */}

              <input
                type="text"
                id="inquiryName"
                name="name"
                maxLength={120}
                className="w-full rounded-sm border border-neutral-300 bg-neutral-50 px-4 py-3 text-ink outline-none placeholder:text-neutral-600 focus:border-black focus:ring-2 focus:ring-black/15"
                placeholder="Your Name"
                aria-label="Your name"
                autoComplete="name"
                required
              />


              {/* Email */}

              <input
                type="email"
                id="inquiryEmail"
                name="email"
                maxLength={254}
                className="w-full rounded-sm border border-neutral-300 bg-neutral-50 px-4 py-3 text-ink outline-none placeholder:text-neutral-600 focus:border-black focus:ring-2 focus:ring-black/15"
                placeholder="Your Email"
                aria-label="Your email address"
                autoComplete="email"
                required
              />


              {/* Subject */}

              <input
                type="text"
                id="inquiryTitle"
                name="title"
                maxLength={200}
                className="w-full rounded-sm border border-neutral-300 bg-neutral-50 px-4 py-3 text-ink outline-none placeholder:text-neutral-600 focus:border-black focus:ring-2 focus:ring-black/15"
                placeholder="Subject"
                aria-label="Subject"
                required
              />


              {/* Message */}

              <textarea
                id="inquiryMessage"
                name="message"
                maxLength={10000}
                className="w-full rounded-sm border border-neutral-300 bg-neutral-50 px-4 py-3 text-ink outline-none placeholder:text-neutral-600 focus:border-black focus:ring-2 focus:ring-black/15"
                placeholder="Tell us about your project"
                aria-label="Tell us about your project"
                rows="6"
                required
              />


              {/* Submit Button */}

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 justify-self-start rounded-sm border border-black bg-black px-5 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-md disabled:cursor-wait disabled:opacity-70"
                disabled={sending}
              >
                {sending ? 'Sending…' : 'Send Inquiry'}
              </button>

            </form>


            {/* Feedback Message */}

            {feedback && (
              <p
                className="mt-3 min-h-6 text-sm text-neutral-700"
                role="status"
                aria-live="polite"
              >
                {feedback}
              </p>
            )}

          </div>

        </div>

      </div>
    </section>
  );
}