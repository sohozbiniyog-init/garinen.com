'use client';

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

const STATUS_OPTIONS = ['PENDING', 'UNDER_REVIEW', 'QUOTED', 'PURCHASED', 'CANCELLED'];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'bg-amber-100 text-amber-800 border-amber-300';
    case 'UNDER_REVIEW':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'QUOTED':
      return 'bg-purple-100 text-purple-800 border-purple-300';
    case 'PURCHASED':
      return 'bg-moss/10 text-moss border-moss/30';
    case 'CANCELLED':
      return 'bg-clay/10 text-clay border-clay/30';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

export default function AdminCustomOrderPage() {
  const [orders, setOrders] = useState<CustomOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await fetch('/api/custom-orders?userId=admin&isAdmin=true');
      if (!response.ok) {
        throw new Error('Failed to load custom orders');
      }
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      console.error('Error loading orders:', err);
      setError('Failed to load custom orders');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingIds((prev) => new Set(prev).add(orderId));

      const response = await fetch('/api/custom-orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: orderId,
          status: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      const updatedOrder = await response.json();
      setOrders((prev) => prev.map((order) => (order.id === orderId ? updatedOrder : order)));
    } catch (err) {
      console.error('Error updating order:', err);
      setError('Failed to update order status');
    } finally {
      setUpdatingIds((prev) => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
    }
  };

  const pendingCount = orders.filter((o) => o.status === 'PENDING').length;
  const underReviewCount = orders.filter((o) => o.status === 'UNDER_REVIEW').length;
  const quotedCount = orders.filter((o) => o.status === 'QUOTED').length;

  return (
    <main className="min-h-screen w-full px-6 py-10 lg:px-10">
      {/* Header Section */}
      <section className="mb-10">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Management</p>
        <h1 className="mt-3 text-4xl font-bold text-white">Custom Order Requests</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
          Review and manage all custom car import requests from buyers.
        </p>
      </section>

      {/* Stats Cards */}
      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <div className="glass-card rounded-[1.5rem] p-6 shadow-soft">
          <p className="text-sm text-slate-600">Total Requests</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{orders.length}</p>
        </div>
        <div className="glass-card rounded-[1.5rem] p-6 shadow-soft">
          <p className="text-sm text-amber-700">Pending</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{pendingCount}</p>
        </div>
        <div className="glass-card rounded-[1.5rem] p-6 shadow-soft">
          <p className="text-sm text-blue-700">Under Review</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{underReviewCount}</p>
        </div>
        <div className="glass-card rounded-[1.5rem] p-6 shadow-soft">
          <p className="text-sm text-purple-700">Quoted</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{quotedCount}</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-8 rounded-lg border border-clay/30 bg-clay/5 p-4 text-clay">
          {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <p className="text-slate-300">Loading custom orders...</p>
        </div>
      )}

      {/* Orders List */}
      {!isLoading && orders.length === 0 ? (
        <div className="glass-card rounded-[1.5rem] p-12 text-center shadow-soft">
          <p className="text-lg text-slate-600">No custom orders yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="glass-card rounded-[1.5rem] p-6 shadow-soft"
            >
              <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900">
                    {order.brand} {order.model}
                  </h3>
                  <p className="text-sm text-slate-600">
                    Requested by User ID: {order.userId.substring(0, 8)}... on{' '}
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Status Selector */}
                <div className="w-full md:w-auto">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    disabled={updatingIds.has(order.id)}
                    className={`w-full rounded-lg border-2 px-3 py-2 font-semibold transition ${getStatusColor(order.status)} disabled:opacity-50`}
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Order Details Grid */}
              <div className="mb-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {order.yearFrom && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-600">Year Range</p>
                    <p className="mt-1 font-semibold text-slate-900">
                      {order.yearFrom} - {order.yearTo || 'Present'}
                    </p>
                  </div>
                )}
                {order.budget && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-600">Budget</p>
                    <p className="mt-1 font-semibold text-slate-900">{order.budget}</p>
                  </div>
                )}
                {order.color && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-600">Color</p>
                    <p className="mt-1 font-semibold text-slate-900">{order.color}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-600">Status Updated</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {new Date(order.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Features and Notes */}
              <div className="grid gap-4 border-t border-white/20 pt-4 md:grid-cols-2">
                {order.features && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-600">Desired Features</p>
                    <p className="mt-2 text-sm text-slate-900">{order.features}</p>
                  </div>
                )}
                {order.notes && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-600">Additional Notes</p>
                    <p className="mt-2 text-sm text-slate-900">{order.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
