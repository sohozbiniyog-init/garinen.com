'use client';

import { useState, useEffect } from 'react';
import { exportToCSV, prepareBookingsForCSV, prepareTestDrivesForCSV, prepareLoansForCSV } from '@/lib/utils/csv-export';
import { showToast } from '@/components/common/Toast';

interface BookingWithRelations {
  id: string;
  userId: string;
  listingId: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'PURCHASED' | 'EMI_APPLIED' | 'EMI_PROCESSING' | 'EMI_APPROVED';
  paymentStatus: 'PENDING' | 'AUTHORIZED' | 'CAPTURED' | 'FAILED' | 'REFUNDED';
  depositAmount: string;
  currency: string;
  address: string;
  profession: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
    phone: string;
  };
  listing: {
    title: string;
    price: string;
  };
  emiDetails: Record<string, unknown>;
}

interface LoanApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  amount: string;
  status: 'DRAFT' | 'FOLLOW_UP_REQUIRED' | 'SUBMITTED' | 'REVIEWING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
  createdAt: string;
}

type TabType = 'bookings' | 'test-drives' | 'loans';

export default function AdminBookingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('bookings');
  const [bookings, setBookings] = useState<BookingWithRelations[]>([]);
  const [loans, setLoans] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'bookings') {
        const response = await fetch('/api/admin/bookings');
        if (response.ok) {
          const data = await response.json();
          setBookings(data);
        }
      } else if (activeTab === 'loans') {
        const response = await fetch('/api/admin/loans');
        if (response.ok) {
          const data = await response.json();
          setLoans(data);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast('Failed to load data', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (activeTab === 'bookings') {
      const csvData = prepareBookingsForCSV(bookings);
      exportToCSV(csvData, 'booking-requests');
    } else if (activeTab === 'test-drives') {
      const csvData = prepareTestDrivesForCSV(bookings);
      exportToCSV(csvData, 'test-drive-requests');
    } else if (activeTab === 'loans') {
      const csvData = prepareLoansForCSV(loans);
      exportToCSV(csvData, 'loan-applications');
    }
  };

  const handleApproveBooking = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CONFIRMED' }),
      });

      if (response.ok) {
        showToast('Booking confirmed', { type: 'success' });
        fetchData();
      } else {
        showToast('Failed to confirm booking', { type: 'error' });
      }
    } catch (error) {
      console.error('Error confirming booking:', error);
      showToast('Error confirming booking', { type: 'error' });
    }
  };

  const handleRejectBooking = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });

      if (response.ok) {
        showToast('Booking cancelled', { type: 'success' });
        fetchData();
      } else {
        showToast('Failed to cancel booking', { type: 'error' });
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      showToast('Error cancelling booking', { type: 'error' });
    }
  };

  const filteredBookings = filterStatus
    ? bookings.filter((b) => b.status === filterStatus)
    : bookings;

  return (
    <main className="min-h-screen w-full px-6 py-10 lg:px-10">
      <section className="mb-10">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Dashboard</p>
        <h1 className="mt-3 text-4xl font-bold text-white">Booking Requests & Orders</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
          Manage booking requests, test drives, and loan applications in a compact admin view.
        </p>
      </section>

      {/* Tab Navigation */}
      <div className="mb-8 flex gap-4 border-b border-white/10">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-4 py-3 font-semibold text-sm transition ${
            activeTab === 'bookings'
              ? 'border-b-2 border-moss text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Booking Requests
        </button>
        <button
          onClick={() => setActiveTab('test-drives')}
          className={`px-4 py-3 font-semibold text-sm transition ${
            activeTab === 'test-drives'
              ? 'border-b-2 border-moss text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Test Drive Bookings
        </button>
        <button
          onClick={() => setActiveTab('loans')}
          className={`px-4 py-3 font-semibold text-sm transition ${
            activeTab === 'loans'
              ? 'border-b-2 border-moss text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Loan Applications
        </button>
      </div>

      {/* Controls */}
      <div className="mb-8 flex items-center justify-between gap-4">
        {activeTab === 'bookings' && (
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/20"
          >
            <option value="">All Bookings</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="EMI_APPLIED">EMI Applied</option>
          </select>
        )}
        <button
          onClick={handleExportCSV}
          disabled={activeTab === 'bookings' ? filteredBookings.length === 0 : loans.length === 0}
          className="rounded-lg bg-white px-6 py-2 font-semibold text-slate-900 transition hover:bg-opacity-90 disabled:opacity-50"
        >
          Export as CSV
        </button>
      </div>

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <div className="grid gap-4">
          {loading ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-slate-300">
              Loading bookings...
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-slate-300">
              No booking requests found
            </div>
          ) : (
            filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-6"
              >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-xs text-slate-400">Buyer</p>
                    <p className="mt-1 font-semibold text-white">{booking.user.name}</p>
                    <p className="text-xs text-slate-500">{booking.user.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Listing</p>
                    <p className="mt-1 font-semibold text-white">{booking.listing.title}</p>
                    <p className="text-xs text-slate-500">৳ {booking.listing.price}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Details</p>
                    <p className="mt-1 text-xs text-white">Address: {booking.address}</p>
                    <p className="text-xs text-slate-500">Profession: {booking.profession}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Status</p>
                    <p className="mt-1 inline-block rounded-full bg-moss/20 px-3 py-1 text-xs font-semibold text-moss">
                      {booking.status}
                    </p>
                  </div>
                </div>

                {booking.status === 'PENDING' && (
                  <div className="mt-4 flex gap-3 border-t border-white/20 pt-4">
                    <button
                      onClick={() => handleApproveBooking(booking.id)}
                      className="flex-1 rounded-lg bg-green-600 px-4 py-2 font-semibold text-white transition hover:bg-green-700"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => handleRejectBooking(booking.id)}
                      className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white transition hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Test Drives Tab */}
      {activeTab === 'test-drives' && (
        <div className="rounded-lg border border-white/20 bg-white/5 p-8 text-center text-slate-400">
          Test drive management will be displayed here
        </div>
      )}

      {/* Loans Tab */}
      {activeTab === 'loans' && (
        <div className="grid gap-4">
          {loading ? (
            <div className="rounded-lg border border-white/20 bg-white/5 p-8 text-center text-slate-400">
              Loading loan applications...
            </div>
          ) : loans.length === 0 ? (
            <div className="rounded-lg border border-white/20 bg-white/5 p-8 text-center text-slate-400">
              No loan applications found
            </div>
          ) : (
            loans.map((loan) => (
              <div key={loan.id} className="glass-card rounded-2xl p-6 transition hover:shadow-md">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-xs text-slate-400">Applicant</p>
                    <p className="mt-1 font-semibold text-white">{loan.name}</p>
                    <p className="text-xs text-slate-500">{loan.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Loan Amount</p>
                    <p className="mt-1 font-semibold text-white">৳ {loan.amount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Status</p>
                    <p className="mt-1 inline-block rounded-full bg-clay/20 px-3 py-1 text-xs font-semibold text-clay">
                      {loan.status}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </main>
  );
}

