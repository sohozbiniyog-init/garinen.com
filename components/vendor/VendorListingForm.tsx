import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { showToast } from '@/components/common/Toast';
import { VEHICLE_BRANDS } from '@/lib/config/vehicle-brands';

interface VendorListingFormProps {
  onSuccess?: () => void;
  editingListing?: {
    id: string;
    title: string;
    brand: string;
    model: string;
    year: number;
    price: string;
    condition: 'NEW' | 'USED' | 'RECONDITIONED';
    mileage: number | null;
    location: string;
  };
}

export function VendorListingForm({ onSuccess, editingListing }: VendorListingFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [vendorLocation, setVendorLocation] = useState<string>('');

  // Form state
  const [title, setTitle] = useState(editingListing?.title || '');
  const [brand, setBrand] = useState(editingListing?.brand || '');
  const [model, setModel] = useState(editingListing?.model || '');
  const [year, setYear] = useState(editingListing?.year.toString() || new Date().getFullYear().toString());
  const [price, setPrice] = useState(editingListing?.price || '');
  const [location, setLocation] = useState(editingListing?.location || '');
  const [condition, setCondition] = useState<'NEW' | 'USED' | 'RECONDITIONED'>(
    editingListing?.condition || 'NEW'
  );
  const [mileage, setMileage] = useState(editingListing?.mileage?.toString() || '');

  // Fetch vendor location on mount
  useEffect(() => {
    const fetchVendorInfo = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          const locationAddress = data?.profile?.vendorInfo?.locationAddress;
          if (locationAddress) {
            setVendorLocation(locationAddress);
            if (!editingListing) {
              setLocation(locationAddress);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch vendor info:', error);
      }
    };

    fetchVendorInfo();
  }, [editingListing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation
      if (!title || !brand || !model || !year || !price || !location) {
        showToast('Please fill in all required fields', { type: 'error' });
        setLoading(false);
        return;
      }

      if ((condition === 'USED' || condition === 'RECONDITIONED') && !mileage) {
        showToast('Mileage is required for used and reconditioned vehicles', { type: 'error' });
        setLoading(false);
        return;
      }

      const url = editingListing ? `/api/vendor/listings/${editingListing.id}` : '/api/vendor/listings';
      const method = editingListing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          brand,
          model,
          year: parseInt(year),
          price: parseFloat(price),
          condition,
          mileage: mileage ? parseInt(mileage) : null,
          location,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || 'Failed to save listing', { type: 'error' });
        return;
      }

      showToast(
        editingListing
          ? data.message || 'Listing updated successfully'
          : 'Listing created successfully! Awaiting admin approval.',
        { type: 'success' }
      );

      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/dashboard/seller/listings');
      }
    } catch (error) {
      console.error('Error saving listing:', error);
      showToast('Failed to save listing', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => (currentYear - i).toString());

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl bg-white rounded-xl p-8 shadow-lg">
      {/* Title */}
      <div className="space-y-2">
        <label htmlFor="title" className="block text-sm font-medium text-gray-900">
          Listing Title *
        </label>
        <input
          id="title"
          type="text"
          placeholder="e.g., 2020 Toyota Corolla"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
        />
      </div>

      {/* Brand & Model Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="brand" className="block text-sm font-medium text-gray-900">
            Brand *
          </label>
          <select
            id="brand"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 bg-white"
          >
            <option value="">Select brand</option>
            {VEHICLE_BRANDS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="model" className="block text-sm font-medium text-gray-900">
            Model *
          </label>
          <input
            id="model"
            type="text"
            placeholder="e.g., Corolla"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
          />
        </div>
      </div>

      {/* Year & Price Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="year" className="block text-sm font-medium text-gray-900">
            Year *
          </label>
          <select
            id="year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 bg-white"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="price" className="block text-sm font-medium text-gray-900">
            Price (BDT) *
          </label>
          <input
            id="price"
            type="number"
            placeholder="1000000"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
          />
        </div>
      </div>

      {/* Location */}
      <div className="space-y-2">
        <label htmlFor="location" className="block text-sm font-medium text-gray-900">
          Location *
        </label>
        <input
          id="location"
          type="text"
          placeholder="Auto-filled from your vendor profile"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          disabled={vendorLocation === location && !editingListing}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 text-gray-900"
        />
        {vendorLocation && (
          <p className="text-sm text-gray-500">From your vendor profile: {vendorLocation}</p>
        )}
      </div>

      {/* Condition Checkboxes */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-900">Vehicle Condition *</label>
        <div className="space-y-2">
          <div className="flex items-center">
            <input
              id="new"
              type="radio"
              name="condition"
              value="NEW"
              checked={condition === 'NEW'}
              onChange={() => setCondition('NEW')}
              className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
            />
            <label htmlFor="new" className="ml-3 cursor-pointer font-normal text-gray-900">
              New
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="used"
              type="radio"
              name="condition"
              value="USED"
              checked={condition === 'USED'}
              onChange={() => setCondition('USED')}
              className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
            />
            <label htmlFor="used" className="ml-3 cursor-pointer font-normal text-gray-900">
              Used
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="reconditioned"
              type="radio"
              name="condition"
              value="RECONDITIONED"
              checked={condition === 'RECONDITIONED'}
              onChange={() => setCondition('RECONDITIONED')}
              className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
            />
            <label htmlFor="reconditioned" className="ml-3 cursor-pointer font-normal text-gray-900">
              Reconditioned
            </label>
          </div>
        </div>
      </div>

      {/* Conditional Mileage Field */}
      {(condition === 'USED' || condition === 'RECONDITIONED') && (
        <div className="space-y-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <label htmlFor="mileage" className="block text-sm font-medium text-gray-900">
            Mileage (km) *
          </label>
          <input
            id="mileage"
            type="number"
            placeholder="e.g., 50000"
            value={mileage}
            onChange={(e) => setMileage(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
          />
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full px-6 py-3 bg-primary text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {loading ? 'Saving...' : editingListing ? 'Update Listing' : 'Create Listing'}
      </button>

      {editingListing && (
        <p className="text-sm text-amber-600 text-center">
          ℹ️ Updating an approved listing will require admin re-approval.
        </p>
      )}
    </form>
  );
}
