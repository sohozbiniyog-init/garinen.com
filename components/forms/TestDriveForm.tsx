'use client';

import { PROFESSION_OPTIONS, type ProfessionType } from '@/lib/professions';
import { useState, type ChangeEvent, type FormEvent } from 'react';

export interface TestDriveFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  profession: ProfessionType;
  preferredDate: string;
  preferredTime: string;
  notes: string;
}

interface TestDriveFormProps {
  initialData?: Partial<TestDriveFormData>;
  selectedCar?: { title: string; price: string } | null;
  onSubmit: (data: TestDriveFormData) => Promise<boolean | void>;
  isLoading?: boolean;
}

export function TestDriveForm({ initialData, selectedCar, onSubmit, isLoading }: TestDriveFormProps) {
  const [formData, setFormData] = useState<TestDriveFormData>({
    name: initialData?.name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    address: initialData?.address || '',
    profession: initialData?.profession || 'OTHER',
    preferredDate: initialData?.preferredDate || '',
    preferredTime: initialData?.preferredTime || '',
    notes: initialData?.notes || '',
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const canSubmit = formData.name.trim() && formData.email.trim();

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-[2rem] border border-black/10 bg-white/80 p-8 shadow-soft">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-smoke">Book a Test Drive</p>
        {selectedCar && (
          <h2 className="mt-2 text-2xl font-bold text-ink">{selectedCar.title}</h2>
        )}
      </div>

      <div className="border-t border-black/5 pt-6 space-y-5">
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-ink">Your Full Name *</label>
          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            autoComplete="name"
            placeholder="Ahmed Rahman…"
            className="mt-2 w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-moss"
            required
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-ink">Email *</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              spellCheck={false}
              placeholder="ahmed@example.com"
              className="mt-2 w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-moss"
              required
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-ink">Phone Number (optional)</label>
            <input
              id="phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              autoComplete="tel"
              inputMode="tel"
              placeholder="+880 17…"
              className="mt-2 w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-moss"
            />
          </div>
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
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label htmlFor="preferredDate" className="block text-sm font-semibold text-ink">Preferred Date</label>
            <input
              id="preferredDate"
              type="date"
              name="preferredDate"
              value={formData.preferredDate}
              onChange={handleChange}
              className="mt-2 w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-moss"
            />
          </div>
          <div>
            <label htmlFor="preferredTime" className="block text-sm font-semibold text-ink">Preferred Time</label>
            <input
              id="preferredTime"
              type="time"
              name="preferredTime"
              value={formData.preferredTime}
              onChange={handleChange}
              className="mt-2 w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-moss"
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
              {PROFESSION_OPTIONS.filter((opt) => opt.value !== '').map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-semibold text-ink">Additional Notes</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Anything specific you want to know about the car?"
            rows={3}
            className="mt-2 w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-moss"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || !canSubmit}
        className="w-full rounded-full bg-moss px-6 py-3 text-sm font-semibold text-white transition hover:bg-opacity-90 disabled:opacity-50"
      >
        {isLoading ? 'Submitting…' : 'Request Test Drive'}
      </button>
    </form>
  );
}
