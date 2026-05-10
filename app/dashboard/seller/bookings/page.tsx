'use client';

import { BookingCard } from '@/components/buyers/BookingCard';
import { createBrowserClient } from '@supabase/ssr';
import { useEffect, useState } from 'react';

interface Booking {
  id: string;
  buyerName: string;
  buyerPhone: string;
  listingTitle: string;
  carPrice: string;
  depositAmount: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'PURCHASED' | 'EMI_APPLIED' | 'EMI_APPROVED';
  createdAt: string;
}

const mockBookings: Booking[] = [
  {
    id: '1',
    buyerName: 'Ahmed Rahman',
    buyerPhone: '+880 1712345678',
    listingTitle: 'Toyota Corolla 2022',
    carPrice: '2,500,000',
    depositAmount: '250,000',
    status: 'PENDING',
    createdAt: 'May 2'
  },
  {
    id: '2',
    buyerName: 'Nasrin Akhtar',
    buyerPhone: '+880 1823456789',
    listingTitle: 'Honda Civic 2020',
    carPrice: '2,200,000',
    depositAmount: '220,000',
    status: 'CONFIRMED',
    createdAt: 'Apr 30'
  }
];

export default function SellerBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        if (!token) {
          setError('Please sign in to view vendor bookings.');
          return;
        }

        const response = await fetch('/api/bookings', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to load bookings');
        }

        const data = (await response.json()) as Booking[];
        setBookings(data);
      } catch (loadError) {
        console.error('Failed to load seller bookings:', loadError);
        setError('Could not load vendor bookings right now.');
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, [supabase]);

  const updateBooking = async (id: string, status: Booking['status']) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        setStatusMessage('Please sign in again to update bookings.');
        return;
      }

      const response = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update booking');
      }

      setBookings((current) => current.map((booking) => (booking.id === id ? { ...booking, status } : booking)));
      setStatusMessage(`Booking ${id} ${status.toLowerCase()}.`);
    } catch (updateError) {
      console.error('Failed to update booking:', updateError);
      setStatusMessage('Failed to update booking.');
    }
  };

  const handleConfirmBooking = (id: string) => void updateBooking(id, 'CONFIRMED');
  const handleCancelBooking = (id: string) => void updateBooking(id, 'CANCELLED');
  const handleApproveEmi = (id: string) => void updateBooking(id, 'EMI_APPROVED');

  const pendingCount = bookings.filter((b) => b.status === 'PENDING').length;
  const confirmedCount = bookings.filter((b) => b.status === 'CONFIRMED').length;

  return (
    <main className="min-h-screen w-full px-6 py-10 lg:px-10">
      <section className="mb-10">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Vendor Tools</p>
        <h1 className="mt-3 text-4xl font-bold text-white">Booking Requests</h1>
        <p className="mt-3 text-sm leading-7 text-slate-300">
          Review and confirm booking requests from buyers. Each booking includes a 10% deposit.
        </p>
      </section>

      <div className="mb-10 flex items-center gap-4">
        <span className="text-sm text-smoke">
          {bookings.length} booking{bookings.length !== 1 ? 's' : ''} • {pendingCount} pending • {confirmedCount} confirmed
        </span>
      </div>

      {statusMessage && (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-950" role="status" aria-live="polite">
          {statusMessage}
        </div>
      )}

      {loading ? (
        <div className="glass-card rounded-[2rem] p-12 text-center shadow-soft">
          <p className="text-lg font-semibold text-ink">Loading bookings...</p>
        </div>
      ) : error ? (
        <div className="glass-card rounded-[2rem] p-12 text-center shadow-soft">
          <p className="text-lg font-semibold text-ink">{error}</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="glass-card rounded-[2rem] p-12 text-center shadow-soft">
          <p className="text-lg font-semibold text-ink">No bookings yet</p>
          <p className="mt-2 text-sm text-smoke">When buyers request bookings, they will appear here.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {bookings.map((booking) => (
            <BookingCard
              key={booking.id}
              id={booking.id}
              buyerName={booking.buyerName}
              buyerPhone={booking.buyerPhone}
              listingTitle={booking.listingTitle}
              carPrice={booking.carPrice}
              depositAmount={booking.depositAmount}
              status={booking.status}
              createdAt={booking.createdAt}
              onConfirm={handleConfirmBooking}
              onCancel={handleCancelBooking}
              onApproveEmi={handleApproveEmi}
            />
          ))}
        </div>
      )}
    </main>
  );
}

