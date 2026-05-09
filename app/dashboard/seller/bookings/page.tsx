'use client';

import { BookingCard } from '@/components/booking-card';
import { useState } from 'react';

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
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [statusMessage, setStatusMessage] = useState('');

  const handleConfirmBooking = (id: string) => {
    setBookings(bookings.map((b) => (b.id === id ? { ...b, status: 'CONFIRMED' } : b)));
    setStatusMessage(`Booking ${id} confirmed.`);
  };

  const handleCancelBooking = (id: string) => {
    setBookings(bookings.map((b) => (b.id === id ? { ...b, status: 'CANCELLED' } : b)));
    setStatusMessage(`Booking ${id} cancelled.`);
  };

  const handleApproveEmi = (id: string) => {
    setBookings(bookings.map((b) => (b.id === id ? { ...b, status: 'EMI_APPROVED' } : b)));
    setStatusMessage(`EMI for booking ${id} approved.`);
  };

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

      {bookings.length === 0 ? (
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
