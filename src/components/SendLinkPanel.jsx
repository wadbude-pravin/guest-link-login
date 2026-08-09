import { useState } from 'react';
import { MailPlus, Loader2, CheckCircle2 } from 'lucide-react';
import ModalShell from './ModalShell.jsx';

const initialState = { guestEmail: '', guestPhone: '' };

const SendLinkPanel = ({ onClose, onLinkSent }) => {
  const [form, setForm] = useState(initialState);
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [error, setError] = useState('');

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.guestEmail && !form.guestPhone) {
      setError('Enter at least an email or phone number.');
      return;
    }
    setError('');
    setStatus('submitting');
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://poison-showoff-panda.ngrok-free.dev';
      const res = await fetch(`${API_BASE_URL}/reservation-links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to generate reservation link');
      const data = await res.json();
      setStatus('success');
      onLinkSent?.(data);
    } catch (err) {
      setStatus('error');
      setError(err.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <ModalShell onClose={onClose}>
      <div className="p-6 sm:p-8">
        <div className="mb-6 border-b border-gray-100 pb-4">
          <h2 className="font-serif text-xl font-bold text-textDark">
            Send Reservation Link
          </h2>
          <p className="mt-1 text-sm text-textMuted">
            Enter the guest's contact details to generate and send a secure booking link.
          </p>
        </div>

        {status === 'success' ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <CheckCircle2 className="text-bronze" size={48} />
            <p className="font-serif text-lg text-textDark">Link sent successfully</p>
            <p className="text-sm text-textMuted">
              The reservation link has been sent to the guest.
            </p>
            <button
              onClick={onClose}
              className="mt-4 rounded-full bg-bronze px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-bronze-600"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="guestEmail" className="text-xs font-semibold uppercase tracking-wide text-textMuted">
                Guest Email
              </label>
              <input
                id="guestEmail"
                type="email"
                placeholder="guest@example.com"
                value={form.guestEmail}
                onChange={handleChange('guestEmail')}
                className="rounded-xl border border-bronze/20 px-4 py-3 text-sm text-textDark outline-none transition focus:border-bronze focus:ring-2 focus:ring-bronze/20"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="guestPhone" className="text-xs font-semibold uppercase tracking-wide text-textMuted">
                Guest Phone
              </label>
              <input
                id="guestPhone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={form.guestPhone}
                onChange={handleChange('guestPhone')}
                className="rounded-xl border border-bronze/20 px-4 py-3 text-sm text-textDark outline-none transition focus:border-bronze focus:ring-2 focus:ring-bronze/20"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={status === 'submitting'}
              className="mt-2 flex items-center justify-center gap-2 rounded-full bg-bronze px-6 py-3 text-sm font-bold tracking-wide text-white transition hover:bg-bronze-600 disabled:opacity-60"
            >
              {status === 'submitting' ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Sending...
                </>
              ) : (
                <>
                  <MailPlus size={18} />
                  Send Link
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </ModalShell>
  );
};

export default SendLinkPanel;
