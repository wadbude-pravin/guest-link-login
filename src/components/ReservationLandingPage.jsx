import { useState, useEffect } from 'react';
import { User, Phone, Mail, BedDouble, CalendarDays, Users, IdCard, Upload, Wallet, Loader2 } from 'lucide-react';
import ModalShell from './ModalShell.jsx';

const SectionTitle = ({ title }) => (
  <div className="mb-4 flex items-center gap-3">
    <span className="text-xs font-bold tracking-[0.15em] text-[#A67B5B] uppercase">{title}</span>
    <span className="h-px flex-1 bg-[#A67B5B]/15" />
  </div>
);

const Field = ({ label, icon: Icon, children, ...inputProps }) => (
  <div className="flex flex-col gap-1.5 w-full">
    <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</label>
    <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-3.5 py-1 transition focus-within:border-[#A67B5B] focus-within:ring-2 focus-within:ring-[#A67B5B]/20 bg-white">
      {Icon && <Icon size={17} className="shrink-0 text-gray-400" />}
      {children ? children : (
        <input
          className="w-full bg-transparent py-2.5 text-sm text-gray-800 outline-none placeholder:text-gray-400 disabled:opacity-60 disabled:cursor-not-allowed"
          {...inputProps}
        />
      )}
    </div>
  </div>
);

const inputClass = 'w-full bg-transparent py-2.5 text-sm text-gray-800 outline-none placeholder:text-gray-400 disabled:opacity-60 disabled:cursor-not-allowed';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://poison-showoff-panda.ngrok-free.dev';

const ReservationLandingPage = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [roomTypes, setRoomTypes] = useState([]);

  // Explicit asynchronous loader pattern to ensure inputs aren't mounted with empty states before API completion
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [property, setProperty] = useState(null);

  // 💡 GUEST FORM STATES (Matched Exactly with API Keys)
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');

  useEffect(() => {
    const pathParts = window.location.pathname.split('/');
    const tokenIndex = pathParts.indexOf('reservation-links') + 1;
    let token = null;
    if (tokenIndex > 0 && tokenIndex < pathParts.length) {
      token = pathParts[tokenIndex];
    }

    if (token) {
      setIsFetchingData(true);
      fetch(`${API_BASE_URL}/reservation-links/${token}`, {
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          return res.json();
        })
        .then((data) => {
          console.log("🔍 FETCHED RESERVATION DATA:", data);

          if (data.roomTypes) setRoomTypes(data.roomTypes);
          if (data.property) setProperty(data.property);

          // 💡 Extract reservationLink object safely
          const resLink = data.reservationLink || data.link || data;

          if (resLink) {
            // Force state update with exact backend field names and safe fallbacks (avoiding undefined)
            setGuestName(resLink.guestName || resLink.name || '');
            setGuestPhone(resLink.guestPhone || resLink.phone || resLink.phoneNumber || '');
            setGuestEmail(resLink.guestEmail || resLink.email || resLink.emailAddress || '');
          }
        })
        .catch(err => console.error("Failed to fetch reservation link details:", err))
        .finally(() => setIsFetchingData(false));
    } else {
      setIsFetchingData(false);
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

          {isFetchingData ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500 h-[65vh]">
              <Loader2 className="mb-4 h-8 w-8 animate-spin text-[#A67B5B]" />
              <p className="text-sm font-medium">Loading reservation details...</p>
            </div>
          ) : (
            <form className="flex max-h-[65vh] flex-col gap-6 overflow-y-auto pr-1" onSubmit={(e) => e.preventDefault()}>
              {/* GUEST INFORMATION */}
              <div>
                <SectionTitle title="GUEST INFORMATION" />
                <div className="flex flex-col gap-4">
                  {/* Guest Name */}
                  <Field
                    label="Guest Full Name"
                    icon={User}
                    type="text"
                    id="guestName"
                    name="guestName"
                    placeholder="E.g. Alexander Hamilton"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                  />

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Guest Phone */}
                    <Field
                      label="Phone Number"
                      icon={Phone}
                      type="tel"
                      id="guestPhone"
                      name="guestPhone"
                      placeholder="10-digit number"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                    />

                    {/* Guest Email */}
                    <Field
                      label="Email Address"
                      icon={Mail}
                      type="email"
                      id="guestEmail"
                      name="guestEmail"
                      placeholder="guest@example.com"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* BOOKING DETAILS */}
              <div>
                <SectionTitle title="BOOKING DETAILS" />
                <div className="flex flex-col gap-4">
                  <Field label="Room Type" icon={BedDouble}>
                    <select className={inputClass} defaultValue="">
                      <option value="" disabled>Select a room type</option>
                      {roomTypes.length === 0 && (
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
                    <Field
                      label="Check-In"
                      icon={CalendarDays}
                      type="date"
                      name="checkInDate"
                    />
                    <Field
                      label="Check-Out"
                      icon={CalendarDays}
                      type="date"
                      name="checkOutDate"
                    />
                  </div>

                  <Field
                    label="Number of Guests"
                    icon={Users}
                    type="number"
                    name="numberOfGuests"
                    min="1"
                    placeholder="E.g. 2"
                  />
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
                        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#A67B5B]/30 py-6 text-sm text-[#A67B5B] transition hover:border-[#A67B5B]/60 hover:bg-[#A67B5B]/5 focus:outline-none focus:ring-2 focus:ring-[#A67B5B]/20"
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
                    <button type="button" className="flex-1 rounded-lg bg-[#8B664B] py-2 text-sm font-semibold text-white shadow focus:outline-none focus:ring-2 focus:ring-[#A67B5B]/50">
                      Partial Payment
                    </button>
                    <button type="button" className="flex-1 rounded-lg py-2 text-sm font-semibold text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200">
                      Full Payment
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field
                      label="Room Price"
                      icon={Wallet}
                      type="number"
                      name="roomPrice"
                      placeholder="₹0"
                      disabled
                    />
                    <Field
                      label="Remaining Amount"
                      icon={Wallet}
                      type="number"
                      name="remainingAmount"
                      placeholder="₹0"
                      disabled
                    />
                  </div>

                  <Field
                    label="Amount Paid"
                    icon={Wallet}
                    type="number"
                    name="amountPaid"
                    placeholder="0"
                  />

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Payment Method
                    </label>
                    <select className="rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-800 outline-none transition focus:border-[#A67B5B] focus:ring-2 focus:ring-[#A67B5B]/20 bg-white">
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
                  type="submit"
                  className="w-full rounded-full bg-[#A67B5B] px-6 py-3 text-sm font-bold tracking-wide text-white transition hover:bg-[#8B664B] focus:outline-none focus:ring-4 focus:ring-[#A67B5B]/30"
                >
                  Create Reservation
                </button>
              </div>
            </form>
          )}
        </div>
      </ModalShell>
    </div>
  );
};

export default ReservationLandingPage;