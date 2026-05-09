'use client';

import Link from 'next/link';
import { RequestBookingForm, BookingFormData } from '@/components/request-booking-form';
import EmiCalculator from '@/components/emi-calculator';
import WishlistButton from '@/components/WishlistButton';
import { ReviewForm, ReviewSubmitData } from '@/components/review-form';
import { ReviewCard } from '@/components/review-card';
import { addDraft } from '@/lib/emi-apps';
import { showToast } from './toast';
import { useState, type ChangeEvent, type FormEvent } from 'react';

interface ListingDetailPageProps {
  id?: string;
  title?: string;
  brand?: string;
  model?: string;
  year?: number;
  price?: string;
  mileage?: string;
  location?: string;
  shopName?: string;
}

type TestDriveFormData = {
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  address: string;
  profession: 'DOCTOR' | 'ENGINEER' | 'BUSINESSMAN' | 'EMPLOYEE' | 'STUDENT' | 'OTHER';
  preferredDate: string;
  preferredTime: string;
};

const TEST_DRIVE_TIMES = ['9:00 AM', '11:00 AM', '1:00 PM', '3:00 PM', '5:00 PM'];
const TEST_DRIVE_PROFESSIONS: Array<TestDriveFormData['profession']> = ['DOCTOR', 'ENGINEER', 'BUSINESSMAN', 'EMPLOYEE', 'STUDENT', 'OTHER'];

const defaultTestDriveFormData: TestDriveFormData = {
  contactName: '',
  contactPhone: '',
  contactEmail: '',
  address: '',
  profession: 'OTHER',
  preferredDate: '',
  preferredTime: TEST_DRIVE_TIMES[1],
};

// Sample reviews data - would come from database
const sampleReviews = [
  {
    id: 1,
    author: 'Ahmed Khan',
    location: 'Gulshan, Dhaka',
    rating: 5,
    initials: 'AK',
    content: 'Perfect car! Exactly as described. Fast transaction and excellent seller communication.'
  },
  {
    id: 2,
    author: 'Fatima Begum',
    location: 'Dhanmondi, Dhaka',
    rating: 4,
    initials: 'FB',
    content: 'Great car condition. Minor service needed but overall very satisfied with the purchase and delivery.'
  }
];

export function ListingDetail({
  id = '1',
  title = 'Toyota Corolla 2022 - Excellent Condition',
  brand = 'Toyota',
  model = 'Corolla',
  year = 2022,
  price = '2,500,000',
  mileage = '45,000',
  location = 'Dhaka',
  shopName = 'Elite Motors'
}: ListingDetailPageProps) {
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showTestDriveForm, setShowTestDriveForm] = useState(false);
  const [testDriveStep, setTestDriveStep] = useState<'form' | 'confirm'>('form');
  const [testDriveForm, setTestDriveForm] = useState<TestDriveFormData>(defaultTestDriveFormData);
  const [testDriveConfirmation, setTestDriveConfirmation] = useState<TestDriveFormData | null>(null);
  const [reviews, setReviews] = useState(sampleReviews);
  const [bookingLoading, setBookingLoading] = useState(false);

  const handleBookingSubmit = async (data: BookingFormData) => {
    setBookingLoading(true);

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: id,
          buyerName: data.buyerName,
          buyerPhone: data.buyerPhone,
          buyerEmail: data.buyerEmail,
          address: data.address,
          profession: data.profession,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to create booking');
      }

      showToast(`Booking created! Reference: ${payload.paymentReference || payload.id} — Deposit: ৳ ${payload.depositAmount}`, { type: 'success' });
      setShowBookingForm(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create booking';
      showToast(message, { type: 'error' });
    } finally {
      setBookingLoading(false);
    }
  };

  const handleTestDriveChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTestDriveForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTestDriveSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      !testDriveForm.contactName.trim() ||
      !testDriveForm.contactPhone.trim() ||
      !testDriveForm.contactEmail.trim() ||
      !testDriveForm.address.trim() ||
      !testDriveForm.preferredDate
    ) {
      return;
    }

    setTestDriveStep('confirm');
  };

  const handleTestDriveConfirm = () => {
    setTestDriveConfirmation(testDriveForm);
    setShowTestDriveForm(false);
    setTestDriveStep('form');
    setTestDriveForm(defaultTestDriveFormData);
  };

  const canProceedTestDrive = Boolean(
    testDriveForm.contactName.trim() &&
      testDriveForm.contactPhone.trim() &&
      testDriveForm.contactEmail.trim() &&
      testDriveForm.address.trim() &&
      testDriveForm.preferredDate
  );

  const handleReviewSubmit = (data: ReviewSubmitData) => {
    const newReview = {
      id: reviews.length + 1,
      author: data.buyerName,
      location: 'Dhaka',
      rating: data.rating,
      initials: data.buyerName.substring(0, 2).toUpperCase(),
      content: data.content
    };
    setReviews([...reviews, newReview]);
    showToast('Thank you! Your review has been submitted successfully.', { type: 'success' });
  };

  return (
    <main id="main-content" className="min-h-screen w-full px-6 py-10 lg:px-10">
      <div className="mb-10">
        <Link href="/listings" className="text-sm font-semibold text-sky-300 transition hover:text-white">
          ← Back to Listings
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <div className="glass-card rounded-[2rem] p-8 shadow-soft">
            <div className="space-y-6">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-600">Listing Details</p>
                <h1 className="mt-3 text-4xl font-bold text-slate-900">{title}</h1>
              </div>

              {/* Gallery: image placeholders + video embed */}
              <div className="mt-4">
                <div className="grid gap-4 lg:grid-cols-[1fr_200px]">
                  <div className="rounded-lg bg-slate-100">
                    <div className="aspect-[16/9] bg-slate-200 flex items-center justify-center text-sm text-slate-500 overflow-hidden">
                      <img
                        src="https://images.unsplash.com/photo-1549921296-3d5a4f1d9a13?auto=format&fit=crop&w=1400&q=80"
                        alt="Listing image"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="mt-2 grid grid-cols-4 gap-2">
                      <img src="/images/carousel/toyota.png" alt="thumb" className="h-16 w-full rounded-md object-contain bg-white/50 p-2" />
                      <img src="/images/carousel/honda.png" alt="thumb" className="h-16 w-full rounded-md object-contain bg-white/50 p-2" />
                      <img src="/images/carousel/hyundai.png" alt="thumb" className="h-16 w-full rounded-md object-contain bg-white/50 p-2" />
                      <img src="/images/carousel/nissan.png" alt="thumb" className="h-16 w-full rounded-md object-contain bg-white/50 p-2" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="aspect-[16/9] rounded-md bg-slate-100 flex items-center justify-center overflow-hidden">
                      <img
                        src="https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1400&q=80"
                        alt="Video preview placeholder"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-xs text-slate-600">Media: vendor images or gallery (if available)</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 border-t border-white/20 pt-6 text-sm">
                <div>
                  <p className="text-xs text-slate-600">Brand & Model</p>
                  <p className="mt-2 text-lg font-bold text-slate-900">
                    {brand} {model}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Year</p>
                  <p className="mt-2 text-lg font-bold text-slate-900">{year}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Mileage</p>
                  <p className="mt-2 text-lg font-bold text-slate-900">{mileage} km</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Location</p>
                  <p className="mt-2 text-lg font-bold text-slate-900">{location}</p>
                </div>
              </div>

              <div className="glass-card-strong rounded-2xl p-6">
                <p className="text-xs text-slate-700 font-semibold">Listed by</p>
                <p className="mt-2 text-lg font-bold text-slate-900">{shopName}</p>
              </div>

              <div className="space-y-4 border-t border-white/20 pt-6">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-600">Description</p>
                <p className="text-sm leading-7 text-slate-700">
                  Well-maintained vehicle in excellent condition. Original owner, full service history available. All documents
                  in order. No accidents or major repairs. Interested buyers can arrange test drive at our showroom.
                </p>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="space-y-6">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400 mb-2">Customer Reviews</p>
              <h2 className="text-3xl font-bold text-white">What Buyers Say</h2>
              <p className="mt-2 text-sm text-slate-300">{reviews.length} verified reviews</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  author={review.author}
                  location={review.location}
                  rating={review.rating}
                  content={review.content}
                  initials={review.initials}
                />
              ))}
            </div>

            {/* Review Form */}
            <ReviewForm 
              listingId={id ?? '1'}
              listingTitle={title}
              onSubmit={handleReviewSubmit}
              isLoading={bookingLoading}
            />
          </div>

          {/* EMI Calculator */}
          <section className="space-y-8">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400 mb-2">Financing Options</p>
              <h2 className="text-3xl font-bold text-white">Calculate Your EMI</h2>
            </div>
            <EmiCalculator carPrice={parseInt(price.replace(/,/g, ''))} />
          </section>
        </div>

        <div className="space-y-6">
          {!showBookingForm ? (
            <div className="glass-card rounded-[2rem] p-8 shadow-soft sticky top-20">
              <div className="space-y-6">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-600">Price</p>
                  <div className="mt-3 flex items-center gap-3">
                    <p className="text-5xl font-black leading-none text-slate-900">৳ {price}</p>
                    <WishlistButton
                      item={{
                        id: id ?? '1',
                        title,
                        brand,
                        model,
                        year,
                        price: parseInt((price || '0').toString().replace(/,/g, '')),
                        location
                      }}
                      className="h-11 w-11 shrink-0 p-0"
                    />
                  </div>
                </div>

                <div className="glass-card-strong rounded-2xl p-6">
                   
                  <p className="text-sm font-semibold text-slate-900">Booking Details</p>
                  <ul className="mt-4 space-y-2 text-xs text-slate-700">
                    <li>• 10% deposit required to book</li>
                    <li>• Deposit amount: ৳ {(parseInt(price.replace(/,/g, '')) * 0.1).toLocaleString()}</li>
                    <li>• Paid via bKash merchant gateway</li>
                    <li>• Booking valid for 30 days</li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowBookingForm(true);
                    setShowTestDriveForm(false);
                  }}
                  className="glass-button w-full rounded-full px-6 py-4 text-sm font-semibold text-white transition"
                >
                  Request Booking with Deposit
                </button>
                <button
                  type="button"
                  aria-expanded={showTestDriveForm}
                  aria-controls="test-drive-form"
                  onClick={() => {
                    const nextOpen = !showTestDriveForm;
                    setShowTestDriveForm(nextOpen);
                    setShowBookingForm(false);
                    if (nextOpen) {
                      setTestDriveStep('form');
                    }
                  }}
                  className="glass-button w-full rounded-full px-6 py-4 text-sm font-semibold text-white transition"
                >
                  Book a Test Drive
                </button>
                {testDriveConfirmation && (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 text-sm text-emerald-950" role="status" aria-live="polite">
                    <p className="font-semibold">Test drive request saved</p>
                    <p className="mt-1">
                      {testDriveConfirmation.contactName} is set for {testDriveConfirmation.preferredDate} at {testDriveConfirmation.preferredTime}. We will confirm on {testDriveConfirmation.contactPhone}.
                    </p>
                    <p className="mt-1">
                      Address: {testDriveConfirmation.address} | Profession: {testDriveConfirmation.profession}
                    </p>
                  </div>
                )}

                {showTestDriveForm && (
                  <div
                    id="test-drive-form"
                    className="space-y-4 rounded-[1.75rem] border border-white/20 bg-white/85 p-6 shadow-soft"
                  >
                    {testDriveStep === 'form' ? (
                      <form onSubmit={handleTestDriveSubmit} className="space-y-4">
                        <div>
                          <p className="text-sm uppercase tracking-[0.2em] text-slate-600">Test Drive</p>
                          <h2 className="mt-2 text-xl font-bold text-slate-900">Reserve a Time Slot</h2>
                          <p className="mt-2 text-sm text-slate-600">Pick a slot and continue to confirmation.</p>
                        </div>

                        <div>
                          <label htmlFor="contactName" className="block text-sm font-semibold text-slate-800">
                            Your Full Name
                          </label>
                          <input
                            id="contactName"
                            name="contactName"
                            type="text"
                            value={testDriveForm.contactName}
                            onChange={handleTestDriveChange}
                            autoComplete="name"
                            placeholder="Ahmed Rahman…"
                            required
                            className="mt-2 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-red/25"
                          />
                        </div>

                        <div>
                          <label htmlFor="contactPhone" className="block text-sm font-semibold text-slate-800">
                            Phone Number
                          </label>
                          <input
                            id="contactPhone"
                            name="contactPhone"
                            type="tel"
                            value={testDriveForm.contactPhone}
                            onChange={handleTestDriveChange}
                            autoComplete="tel"
                            inputMode="tel"
                            placeholder="+880 17…"
                            required
                            className="mt-2 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-red/25"
                          />
                        </div>

                        <div>
                          <label htmlFor="contactEmail" className="block text-sm font-semibold text-slate-800">
                            Email
                          </label>
                          <input
                            id="contactEmail"
                            name="contactEmail"
                            type="email"
                            value={testDriveForm.contactEmail}
                            onChange={handleTestDriveChange}
                            autoComplete="email"
                            placeholder="ahmed@example.com"
                            required
                            className="mt-2 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-red/25"
                          />
                        </div>

                        <div>
                          <label htmlFor="address" className="block text-sm font-semibold text-slate-800">
                            Address
                          </label>
                          <input
                            id="address"
                            name="address"
                            type="text"
                            value={testDriveForm.address}
                            onChange={handleTestDriveChange}
                            autoComplete="street-address"
                            placeholder="Your residential address..."
                            required
                            className="mt-2 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-red/25"
                          />
                        </div>

                        <div>
                          <label htmlFor="testDriveProfession" className="block text-sm font-semibold text-slate-800">Profession</label>
                          <select
                            id="testDriveProfession"
                            name="profession"
                            value={testDriveForm.profession}
                            onChange={handleTestDriveChange}
                            className="mt-2 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-red/25"
                          >
                            {TEST_DRIVE_PROFESSIONS.map((profession) => (
                              <option key={profession} value={profession}>
                                {profession}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label htmlFor="preferredDate" className="block text-sm font-semibold text-slate-800">
                              Preferred Date
                            </label>
                            <input
                              id="preferredDate"
                              name="preferredDate"
                              type="date"
                              value={testDriveForm.preferredDate}
                              onChange={handleTestDriveChange}
                              required
                              className="mt-2 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-red/25"
                            />
                          </div>

                          <div>
                            <label htmlFor="preferredTime" className="block text-sm font-semibold text-slate-800">
                              Preferred Time
                            </label>
                            <select
                              id="preferredTime"
                              name="preferredTime"
                              value={testDriveForm.preferredTime}
                              onChange={handleTestDriveChange}
                              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-red/25"
                            >
                              {TEST_DRIVE_TIMES.map((time) => (
                                <option key={time} value={time}>
                                  {time}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <button
                            type="submit"
                            disabled={!canProceedTestDrive}
                            className="flex-1 rounded-full bg-brand-red px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-red-deep disabled:opacity-50"
                          >
                            Proceed to Confirmation
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowTestDriveForm(false)}
                            className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm uppercase tracking-[0.2em] text-slate-600">Test Drive Confirmation</p>
                          <h2 className="mt-2 text-xl font-bold text-slate-900">Confirm Your Slot</h2>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800">
                          <div className="flex justify-between border-b border-slate-200 pb-2">
                            <span>Listing</span>
                            <span className="font-semibold text-slate-900">{title}</span>
                          </div>
                          <div className="mt-2 flex justify-between">
                            <span>Name</span>
                            <span className="font-semibold text-slate-900">{testDriveForm.contactName}</span>
                          </div>
                          <div className="mt-2 flex justify-between">
                            <span>Phone</span>
                            <span className="font-semibold text-slate-900">{testDriveForm.contactPhone}</span>
                          </div>
                          <div className="mt-2 flex justify-between">
                            <span>Email</span>
                            <span className="font-semibold text-slate-900">{testDriveForm.contactEmail}</span>
                          </div>
                          <div className="mt-2 flex justify-between">
                            <span>Address</span>
                            <span className="font-semibold text-slate-900">{testDriveForm.address}</span>
                          </div>
                          <div className="mt-2 flex justify-between">
                            <span>Profession</span>
                            <span className="font-semibold text-slate-900">{testDriveForm.profession}</span>
                          </div>
                          <div className="mt-2 flex justify-between">
                            <span>Date</span>
                            <span className="font-semibold text-slate-900">{testDriveForm.preferredDate}</span>
                          </div>
                          <div className="mt-2 flex justify-between">
                            <span>Time</span>
                            <span className="font-semibold text-slate-900">{testDriveForm.preferredTime}</span>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={handleTestDriveConfirm}
                            className="flex-1 rounded-full bg-brand-red px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-red-deep"
                          >
                            Confirm Slot
                          </button>
                          <button
                            type="button"
                            onClick={() => setTestDriveStep('form')}
                            className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            Back
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {/* Financing Option - Directly Below Price */}
                <Link
                  href={`/dashboard/buyer/loan-apply?listingId=${id}&title=${encodeURIComponent(title)}&brand=${encodeURIComponent(brand)}&model=${encodeURIComponent(model)}&year=${year}&price=${price.replace(/,/g, '')}&location=${encodeURIComponent(location)}`}
                  className="block w-full rounded-full border border-white/20 bg-white/10 backdrop-blur px-6 py-4 text-center text-sm font-semibold text-slate-900 transition hover:bg-white/20"
                >
                  Apply for Car Loan
                </Link>

                
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => {
                      addDraft({ listingId: id ?? '1', title, status: 'DRAFT' });
                      addDraft({ listingId: id ?? '1', title, status: 'DRAFT' });
                      showToast('Saved EMI application draft. Check Buyer → EMI Applications in your dashboard.', { type: 'success' });
                    }}
                    className="w-full rounded-full border border-white/20 bg-white/10 backdrop-blur px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-white/20"
                  >
                    Save EMI Draft
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <RequestBookingForm listingTitle={title} listingPrice={price} onSubmit={handleBookingSubmit} />
          )}
        </div>
      </div>
    </main>
  );
}
