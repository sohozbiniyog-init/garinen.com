'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';

export interface BookingFormData {
  buyerName: string;
  buyerPhone: string;
  buyerEmail: string;
  address: string;
profession: 'TEACHER' | 'ENGINEER' | 'BUSINESSMAN' | 'GOVT.EMPLOYEE'| 'SELF-EMPLOYED/INFLUENCER' | 'STUDENT' | 'DOCTOR' | 'OTHER';
  depositAmount: string;
}

type BookingFormState = Omit<BookingFormData, 'depositAmount'>;

interface RequestBookingFormProps {
  listingTitle: string;
  listingPrice: string;
  onSubmit: (data: BookingFormData) => void;
  isLoading?: boolean;
  onCancel?: () => void;
}

const professions = ['TEACHER', 'ENGINEER', 'BUSINESSMAN', 'GOVT.EMPLOYEE', 'SELF-EMPLOYED/INFLUENCER', 'STUDENT', 'DOCTOR', 'OTHER'];

export function RequestBookingForm({ listingTitle, listingPrice, onSubmit, isLoading, onCancel }: RequestBookingFormProps) {
  const [formData, setFormData] = useState<BookingFormState>({
    buyerName: '',
    buyerPhone: '',
    buyerEmail: '',
    address: '',
    profession: 'OTHER'
  });

  const [step, setStep] = useState<'form' | 'payment'>('form');
  const depositAmount = (parseInt(listingPrice.replace(/,/g, ''), 10) * 0.1).toLocaleString();

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Require name, email, and address to proceed to payment
    if (formData.buyerName.trim() && formData.buyerEmail.trim() && formData.address.trim()) {
      setStep('payment');
    }
  };

  const handlePaymentConfirm = () => {
    onSubmit({
      ...formData,
      depositAmount
    });
    setStep('form');
  };

  const canContinue = Boolean(formData.buyerName.trim() && formData.buyerEmail.trim() && formData.address.trim());

  return (
    <div>
      {step === 'form' ? (
        <form onSubmit={handleFormSubmit} className="space-y-6 rounded-[2rem] border border-black/10 bg-white/80 p-8 shadow-soft">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-smoke">Request Booking</p>
            <h2 className="mt-2 text-2xl font-bold text-ink">{listingTitle}</h2>
          </div>

          <div className="border-t border-black/5 pt-6">
            <label htmlFor="buyerName" className="block text-sm font-semibold text-ink">Your Full Name</label>
            <input
              id="buyerName"
              type="text"
              name="buyerName"
              value={formData.buyerName}
              onChange={handleChange}
              autoComplete="name"
              placeholder="Ahmed Rahman…"
              className="mt-2 w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-moss"
              required
            />
          </div>

          <div>
            <label htmlFor="buyerPhone" className="block text-sm font-semibold text-ink">Phone Number (optional)</label>
            <input
              id="buyerPhone"
              type="tel"
              name="buyerPhone"
              value={formData.buyerPhone}
              onChange={handleChange}
              autoComplete="tel"
              inputMode="tel"
              placeholder="+880 17…"
              className="mt-2 w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-moss"
            />
          </div>

          <div>
            <label htmlFor="buyerEmail" className="block text-sm font-semibold text-ink">Email</label>
            <input
              id="buyerEmail"
              type="email"
              name="buyerEmail"
              value={formData.buyerEmail}
              onChange={handleChange}
              autoComplete="email"
              spellCheck={false}
              placeholder="ahmed@example.com"
              className="mt-2 w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-moss"
              required
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-semibold text-ink">Address</label>
            <input
              id="address"
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              autoComplete="street-address"
              placeholder="Your residential address…"
              className="mt-2 w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-moss"
              required
            />
          </div>

          <div>
            <label htmlFor="profession" className="block text-sm font-semibold text-ink">Profession</label>
            <select
              id="profession"
              name="profession"
              value={formData.profession}
              onChange={handleChange}
              className="mt-2 w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-moss"
            >
              {professions.map((prof) => (
                <option key={prof} value={prof}>
                  {prof}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-2xl border border-black/5 bg-sand/30 p-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-smoke">Car Price</span>
                <span className="font-semibold text-ink">৳ {listingPrice}</span>
              </div>
              <div className="flex justify-between border-t border-black/10 pt-3">
                <span className="text-sm font-semibold text-ink">Deposit Amount (10%)</span>
                <span className="text-lg font-bold text-moss">৳ {depositAmount}</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !canContinue}
            className="w-full rounded-full bg-moss px-6 py-3 text-sm font-semibold text-white transition hover:bg-opacity-90 disabled:opacity-50"
          >
            Proceed to Deposit Confirmation
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-full rounded-full border border-black/20 bg-white px-6 py-3 text-sm font-semibold text-ink transition hover:bg-sand"
            >
              Cancel
            </button>
          )}
        </form>
      ) : (
        <div className="space-y-6 rounded-[2rem] border border-black/10 bg-white/80 p-8 shadow-soft">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-smoke">Deposit Confirmation</p>
            <h2 className="mt-2 text-2xl font-bold text-ink">Complete Your Deposit</h2>
          </div>

          <div className="rounded-2xl border border-clay/20 bg-clay/5 p-6 space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-smoke">Listing</span>
              <span className="font-semibold text-ink">{listingTitle}</span>
            </div>
            <div className="flex justify-between border-t border-clay/20 pt-4">
              <span className="text-sm text-smoke">Deposit (10%)</span>
              <span className="font-bold text-clay">৳ {(parseInt(listingPrice.replace(/,/g, '')) * 0.1).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-smoke">Buyer</span>
              <span className="text-sm text-ink">{formData.buyerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-smoke">Phone</span>
              <span className="text-sm text-ink">{formData.buyerPhone}</span>
            </div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-sand/50 p-6">
            <p className="text-sm font-semibold text-ink">How to pay via bKash:</p>
            <ol className="mt-3 space-y-2 text-xs text-smoke">
              <li>1. Open bKash app or dial *247#</li>
              <li>2. Select &quot;Send Money&quot;</li>
              <li>3. Enter our merchant number</li>
              <li>4. Enter amount: ৳ {(parseInt(listingPrice.replace(/,/g, '')) * 0.1).toLocaleString()}</li>
              <li>5. Complete transaction and keep reference number</li>
            </ol>
          </div>

          <div className="space-y-3">
            <button
              onClick={handlePaymentConfirm}
              disabled={isLoading}
              className="w-full rounded-full bg-moss px-6 py-3 text-sm font-semibold text-white transition hover:bg-opacity-90 disabled:opacity-50"
            >
              {isLoading ? 'Processing…' : 'Confirm Deposit & Submit Booking'}
            </button>
            <button
              type="button"
              onClick={() => setStep('form')}
              className="w-full rounded-full border border-black/20 bg-white px-6 py-3 text-sm font-semibold text-ink transition hover:bg-sand"
            >
              Back to Edit Details
            </button>
          </div>

          <p className="text-xs text-smoke text-center">
            Your booking will be pending until the seller confirms receipt of payment.
          </p>
        </div>
      )}
    </div>
  );
}

