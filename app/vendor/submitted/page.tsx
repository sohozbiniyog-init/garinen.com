'use client';

import { useRouter } from 'next/navigation';

export default function VendorSubmittedPage() {
  const router = useRouter();

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-6 py-10">
      <div className="w-full rounded-[2rem] border border-black/10 bg-white/85 p-8 shadow-soft text-center">
        {/* Success Icon */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-moss/20">
            <svg
              className="h-8 w-8 text-moss"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* Header */}
        <h1 className="text-3xl font-bold text-ink">আপনার তথ্য জমা হয়েছে</h1>
        <p className="mt-4 text-sm text-smoke leading-6">
          ধন্যবাদ আপনার তথ্য সবমিট করার জন্য। আমাদের প্রশাসক দল আপনার আবেদন পর্যালোচনা করবে এবং আপনার সাথে যোগাযোগ করবে।
        </p>

        {/* Timeline */}
        <div className="my-8 space-y-4 rounded-lg border border-black/10 bg-moss/5 p-6">
          <div className="flex gap-4">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-moss text-white text-sm font-bold">
              ✓
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-ink">ধাপ ১: আবেদন জমা সম্পন্ন</h3>
              <p className="mt-1 text-xs text-smoke">আপনার তথ্য আমাদের সিস্টেমে সংরক্ষিত হয়েছে।</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-black/10 text-black/40 text-sm font-bold">
              2
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-ink">ধাপ ২: অভ্যন্তরীণ মূল্যায়ন</h3>
              <p className="mt-1 text-xs text-smoke">আমাদের দল আপনার তথ্য যাচাই করবে এবং মূল্যায়ন করবে।</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-black/10 text-black/40 text-sm font-bold">
              3
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-ink">ধাপ ৩: অনুমোদন এবং সক্রিয়করণ</h3>
              <p className="mt-1 text-xs text-smoke">অনুমোদিত হলে আপনি আপনার ভেন্ডর অ্যাকাউন্ট ব্যবহার করতে পারবেন।</p>
            </div>
          </div>
        </div>

        {/* Key Points */}
        <div className="mb-8 rounded-lg border border-black/10 bg-black/5 p-4 text-left">
          <h3 className="mb-3 font-semibold text-ink">গুরুত্বপূর্ণ তথ্য</h3>
          <ul className="space-y-2 text-sm text-ink">
            <li className="flex gap-2">
              <span className="flex-shrink-0 text-moss">•</span>
              <span>অনুমোদন প্রক্রিয়া সাধারণত ২-৫ কর্মদিবস সময় নেয়।</span>
            </li>
            <li className="flex gap-2">
              <span className="flex-shrink-0 text-moss">•</span>
              <span>আমরা আপনার নিবন্ধিত ইমেল বা ফোনে যোগাযোগ করব।</span>
            </li>
            <li className="flex gap-2">
              <span className="flex-shrink-0 text-moss">•</span>
              <span>অনুমোদিত না হওয়া পর্যন্ত ভেন্ডর বৈশিষ্ট্য অক্ষম থাকবে।</span>
            </li>
            <li className="flex gap-2">
              <span className="flex-shrink-0 text-moss">•</span>
              <span>যেকোনো প্রশ্নের জন্য আমাদের সাপোর্ট টিম সবসময় প্রস্তুত।</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="rounded-lg bg-moss px-6 py-3 font-semibold text-white hover:opacity-90 transition-opacity"
          >
            ড্যাশবোর্ডে যান
          </button>
          <button
            onClick={() => router.push('/')}
            className="rounded-lg border border-black/10 bg-white/50 px-6 py-3 font-semibold text-ink hover:bg-black/5 transition-colors"
          >
            হোমপেজে ফিরুন
          </button>
        </div>

        {/* Support */}
        <p className="mt-8 text-xs text-smoke">
          সাহায্য দরকার? আমাদের{' '}
          <a href="/contact" className="underline hover:text-ink">
            যোগাযোগ করুন
          </a>
        </p>
      </div>
    </main>
  );
}
