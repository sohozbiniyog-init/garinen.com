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
    buyerName: 'You',
    buyerPhone: '+880 1712345670',
    listingTitle: 'Hyundai Elantra 2021',
    carPrice: '1,800,000',
    depositAmount: '180,000',
    status: 'PENDING',
    createdAt: 'May 2'
  },
  {
    id: '2',
    buyerName: 'You',
    buyerPhone: '+880 1712345670',
    listingTitle: 'Nissan Altima 2019',
    carPrice: '1,600,000',
    depositAmount: '160,000',
    status: 'CONFIRMED',
    createdAt: 'Apr 28'
  }
];

export default function BuyerBookingsPage() {
  const [bookings] = useState<Booking[]>(mockBookings);

  const pendingCount = bookings.filter((b) => b.status === 'PENDING').length;
  const confirmedCount = bookings.filter((b) => b.status === 'CONFIRMED').length;

  return (
    <main className="min-h-screen w-full px-6 py-10 lg:px-10">
      <section className="mb-10">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-300">My Bookings</p>
        <h1 className="mt-3 text-4xl font-bold text-white">Booking Requests</h1>
        <p className="mt-3 text-sm leading-7 text-slate-300">
          Track your car booking requests and deposit payments. Once a seller confirms, you can proceed with EMI or purchase.
        </p>
      </section>

      <div className="mb-10 flex items-center gap-4">
        <span className="text-sm text-smoke">
          {bookings.length} booking{bookings.length !== 1 ? 's' : ''} • {pendingCount} awaiting confirmation • {confirmedCount} confirmed
        </span>
      </div>

      {bookings.length === 0 ? (
        <div className="glass-card rounded-[2rem] p-12 text-center shadow-soft">
          <p className="text-lg font-semibold text-ink">No bookings yet</p>
          <p className="mt-2 text-sm text-smoke">Browse approved listings and request a booking to get started.</p>
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
            />
          ))}
        </div>
      )}
    </main>
  );
}
