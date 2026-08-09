import { useState, useEffect } from 'react';
import ReservationLandingPage from './components/ReservationLandingPage.jsx';
import ReservationForm from './components/ReservationForm.jsx';

function App() {
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Match pattern: /reservation-links/:token/reservation OR /reservation-links/:token
    const pathParts = window.location.pathname.split('/');
    const tokenIndex = pathParts.indexOf('reservation-links') + 1;
    if (tokenIndex > 0 && tokenIndex < pathParts.length) {
      setToken(pathParts[tokenIndex]);
    }
  }, []);

  if (window.location.pathname.includes('/reservation-links/')) {
    if (!token) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] p-6 text-center">
          <p className="text-sm text-neutral-500">This page needs a valid guest link to open.</p>
        </div>
      );
    }
    return <ReservationForm onClose={() => { }} onBookingCreated={() => { }} token={token} />;
  }

  return <ReservationLandingPage />;
}

export default App;
