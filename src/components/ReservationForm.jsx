import { useState, useEffect, useMemo, useRef } from 'react';
import {
  User,
  Phone,
  Mail,
  BedDouble,
  CalendarDays,
  Users,
  IdCard,
  Upload,
  Wallet,
  CheckCircle2,
  Loader2,
  X,
} from 'lucide-react';
import ModalShell from './ModalShell.jsx';

const ID_PROOF_TYPES = [
  { label: 'Aadhar', value: 'AADHAR' },
  { label: 'Passport', value: 'PASSPORT' },
  { label: 'Driving License', value: 'DRIVING_LICENSE' },
  { label: 'Voter ID', value: 'VOTER_ID' },
  { label: 'Other', value: 'OTHER' },
];

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const validatePhone = (phone) => /^\d{10}$/.test(phone.replace(/\D/g, ''));
const validateEmail = (email) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
const validateDate = (dateString) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date >= today && !isNaN(date.getTime());
};
const toDateInputValue = (value) => (value ? new Date(value).toISOString().slice(0, 10) : '');
const formatDisplayDate = (value) =>
  value
    ? new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
    : '';

const initialState = {
  guestName: '',
  phone: '',
  email: '',
  roomTypeId: '',
  roomPrice: 0,
  checkIn: '',
  checkOut: '',
  guests: '',
  idProofType: '',
  paymentType: 'partial',
  paidAmount: '',
  paymentMethod: 'cash',
};

const SectionTitle = ({ title }) => (
  <div className="mb-4 flex items-center gap-3">
    <span className="text-xs font-bold tracking-[0.15em] text-[#A67B5B] uppercase">{title}</span>
    <span className="h-px flex-1 bg-[#A67B5B]/15" />
  </div>
);

const Field = ({ label, icon: Icon, error, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</label>
    <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-3.5 py-1 transition focus-within:border-[#A67B5B] focus-within:ring-2 focus-within:ring-[#A67B5B]/20">
      <Icon size={17} className="shrink-0 text-gray-400" />
      {children}
    </div>
    {error && <p className="text-xs text-red-600">{error}</p>}
  </div>
);

const ReadOnlyField = ({ label, icon: Icon, value }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</label>
    <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5">
      <Icon size={17} className="shrink-0 text-gray-400" />
      <span className="text-sm text-gray-800">{value}</span>
    </div>
  </div>
);

const inputClass = 'w-full bg-transparent py-2.5 text-sm text-gray-800 outline-none placeholder:text-gray-400';

const ReservationForm = ({ onClose, onBookingCreated, token: propToken }) => {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [roomTypes, setRoomTypes] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | submitting | success
  const [bookingResult, setBookingResult] = useState(null);
  const fileInputRef = useRef(null);

  const [pinned, setPinned] = useState({ roomType: false, dates: false, guestName: false });
  const [property, setProperty] = useState(null);
  const [linkState, setLinkState] = useState('loading'); // loading | ready | error
  const [linkError, setLinkError] = useState('');
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);

  // ReservationForm.jsx ke andar:

  useEffect(() => {
    let cancelled = false;

    const fetchDetails = async () => {
      try {
        let currentToken = propToken;
        if (!currentToken) {
          const pathParts = window.location.pathname.split('/');
          const tokenIndex = pathParts.indexOf('reservation-links') + 1;
          if (tokenIndex > 0 && tokenIndex < pathParts.length) {
            currentToken = pathParts[tokenIndex];
          }
        }

        if (!currentToken) throw new Error("Invalid or missing reservation token.");

        setLinkState('loading');

        const res = await fetch(`${API_BASE_URL}/reservation-links/${currentToken}`, {
          headers: { 'ngrok-skip-browser-warning': 'true' },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'This reservation link is no longer valid');
        if (cancelled) return;

        const { reservationLink, property: prop, roomTypes: fetchedRoomTypes } = data;

        setProperty(prop ?? null);
        setRoomTypes(fetchedRoomTypes || []);

        // 💥 CRITICAL FIX: Populate form state with pre-filled Manager details
        if (reservationLink) {
          setForm((prev) => ({
            ...prev,
            guestName: reservationLink.guestName || prev.guestName || '',
            phone: reservationLink.guestPhone || prev.phone || '',       // guestPhone -> phone
            email: reservationLink.guestEmail || prev.email || '',       // guestEmail -> email
            roomTypeId: reservationLink.roomTypeId || prev.roomTypeId || '',
            checkIn: reservationLink.checkInDate
              ? new Date(reservationLink.checkInDate).toISOString().slice(0, 10)
              : prev.checkIn,
            checkOut: reservationLink.checkOutDate
              ? new Date(reservationLink.checkOutDate).toISOString().slice(0, 10)
              : prev.checkOut,
          }));
        }

        setLinkState('success');
      } catch (err) {
        if (!cancelled) {
          setLinkState('error');
          setLinkError(err.message);
        }
      }
    };

    fetchDetails();

    return () => {
      cancelled = true;
    };
  }, [propToken]);
  const selectedRoom = useMemo(
    () => roomTypes.find((r) => r.id === form.roomTypeId),
    [roomTypes, form.roomTypeId]
  );

  const remainingAmount = useMemo(() => {
    const price = parseFloat(form.roomPrice) || 0;
    const paid = parseFloat(form.paidAmount) || 0;
    return Math.max(0, price - paid);
  }, [form.roomPrice, form.paidAmount]);

  const clearError = (field) =>
    setErrors((prev) => {
      if (!(field in prev)) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });

  const handleChange = (field) => (e) => {
    const { value } = e.target;
    setForm((prev) => ({ ...prev, [field]: value }));
    clearError(field);
  };

  const handlePhoneChange = (e) => {
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
    setForm((prev) => ({ ...prev, phone: digitsOnly }));
    clearError('phone');
  };

  const handleRoomChange = (e) => {
    const roomTypeId = e.target.value;
    const room = roomTypes.find((r) => r.id === roomTypeId);
    setForm((prev) => ({ ...prev, roomTypeId, roomPrice: room?.price ?? room?.basePrice ?? 0 }));
    clearError('roomTypeId');
  };

  const handleImagePick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedImage({ file, previewUrl: URL.createObjectURL(file) });
    clearError('image');
  };

  const removeImage = () => {
    if (selectedImage?.previewUrl) URL.revokeObjectURL(selectedImage.previewUrl);
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.guestName.trim()) newErrors.guestName = 'Guest name is required';
    if (!form.phone) newErrors.phone = 'Phone number is required';
    else if (!validatePhone(form.phone)) newErrors.phone = 'Phone must be exactly 10 digits';
    if (!form.email) newErrors.email = 'Email is required';
    else if (!validateEmail(form.email)) newErrors.email = 'Invalid email format';

    if (!pinned.roomType) {
      if (!form.roomTypeId) newErrors.roomTypeId = 'Room selection is required';
    }

    if (!pinned.dates) {
      if (!form.checkIn) newErrors.checkIn = 'Check-in date is required';
      else if (!validateDate(form.checkIn)) newErrors.checkIn = 'Check-in date cannot be in the past';
      if (!form.checkOut) newErrors.checkOut = 'Check-out date is required';
      else if (!validateDate(form.checkOut)) newErrors.checkOut = 'Check-out date cannot be in the past';
      else if (form.checkIn && new Date(form.checkOut) <= new Date(form.checkIn))
        newErrors.checkOut = 'Check-out must be after check-in';
    }

    if (!form.guests) newErrors.guests = 'Number of guests is required';
    else if (parseInt(form.guests, 10) < 1) newErrors.guests = 'Must have at least 1 guest';
    else if (selectedRoom?.maxOccupancy && parseInt(form.guests, 10) > selectedRoom.maxOccupancy) {
      newErrors.guests = `Max occupancy for this room type is ${selectedRoom.maxOccupancy}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setStatus('submitting');

    try {
      // Extract token again just to be safe during submission
      let currentToken = propToken;
      if (!currentToken) {
        const pathParts = window.location.pathname.split('/');
        const tokenIndex = pathParts.indexOf('reservation-links') + 1;
        if (tokenIndex > 0 && tokenIndex < pathParts.length) {
          currentToken = pathParts[tokenIndex];
        }
      }

      const formData = new FormData();
      formData.append('guestName', form.guestName);
      formData.append('guestPhone', form.phone);
      formData.append('email', form.email);
      formData.append('numberOfGuests', form.guests);
      if (form.roomTypeId) formData.append('roomTypeId', form.roomTypeId);
      if (form.checkIn) formData.append('checkInDate', new Date(form.checkIn).toISOString());
      if (form.checkOut) formData.append('checkOutDate', new Date(form.checkOut).toISOString());
      if (form.idProofType) formData.append('idProofType', form.idProofType);
      if (selectedImage?.file) formData.append('idProof', selectedImage.file);

      const res = await fetch(`${API_BASE_URL}/reservation-links/${currentToken}/reservation`, {
        method: 'POST',
        headers: { 'ngrok-skip-browser-warning': 'true' },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Failed to submit reservation');
      }

      const data = await res.json();
      setBookingResult(data);
      setStatus('success');
      onBookingCreated?.({ ...form, roomName: selectedRoom?.name });
    } catch (err) {
      setStatus('idle');
      setErrors((prev) => ({ ...prev, submit: err.message }));
    }
  };

  if (linkState === 'loading') {
    return (
      <ModalShell onClose={onClose} maxWidth="max-w-2xl">
        <div className="flex flex-col items-center gap-3 p-10 text-center">
          <Loader2 className="animate-spin text-[#A67B5B]" size={32} />
          <p className="text-sm text-gray-500">Loading your reservation link…</p>
        </div>
      </ModalShell>
    );
  }

  if (linkState === 'error') {
    return (
      <ModalShell onClose={onClose} maxWidth="max-w-2xl">
        <div className="flex flex-col items-center gap-3 p-10 text-center">
          <p className="font-serif text-lg font-bold text-gray-900">This link isn't available</p>
          <p className="text-sm text-gray-500">{linkError}</p>
        </div>
      </ModalShell>
    );
  }

  const displayRoomName = pinned.roomType
    ? roomTypes.find((rt) => rt.id === form.roomTypeId)?.name ?? 'Reserved room type'
    : selectedRoom?.name;

  return (
    <ModalShell onClose={onClose} maxWidth="max-w-2xl">
      <div className="p-6 sm:p-8">
        <div className="mb-6 border-b border-gray-100 pb-4">
          <h2 className="font-serif text-2xl font-bold text-gray-900">New Reservation</h2>
          <p className="mt-1 text-sm text-gray-500">
            {property ? `Complete your booking details for ${property.name}.` : 'Manually enter guest details and room preferences to complete the booking.'}
          </p>
        </div>

        {status === 'success' ? (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <CheckCircle2 className="text-green-500 mb-2" size={56} />
            <h2 className="font-serif text-2xl font-bold text-gray-900">🎉 Reservation Confirmed!</h2>
            <p className="text-sm text-gray-500 max-w-md">
              Welcome {bookingResult?.guest?.name ?? form.guestName}! Thank you for completing your booking details.
            </p>
            <button
              onClick={onClose}
              className="mt-4 rounded-full bg-[#A67B5B] px-8 py-2.5 text-sm font-bold text-white transition hover:bg-[#8B664B] shadow-md"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex max-h-[65vh] flex-col gap-6 overflow-y-auto pr-1">
            {/* GUEST INFORMATION */}
            <div>
              <SectionTitle title="GUEST INFORMATION" />
              <div className="flex flex-col gap-4">
                <Field label="Guest Full Name" icon={User} error={errors.guestName}>
                  <input
                    className={inputClass}
                    placeholder="E.g. Alexander Hamilton"
                    value={form.guestName}
                    onChange={handleChange('guestName')}
                  />
                </Field>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Phone Number" icon={Phone} error={errors.phone}>
                    <input
                      className={inputClass}
                      placeholder="10-digit number"
                      inputMode="numeric"
                      value={form.phone}
                      onChange={handlePhoneChange}
                    />
                  </Field>
                  <Field label="Email Address" icon={Mail} error={errors.email}>
                    <input
                      className={inputClass}
                      type="email"
                      placeholder="guest@example.com"
                      value={form.email}
                      onChange={handleChange('email')}
                    />
                  </Field>
                </div>
              </div>
            </div>

            {/* BOOKING DETAILS */}
            <div>
              <SectionTitle title="BOOKING DETAILS" />
              <div className="flex flex-col gap-4">
                {pinned.roomType ? (
                  <ReadOnlyField
                    label="Room Type"
                    icon={BedDouble}
                    value={displayRoomName ?? 'Reserved room type'}
                  />
                ) : (
                  <Field label="Room Type" icon={BedDouble} error={errors.roomTypeId}>
                    <select className={inputClass} value={form.roomTypeId} onChange={handleRoomChange}>
                      <option value="" disabled>
                        {isLoadingRooms ? 'Loading room types...' : 'Select a room type'}
                      </option>
                      {!isLoadingRooms && roomTypes.length === 0 && (
                        <option value="" disabled>No room types available</option>
                      )}
                      {roomTypes.map((room) => (
                        <option key={room.id} value={room.id}>
                          {room.name} {room.price ? `— ₹${room.price}` : room.basePrice ? `— ₹${room.basePrice}` : ''}
                          {room.maxOccupancy ? ` · up to ${room.maxOccupancy} guests` : ''}
                        </option>
                      ))}
                    </select>
                  </Field>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {pinned.dates ? (
                    <>
                      <ReadOnlyField label="Check-In" icon={CalendarDays} value={formatDisplayDate(form.checkIn)} />
                      <ReadOnlyField label="Check-Out" icon={CalendarDays} value={formatDisplayDate(form.checkOut)} />
                    </>
                  ) : (
                    <>
                      <Field label="Check-In" icon={CalendarDays} error={errors.checkIn}>
                        <input
                          type="date"
                          className={inputClass}
                          value={form.checkIn}
                          onChange={handleChange('checkIn')}
                        />
                      </Field>
                      <Field label="Check-Out" icon={CalendarDays} error={errors.checkOut}>
                        <input
                          type="date"
                          className={inputClass}
                          value={form.checkOut}
                          onChange={handleChange('checkOut')}
                        />
                      </Field>
                    </>
                  )}
                </div>

                <Field label="Number of Guests" icon={Users} error={errors.guests}>
                  <input
                    type="number"
                    min="1"
                    className={inputClass}
                    placeholder="E.g. 2"
                    value={form.guests}
                    onChange={handleChange('guests')}
                  />
                </Field>
              </div>
            </div>

            {/* GUEST ID VERIFICATION */}
            <div>
              <SectionTitle title="GUEST ID VERIFICATION" />
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    ID Proof Type (optional)
                  </label>
                  <select
                    className="rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 outline-none transition focus:border-[#A67B5B] focus:ring-2 focus:ring-[#A67B5B]/20"
                    value={form.idProofType}
                    onChange={handleChange('idProofType')}
                  >
                    <option value="">Select ID type</option>
                    {ID_PROOF_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Upload ID Proof
                  </label>
                  <div className="mt-1.5">
                    {selectedImage ? (
                      <div className="flex items-center gap-3 rounded-xl border border-gray-200 p-3">
                        <img src={selectedImage.previewUrl} alt="ID preview" className="h-16 w-16 rounded-lg object-cover" />
                        <span className="flex-1 truncate text-sm text-gray-800">{selectedImage.file.name}</span>
                        <button type="button" onClick={removeImage} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#A67B5B]/30 py-6 text-sm text-[#A67B5B] transition hover:border-[#A67B5B]/60 hover:bg-[#A67B5B]/5"
                      >
                        <IdCard size={18} />
                        <Upload size={16} />
                        Tap to upload guest ID
                      </button>
                    )}
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
                    {errors.image && <p className="mt-1 text-xs text-red-600">{errors.image}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* PAYMENT DETAILS */}
            <div>
              <SectionTitle title="PAYMENT DETAILS" />
              <div className="flex flex-col gap-4">
                <div className="flex rounded-xl bg-white p-1 shadow-sm ring-1 ring-gray-200">
                  <button type="button" onClick={() => handleChange('paymentType')({ target: { value: 'partial' } })} className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${form.paymentType === 'partial' ? 'bg-[#8B664B] text-white shadow' : 'text-gray-500 hover:text-gray-900'}`}>
                    Partial Payment
                  </button>
                  <button type="button" onClick={() => handleChange('paymentType')({ target: { value: 'full' } })} className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${form.paymentType === 'full' ? 'bg-[#8B664B] text-white shadow' : 'text-gray-500 hover:text-gray-900'}`}>
                    Full Payment
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Room Price" icon={Wallet}>
                    <input type="number" className={inputClass} placeholder="₹0" value={form.roomPrice} disabled />
                  </Field>
                  <Field label="Remaining Amount" icon={Wallet}>
                    <input type="number" className={inputClass} placeholder="₹0" value={remainingAmount} disabled />
                  </Field>
                </div>

                <Field label="Amount Paid" icon={Wallet}>
                  <input type="number" className={inputClass} placeholder="0" value={form.paidAmount} onChange={handleChange('paidAmount')} />
                </Field>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Payment Method</label>
                  <select className="rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-800 outline-none transition focus:border-[#A67B5B] focus:ring-2 focus:ring-[#A67B5B]/20" value={form.paymentMethod} onChange={handleChange('paymentMethod')}>
                    <option value="CASH">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="CARD">Card</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                  </select>
                </div>
              </div>
            </div>

            {errors.submit && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 text-center shadow-sm">
                {errors.submit}
              </div>
            )}

            <div className="mt-4 pb-2">
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full flex justify-center items-center gap-2 rounded-full bg-[#A67B5B] px-6 py-3 text-sm font-bold tracking-wide text-white transition hover:bg-[#8B664B] disabled:opacity-60"
              >
                {status === 'submitting' ? <><Loader2 className="animate-spin" size={18} /> Creating...</> : 'Create Reservation'}
              </button>
            </div>
          </form>
        )}
      </div>
    </ModalShell>
  );
};

export default ReservationForm;
