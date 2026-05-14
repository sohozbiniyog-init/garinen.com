interface VendorSignupSectionProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function VendorSignupSection({ checked, onChange }: VendorSignupSectionProps) {
  return (
    <div className="rounded-lg border border-brand-red/10 bg-primary-soft p-4">
      <label className="flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="h-5 w-5 rounded border border-black/20 cursor-pointer"
        />

        <span className="text-sm font-semibold text-brand-black">আমি ভেন্ডর হিসাবে সাইন আপ করতে চাই</span>
      </label>

      {checked && (
        <p className="mt-2 text-xs text-brand-gray">
          ভেন্ডর হিসেবে সাইন আপ করলে আপনাকে শর্তাবলী পড়তে এবং সম্মত হতে হবে।
        </p>
      )}
    </div>
  );
}
