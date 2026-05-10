'use client';

import { useState } from 'react';

export interface CustomOrderFormData {
  brand: string;
  model: string;
  yearFrom: string;
  yearTo: string;
  budget: string;
  color: string;
  features: string;
  notes: string;
}

interface CustomOrderFormProps {
  onSubmit: (data: CustomOrderFormData) => void;
  isLoading?: boolean;
}

export function CustomOrderForm({ onSubmit, isLoading = false }: CustomOrderFormProps) {
  const [formData, setFormData] = useState<CustomOrderFormData>({
    brand: '',
    model: '',
    yearFrom: '',
    yearTo: '',
    budget: '',
    color: '',
    features: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.brand.trim()) {
      newErrors.brand = 'Car brand is required';
    }
    if (!formData.model.trim()) {
      newErrors.model = 'Car model is required';
    }
    if (formData.yearFrom && formData.yearTo) {
      const from = parseInt(formData.yearFrom);
      const to = parseInt(formData.yearTo);
      if (from > to) {
        newErrors.yearFrom = 'From year must be less than To year';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
      // Reset form on success
      setFormData({
        brand: '',
        model: '',
        yearFrom: '',
        yearTo: '',
        budget: '',
        color: '',
        features: '',
        notes: '',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-[1.5rem] bg-white/80 p-8 shadow-soft">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Brand */}
        <div className="space-y-2">
          <label htmlFor="brand" className="block text-sm font-semibold text-ink">
            Car Brand <span className="text-clay">*</span>
          </label>
          <input
            type="text"
            id="brand"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            placeholder="e.g., Toyota, Honda, BMW"
            className="w-full rounded-lg border border-black/10 bg-white/50 px-4 py-3 text-ink placeholder-smoke transition focus:border-moss focus:outline-none focus:ring-2 focus:ring-moss/20"
          />
          {errors.brand && <p className="text-sm text-clay">{errors.brand}</p>}
        </div>

        {/* Model */}
        <div className="space-y-2">
          <label htmlFor="model" className="block text-sm font-semibold text-ink">
            Car Model <span className="text-clay">*</span>
          </label>
          <input
            type="text"
            id="model"
            name="model"
            value={formData.model}
            onChange={handleChange}
            placeholder="e.g., Camry, Civic, M340i"
            className="w-full rounded-lg border border-black/10 bg-white/50 px-4 py-3 text-ink placeholder-smoke transition focus:border-moss focus:outline-none focus:ring-2 focus:ring-moss/20"
          />
          {errors.model && <p className="text-sm text-clay">{errors.model}</p>}
        </div>

        {/* Year From */}
        <div className="space-y-2">
          <label htmlFor="yearFrom" className="block text-sm font-semibold text-ink">
            Preferred Year From
          </label>
          <input
            type="number"
            id="yearFrom"
            name="yearFrom"
            value={formData.yearFrom}
            onChange={handleChange}
            placeholder="2020"
            min="1990"
            max={new Date().getFullYear()}
            className="w-full rounded-lg border border-black/10 bg-white/50 px-4 py-3 text-ink placeholder-smoke transition focus:border-moss focus:outline-none focus:ring-2 focus:ring-moss/20"
          />
        </div>

        {/* Year To */}
        <div className="space-y-2">
          <label htmlFor="yearTo" className="block text-sm font-semibold text-ink">
            Preferred Year To
          </label>
          <input
            type="number"
            id="yearTo"
            name="yearTo"
            value={formData.yearTo}
            onChange={handleChange}
            placeholder="2025"
            min="1990"
            max={new Date().getFullYear()}
            className="w-full rounded-lg border border-black/10 bg-white/50 px-4 py-3 text-ink placeholder-smoke transition focus:border-moss focus:outline-none focus:ring-2 focus:ring-moss/20"
          />
          {errors.yearFrom && <p className="text-sm text-clay">{errors.yearFrom}</p>}
        </div>

        {/* Budget */}
        <div className="space-y-2">
          <label htmlFor="budget" className="block text-sm font-semibold text-ink">
            Budget
          </label>
          <input
            type="text"
            id="budget"
            name="budget"
            value={formData.budget}
            onChange={handleChange}
            placeholder="e.g., 2,000,000 - 3,000,000 BDT"
            className="w-full rounded-lg border border-black/10 bg-white/50 px-4 py-3 text-ink placeholder-smoke transition focus:border-moss focus:outline-none focus:ring-2 focus:ring-moss/20"
          />
        </div>

        {/* Color */}
        <div className="space-y-2">
          <label htmlFor="color" className="block text-sm font-semibold text-ink">
            Preferred Color
          </label>
          <input
            type="text"
            id="color"
            name="color"
            value={formData.color}
            onChange={handleChange}
            placeholder="e.g., Black, Silver, Red"
            className="w-full rounded-lg border border-black/10 bg-white/50 px-4 py-3 text-ink placeholder-smoke transition focus:border-moss focus:outline-none focus:ring-2 focus:ring-moss/20"
          />
        </div>
      </div>

      {/* Features */}
      <div className="space-y-2">
        <label htmlFor="features" className="block text-sm font-semibold text-ink">
          Desired Features
        </label>
        <textarea
          id="features"
          name="features"
          value={formData.features}
          onChange={handleChange}
          placeholder="e.g., Sunroof, Leather seats, Navigation system, Backup camera"
          rows={3}
          className="w-full rounded-lg border border-black/10 bg-white/50 px-4 py-3 text-ink placeholder-smoke transition focus:border-moss focus:outline-none focus:ring-2 focus:ring-moss/20"
        />
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <label htmlFor="notes" className="block text-sm font-semibold text-ink">
          Additional Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Tell us more about what you're looking for..."
          rows={4}
          className="w-full rounded-lg border border-black/10 bg-white/50 px-4 py-3 text-ink placeholder-smoke transition focus:border-moss focus:outline-none focus:ring-2 focus:ring-moss/20"
        />
      </div>

      {/* Submit Button */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 rounded-lg bg-moss px-6 py-3 font-semibold text-white transition hover:bg-moss/90 disabled:opacity-50"
        >
          {isLoading ? 'Submitting...' : 'Submit Custom Order Request'}
        </button>
      </div>
    </form>
  );
}

