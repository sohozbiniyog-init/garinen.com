'use client';

import { CustomOrderForm, CustomOrderFormData } from '@/components/custom-order-form';
import { useEffect, useState } from 'react';

interface CustomOrder {
  id: string;
  userId: string;
  brand: string;
  model: string;
  yearFrom: number | null;
  yearTo: number | null;
  budget: string | null;
  color: string | null;
  features: string | null;
  notes: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function CustomOrderPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [previousOrders, setPreviousOrders] = useState<CustomOrder[]>([]);
  const [loadingPreviousOrders, setLoadingPreviousOrders] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Load current user and previous orders on mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Get current user from localStorage (mock auth)
        // In production, this would come from session/auth library
        const userId = localStorage.getItem('currentUserId');
        if (userId) {
          setCurrentUserId(userId);
          await loadPreviousOrders(userId);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, []);

  const loadPreviousOrders = async (userId: string) => {
    try {
      setLoadingPreviousOrders(true);
      const response = await fetch(`/api/custom-orders?userId=${userId}`);
      if (response.ok) {
        const orders = await response.json();
        setPreviousOrders(orders);
      }
    } catch (error) {
      console.error('Error loading previous orders:', error);
    } finally {
      setLoadingPreviousOrders(false);
    }
  };

  const handleFormSubmit = async (data: CustomOrderFormData) => {
    // Use mock user ID if not logged in (in production, get from auth session)
    const userId = currentUserId || `guest-${Date.now()}`;

    setIsLoading(true);
    setSubmitMessage('');
    setSubmitError('');

    try {
      const response = await fetch('/api/custom-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          ...data,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit custom order');
      }

      const newOrder = await response.json();

      setSubmitMessage('✓ Custom order request submitted successfully! We will review your request and contact you soon.');

      // Update previous orders list
      setPreviousOrders((prev) => [newOrder, ...prev]);

      // Save user ID for persistence
      if (!currentUserId) {
        setCurrentUserId(userId);
        localStorage.setItem('currentUserId', userId);
      }
    } catch (error) {
      console.error('Error submitting custom order:', error);
      setSubmitError('Failed to submit custom order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-100 text-amber-800';
      case 'UNDER_REVIEW':
        return 'bg-blue-100 text-blue-800';
      case 'QUOTED':
        return 'bg-purple-100 text-purple-800';
      case 'PURCHASED':
        return 'bg-moss/10 text-moss';
      case 'CANCELLED':
        return 'bg-clay/10 text-clay';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <main className="min-h-screen w-full px-6 py-10 lg:px-10">
      {/* Header Section */}
      <section className="mb-12">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Custom Import</p>
        <h1 className="mt-3 text-4xl font-bold text-white">Request Your Dream Car</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
          Can't find the car you're looking for in our listings? Tell us your requirements, and we'll help you import it from abroad. Our team will source the perfect vehicle that matches your budget and preferences.
        </p>
      </section>

      {/* Success/Error Messages */}
      {submitMessage && (
        <div className="glass-card mb-8 rounded-lg p-4 text-slate-900 shadow-soft">
          {submitMessage}
        </div>
      )}
      {submitError && (
        <div className="glass-card mb-8 rounded-lg p-4 text-slate-900 shadow-soft">
          {submitError}
        </div>
      )}

      {/* Form Section */}
      <section className="mb-12">
        <h2 className="mb-6 text-2xl font-bold text-white">Request Details</h2>
        <CustomOrderForm onSubmit={handleFormSubmit} isLoading={isLoading} />
      </section>

      {/* Previous Orders Section */}
      {previousOrders.length > 0 && (
        <section>
          <h2 className="mb-6 text-2xl font-bold text-white">Your Previous Requests</h2>

          {loadingPreviousOrders ? (
            <div className="flex justify-center py-8">
              <p className="text-slate-300">Loading previous orders...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {previousOrders.map((order) => (
                <div
                  key={order.id}
                  className="glass-card rounded-lg p-6 shadow-soft"
                >
                  <div className="mb-4 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        {order.brand} {order.model}
                      </h3>
                      <p className="text-sm text-slate-600">
                        Requested on {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-sm font-semibold ${getStatusBadgeColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="grid gap-4 text-sm md:grid-cols-2 lg:grid-cols-4">
                    {order.yearFrom && (
                      <div>
                        <p className="text-slate-600">Year Range</p>
                        <p className="font-semibold text-slate-900">
                          {order.yearFrom} - {order.yearTo || 'Present'}
                        </p>
                      </div>
                    )}
                    {order.budget && (
                      <div>
                        <p className="text-slate-600">Budget</p>
                        <p className="font-semibold text-slate-900">{order.budget}</p>
                      </div>
                    )}
                    {order.color && (
                      <div>
                        <p className="text-slate-600">Color</p>
                        <p className="font-semibold text-slate-900">{order.color}</p>
                      </div>
                    )}
                    {order.features && (
                      <div>
                        <p className="text-slate-600">Features</p>
                        <p className="font-semibold text-slate-900 line-clamp-2">{order.features}</p>
                      </div>
                    )}
                  </div>

                  {order.notes && (
                    <div className="mt-4 border-t border-white/20 pt-4">
                      <p className="text-sm text-slate-600">Notes</p>
                      <p className="mt-2 text-sm text-slate-900">{order.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Info Section */}
      <section className="mt-16 glass-card rounded-[1.5rem] p-8">
        <h3 className="mb-4 text-xl font-bold text-slate-900">How It Works</h3>
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-moss/20">
              <span className="font-bold text-moss">1</span>
            </div>
            <h4 className="mb-2 font-semibold text-slate-900">Submit Request</h4>
            <p className="text-sm text-slate-600">Fill out the form with your car preferences and budget.</p>
          </div>
          <div>
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-moss/20">
              <span className="font-bold text-moss">2</span>
            </div>
            <h4 className="mb-2 font-semibold text-slate-900">Review & Research</h4>
            <p className="text-sm text-slate-600">Our team reviews your request and sources matching vehicles.</p>
          </div>
          <div>
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-moss/20">
              <span className="font-bold text-moss">3</span>
            </div>
            <h4 className="mb-2 font-semibold text-slate-900">Quote & Purchase</h4>
            <p className="text-sm text-slate-600">We'll send you quotes and help you complete the purchase.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
