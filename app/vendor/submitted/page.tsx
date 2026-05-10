'use client';

import { useRouter } from 'next/navigation';

export default function VendorSubmittedPage() {
  const router = useRouter();

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-6 py-10">
      <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
            <svg
              className="h-8 w-8 text-white"
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

        <h1 className="text-3xl font-semibold text-white">আপনার তথ্য জমা হয়েছে</h1>
        <p className="mt-4 text-sm leading-6 text-slate-300">
          ধন্যবাদ। প্রশাসক দল আপনার আবেদন পর্যালোচনা করবে এবং যোগাযোগ করবে।
        </p>

        <div className="my-8 space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6 text-left">
          <div className="flex gap-4">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-slate-900">
              ✓
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-white">ধাপ ১: আবেদন জমা সম্পন্ন</h3>
              <p className="mt-1 text-xs text-slate-400">আপনার তথ্য আমাদের সিস্টেমে সংরক্ষিত হয়েছে।</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-slate-300">
              2
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-white">ধাপ ২: অভ্যন্তরীণ মূল্যায়ন</h3>
              <p className="mt-1 text-xs text-slate-400">আমাদের দল তথ্য যাচাই করবে।</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-slate-300">
              3
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-white">ধাপ ৩: অনুমোদন এবং সক্রিয়করণ</h3>
              <p className="mt-1 text-xs text-slate-400">অনুমোদিত হলে আপনি ভেন্ডর অ্যাকাউন্ট ব্যবহার করতে পারবেন।</p>
            </div>
          </div>
        </div>

        <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-4 text-left">
          <h3 className="mb-3 font-semibold text-white">গুরুত্বপূর্ণ তথ্য</h3>
          <ul className="space-y-2 text-sm text-slate-300">
            <li className="flex gap-2">
              <span className="flex-shrink-0 text-white">•</span>
              <span>অনুমোদন প্রক্রিয়া সাধারণত ২-৫ কর্মদিবস সময় নেয়।</span>
            </li>
            <li className="flex gap-2">
              <span className="flex-shrink-0 text-white">•</span>
              <span>আমরা আপনার নিবন্ধিত ইমেল বা ফোনে যোগাযোগ করব।</span>
            </li>
            <li className="flex gap-2">
              <span className="flex-shrink-0 text-white">•</span>
              <span>অনুমোদিত না হওয়া পর্যন্ত ভেন্ডর বৈশিষ্ট্য অক্ষম থাকবে।</span>
            </li>
            <li className="flex gap-2">
              <span className="flex-shrink-0 text-white">•</span>
              <span>যেকোনো প্রশ্নের জন্য আমাদের সাপোর্ট টিম সবসময় প্রস্তুত।</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="rounded-lg bg-white px-6 py-3 font-semibold text-slate-900 transition-opacity hover:opacity-90"
          >
            ড্যাশবোর্ডে যান
          </button>
          <button
            onClick={() => router.push('/')}
            className="rounded-lg border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white transition-colors hover:bg-white/10"
          >
            হোমপেজে ফিরুন
          </button>
        </div>

        <p className="mt-8 text-xs text-slate-400">
          সাহায্য দরকার? আমাদের{' '}
          <a href="/contact" className="underline hover:text-white">
            যোগাযোগ করুন
          </a>
        </p>
      </div>
    </main>
  );
}

