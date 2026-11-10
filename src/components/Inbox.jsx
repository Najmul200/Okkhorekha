import { useCallback, useEffect, useState } from 'react';
import emailjs from '@emailjs/browser';
import { SITE } from '../data/content.js';
import { supabase } from '../lib/supabase';

const formatDate = (value) => new Date(value).toLocaleString();

export default function Inbox() {
  const [messages, setMessages] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [notice, setNotice] = useState('');

  const loadMessages = useCallback(async () => {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) {
      setErrorMessage(`Could not load inbox: ${error.message}`);
      setLoading(false);
      return;
    }

    setMessages(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadMessages();
    const channel = supabase
      .channel('contact-messages-inbox')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_messages' }, loadMessages)
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error(`Inbox live updates subscription failed: ${status}`);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadMessages]);

  const selectedMessage = messages.find((message) => message.id === selectedId);

  const openMessage = async (message) => {
    setSelectedId(message.id);
    setErrorMessage('');
    setNotice('');
    setReply('');
    if (message.is_read) return;

    const { error } = await supabase
      .from('contact_messages')
      .update({ is_read: true, updated_at: new Date().toISOString() })
      .eq('id', message.id);

    if (error) {
      setErrorMessage(`Could not mark message as read: ${error.message}`);
      return;
    }
    setMessages((current) => current.map((item) =>
      item.id === message.id ? { ...item, is_read: true } : item
    ));
  };

  const handleReply = async (event) => {
    event.preventDefault();
    if (!selectedMessage || !reply.trim()) return;

    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
    if (!serviceId || !templateId || !publicKey) {
      setErrorMessage('Email reply is not configured. Set the EmailJS environment variables and redeploy.');
      return;
    }

    setSending(true);
    setErrorMessage('');
    setNotice('');
    const replyText = reply.trim();
    const sentAt = new Date().toISOString();

    try {
      await emailjs.send(serviceId, templateId, {
        to_email: selectedMessage.email,
        from_name: SITE.name,
        reply_to: SITE.email,
        name: SITE.name,
        email: SITE.email,
        title: `Re: ${selectedMessage.subject}`,
        time: new Date(sentAt).toLocaleString(),
        message: replyText,
      }, publicKey);

      const replies = [...(selectedMessage.replies || []), { message: replyText, sent_at: sentAt }];
      const { error } = await supabase
        .from('contact_messages')
        .update({ replies, is_read: true, updated_at: sentAt })
        .eq('id', selectedMessage.id);

      if (error) {
        setErrorMessage(`Reply email was sent, but it could not be saved in the conversation: ${error.message}`);
        return;
      }

      setMessages((current) => current.map((item) =>
        item.id === selectedMessage.id ? { ...item, replies, is_read: true, updated_at: sentAt } : item
      ));
      setReply('');
      setNotice('Reply sent successfully.');
    } catch (error) {
      const message = typeof error?.text === 'string'
        ? error.text
        : error instanceof Error
          ? error.message
          : 'Unknown EmailJS error';
      console.error('Inbox reply failed:', { status: error?.status, message });
      setErrorMessage(`Could not send reply: ${message}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="flex min-h-[70vh] flex-col rounded-lg border border-gray-100 bg-white p-6 shadow-sm md:p-8">
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
            {messages.filter((message) => !message.is_read).length} unread
          </span>
          <h1 className="mt-1 text-3xl font-bold text-gray-900">Inbox</h1>
        </div>
        <button type="button" onClick={loadMessages} className="text-xs font-bold uppercase tracking-wider text-[#c65f20]">
          Refresh
        </button>
      </header>

      {errorMessage && <p role="alert" className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">{errorMessage}</p>}
      {notice && <p role="status" className="mb-4 rounded bg-green-50 p-3 text-sm text-green-700">{notice}</p>}

      <div className="grid min-h-[480px] flex-1 overflow-hidden rounded border border-gray-200 md:grid-cols-[minmax(240px,0.8fr)_minmax(0,1.5fr)]">
        <div className="max-h-[70vh] overflow-y-auto border-b border-gray-200 md:border-b-0 md:border-r">
          {loading ? (
            <p className="p-5 text-sm text-gray-500">Loading messages…</p>
          ) : messages.length === 0 ? (
            <p className="p-5 text-sm text-gray-500">No messages yet. Website contact form submissions will appear here.</p>
          ) : messages.map((message) => (
            <button
              key={message.id}
              type="button"
              onClick={() => openMessage(message)}
              className={`block w-full border-b border-gray-100 p-4 text-left transition hover:bg-orange-50 ${
                selectedId === message.id ? 'bg-orange-50' : ''
              }`}
            >
              <span className="flex items-center justify-between gap-2">
                <strong className={`truncate text-sm text-gray-900 ${message.is_read ? 'font-medium' : 'font-bold'}`}>{message.name}</strong>
                {!message.is_read && <span className="h-2 w-2 shrink-0 rounded-full bg-[#c65f20]" aria-label="Unread" />}
              </span>
              <span className="mt-1 block truncate text-sm text-gray-700">{message.subject}</span>
              <span className="mt-1 block text-xs text-gray-400">{formatDate(message.created_at)}</span>
            </button>
          ))}
        </div>

        <div className="flex min-w-0 flex-col">
          {!selectedMessage ? (
            <p className="m-auto p-6 text-center text-sm text-gray-500">Choose a message to read and reply.</p>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-5 md:p-7">
                <h2 className="text-xl font-bold text-gray-900">{selectedMessage.subject}</h2>
                <p className="mt-2 text-sm text-gray-500">
                  {selectedMessage.name} · <a className="text-[#a84d18] underline" href={`mailto:${selectedMessage.email}`}>{selectedMessage.email}</a>
                </p>
                <p className="mt-1 text-xs text-gray-400">{formatDate(selectedMessage.created_at)}</p>
                <div className="mt-6 whitespace-pre-wrap rounded bg-gray-50 p-4 text-sm leading-6 text-gray-800">{selectedMessage.message}</div>

                {(selectedMessage.replies || []).map((item, index) => (
                  <div key={`${item.sent_at}-${index}`} className="ml-auto mt-4 max-w-[90%] rounded bg-orange-50 p-4">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#a84d18]">Your reply · {formatDate(item.sent_at)}</p>
                    <p className="whitespace-pre-wrap text-sm leading-6 text-gray-800">{item.message}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleReply} className="border-t border-gray-200 p-4 md:p-5">
                <label htmlFor="inbox-reply" className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">Reply by email</label>
                <textarea
                  id="inbox-reply"
                  required
                  rows={4}
                  value={reply}
                  onChange={(event) => setReply(event.target.value)}
                  placeholder={`Write a reply to ${selectedMessage.name}…`}
                  className="w-full resize-y rounded border border-gray-300 p-3 text-sm outline-none focus:border-[#c65f20]"
                />
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs text-gray-400">To: {selectedMessage.email}</span>
                  <button
                    type="submit"
                    disabled={sending || !reply.trim()}
                    className="rounded bg-[#c65f20] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#a84d18] disabled:cursor-wait disabled:opacity-60"
                  >
                    {sending ? 'SENDING…' : 'SEND REPLY'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
