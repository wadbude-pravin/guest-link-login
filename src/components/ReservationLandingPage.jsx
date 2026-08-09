import { useState, useEffect } from 'react';
import { User, Phone, Mail, BedDouble, CalendarDays, Users, IdCard, Upload, Wallet } from 'lucide-react';
import ModalShell from './ModalShell.jsx';

const SectionTitle = ({ title }) => (
  <div className="mb-4 flex items-center gap-3">
    <span className="text-xs font-bold tracking-[0.15em] text-[#A67B5B] uppercase">{title}</span>
    <span className="h-px flex-1 bg-[#A67B5B]/15" />
  </div>
);

const Field = ({ label, icon: Icon, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</label>
    <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-3.5 py-1 transition focus-within:border-[#A67B5B] focus-within:ring-2 focus-within:ring-[#A67B5B]/20">
      <Icon size={17} className="shrink-0 text-gray-400" />
      {children}
    </div>
  </div>
);

const inputClass = 'w-full bg-transparent py-2.5 text-sm text-gray-800 outline-none placeholder:text-gray-400';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://poison-showoff-panda.ngrok-free.dev';

const ReservationLandingPage = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [roomTypes, setRoomTypes] = useState([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [property, setProperty] = useState(null);

  useEffect(() => {
    const pathParts = window.location.pathname.split('/');
    const tokenIndex = pathParts.indexOf('reservation-links') + 1;
    let token = null;
    if (tokenIndex > 0 && tokenIndex < pathParts.length) {
      token = pathParts[tokenIndex];
    }

    if (token) {
      setIsLoadingRooms(true);
      fetch(`${API_BASE_URL}/reservation-links/${token}`, {
        headers: { 'ngrok-skip-browser-warning': 'true' },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.roomTypes) {
            setRoomTypes(data.roomTypes);
          }
          if (data.property) {
            setProperty(data.property);
          }
        })
        .catch(err => console.error("Failed to fetch room types", err))
        .finally(() => setIsLoadingRooms(false));
    } else {
      // Fallback for testing without token
      setRoomTypes([]);
    }
  }, []);

  if (!isOpen) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-400/50">
        <button 
          onClick={() => setIsOpen(true)}
          className="rounded-lg bg-white px-6 py-2 shadow-md hover:bg-gray-50"
        >
          Open Reservation Form
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-400/50 pt-10">
      <ModalShell onClose={() => setIsOpen(false)} maxWidth="max-w-2xl">
        <div className="p-6 sm:p-8">
          <div className="mb-6 border-b border-gray-100 pb-4">
            <h2 className="font-serif text-2xl font-bold text-gray-900">New Reservation</h2>
            <p className="mt-1 text-sm text-gray-500">
              {property ? `Complete your booking details for ${property.name}.` : 'Manually enter guest details and room preferences to complete the booking.'}
            </p>
          </div>

          <form className="flex max-h-[65vh] flex-col gap-6 overflow-y-auto pr-1">
            {/* GUEST INFORMATION */}
            <div>
              <SectionTitle title="GUEST INFORMATION" />
              <div className="flex flex-col gap-4">
                <Field label="Guest Full Name" icon={User}>
                  <input
                    className={inputClass}
                    placeholder="E.g. Alexander Hamilton"
                  />
                </Field>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Phone Number" icon={Phone}>
                    <input
                      className={inputClass}
                      placeholder="10-digit number"
                    />
                  </Field>
                  <Field label="Email Address" icon={Mail}>
                    <input
                      className={inputClass}
                      type="email"
                      placeholder="guest@example.com"
                    />
                  </Field>
                </div>
              </div>
            </div>

            {/* BOOKING DETAILS */}
            <div>
              <SectionTitle title="BOOKING DETAILS" />
              <div className="flex flex-col gap-4">
                <Field label="Room Type" icon={BedDouble}>
                  <select className={inputClass} defaultValue="">
                    <option value="" disabled>
                      {isLoadingRooms ? 'Loading room types...' : 'Select a room type'}
                    </option>
                    {!isLoadingRooms && roomTypes.length === 0 && (
                      <option value="" disabled>No room types available</option>
                    )}
                    {roomTypes.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.name} {room.price ? `— ₹${room.price}` : room.basePrice ? `— ₹${room.basePrice}` : ''}
                      </option>
                    ))}
                  </select>
                </Field>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Check-In" icon={CalendarDays}>
                    <input
                      type="date"
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Check-Out" icon={CalendarDays}>
                    <input
                      type="date"
                      className={inputClass}
                    />
                  </Field>
                </div>

                <Field label="Number of Guests" icon={Users}>
                  <input
                    type="number"
                    className={inputClass}
                    placeholder="E.g. 2"
                  />
                </Field>
              </div>
            </div>

            {/* GUEST ID VERIFICATION */}
            <div>
              <SectionTitle title="GUEST ID VERIFICATION" />
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Upload ID Proof
                  </label>
                  <div className="mt-1.5">
                    <button
                      type="button"
                      className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#A67B5B]/30 py-6 text-sm text-[#A67B5B] transition hover:border-[#A67B5B]/60 hover:bg-[#A67B5B]/5"
                    >
                      <IdCard size={18} />
                      <Upload size={16} />
                      Tap to upload guest ID
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* PAYMENT DETAILS */}
            <div>
              <SectionTitle title="PAYMENT DETAILS" />
              <div className="flex flex-col gap-4">
                <div className="flex rounded-xl bg-white p-1 shadow-sm ring-1 ring-gray-200">
                  <button type="button" className="flex-1 rounded-lg bg-[#8B664B] py-2 text-sm font-semibold text-white shadow">
                    Partial Payment
                  </button>
                  <button type="button" className="flex-1 rounded-lg py-2 text-sm font-semibold text-gray-500 hover:text-gray-900">
                    Full Payment
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Room Price" icon={Wallet}>
                    <input
                      type="number"
                      className={inputClass}
                      placeholder="₹0"
                      disabled
                    />
                  </Field>
                  <Field label="Remaining Amount" icon={Wallet}>
                    <input
                      type="number"
                      className={inputClass}
                      placeholder="₹0"
                      disabled
                    />
                  </Field>
                </div>

                <Field label="Amount Paid" icon={Wallet}>
                  <input
                    type="number"
                    className={inputClass}
                    placeholder="0"
                  />
                </Field>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Payment Method
                  </label>
                  <select className="rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-800 outline-none transition focus:border-[#A67B5B] focus:ring-2 focus:ring-[#A67B5B]/20">
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                    <option value="card">Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="mt-4 pb-2">
              <button
                type="button"
                className="w-full rounded-full bg-[#A67B5B] px-6 py-3 text-sm font-bold tracking-wide text-white transition hover:bg-[#8B664B]"
              >
                Create Reservation
              </button>
            </div>
          </form>
        </div>
      </ModalShell>
    </div>
  );
};

export default ReservationLandingPage;
