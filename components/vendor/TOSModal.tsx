'use client';

import { useState } from 'react';

interface VendorTOSModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export function VendorTOSModal({ isOpen, onAccept, onDecline }: VendorTOSModalProps) {
  const [hasAgreed, setHasAgreed] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4 md:p-6">
      <div className="max-h-[85vh] w-full max-w-xl sm:max-w-2xl lg:max-w-4xl overflow-y-auto rounded-[2rem] border border-black/10 bg-white/95 p-6 sm:p-8 md:p-10 shadow-lg">
        {/* Header */}
        <h1 className="mb-4 sm:mb-6 text-2xl sm:text-3xl md:text-4xl font-bold text-ink text-center">
          ভেন্ডর চুক্তি এবং শর্তাবলী
        </h1>
        <p className="mb-6 sm:mb-8 text-center text-xs sm:text-sm md:text-base text-smoke">
          অনুগ্রহ করে সাবধানে পড়ুন। ভেন্ডর হিসাবে নিবন্ধন করার জন্য সমস্ত শর্তাবলী সম্মতি বাধ্যতামূলক।
        </p>

        {/* Content */}
        <div className="space-y-4 sm:space-y-6 text-xs sm:text-sm md:text-base text-ink">
          {/* Section 1 */}
          <div>
            <h2 className="mb-2 sm:mb-3 font-bold text-ink text-sm sm:text-base md:text-lg">১. ভেন্ডর দায়িত্ব এবং বাধ্যবাধকতা</h2>
            <ul className="list-inside space-y-1 sm:space-y-2 list-disc ml-2">
              <li><span className="font-semibold">সত্যতা:</span> আপনি গ্যারান্টি দেন যে আপনার সমস্ত তথ্য সঠিক, সম্পূর্ণ এবং বর্তমান।</li>
              <li><span className="font-semibold">গাড়ির বিবরণ:</span> সমস্ত তালিকাভুক্ত গাড়ি সঠিক অবস্থার সাথে তালিকাভুক্ত করতে হবে।</li>
              <li><span className="font-semibold">আইনি সম্মতি:</span> আপনি সমস্ত স্থানীয় এবং জাতীয় আইনকানুন মেনে চলবেন।</li>
              <li><span className="font-semibold">ট্যাক্স দায়িত্ব:</span> আপনি সমস্ত প্রয়োজনীয় ট্যাক্স সম্পর্কিত দায়বদ্ধতা স্বীকার করেন।</li>
            </ul>
          </div>

          {/* Section 2 */}
          <div>
            <h2 className="mb-2 sm:mb-3 font-bold text-ink text-sm sm:text-base md:text-lg">২. পণ্য এবং সেবার মান</h2>
            <ul className="list-inside space-y-1 sm:space-y-2 list-disc ml-2">
              <li><span className="font-semibold">গাড়ি পরিদর্শন:</span> ক্রেতারা ক্রয়ের আগে গাড়ি পরিদর্শন করার অধিকার রাখেন।</li>
              <li><span className="font-semibold">স্বচ্ছতা:</span> সকল ত্রুটি এবং সমস্যা সম্পর্কে স্বচ্ছ যোগাযোগ করতে হবে।</li>
              <li><span className="font-semibold">ওয়ারেন্টি:</span> প্রদানকৃত যেকোনো ওয়ারেন্টি সম্পূর্ণভাবে সম্মান করতে হবে।</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div>
            <h2 className="mb-2 sm:mb-3 font-bold text-ink text-sm sm:text-base md:text-lg">৩. পেমেন্ট এবং লেনদেন</h2>
            <ul className="list-inside space-y-1 sm:space-y-2 list-disc ml-2">
              <li><span className="font-semibold">কমিশন:</span> সফল বিক্রয়ের উপর গুরি অটোমোবাইলস প্রযোজ্য কমিশন নেবে।</li>
              <li><span className="font-semibold">মূল্য নির্ধারণ:</span> সমস্ত মূল্য স্পষ্ট এবং লুকানো চার্জ মুক্ত হতে হবে।</li>
              <li><span className="font-semibold">লেনদেন নিরাপত্তা:</span> সমস্ত পেমেন্ট প্ল্যাটফর্ম নিরাপত্তা মান অনুসরণ করবে।</li>
            </ul>
          </div>

          {/* Section 4 */}
          <div>
            <h2 className="mb-2 sm:mb-3 font-bold text-ink text-sm sm:text-base md:text-lg">৪. বিষয়বস্তু এবং ছবি</h2>
            <ul className="list-inside space-y-1 sm:space-y-2 list-disc ml-2">
              <li><span className="font-semibold">মালিকানা:</span> আপনি গ্যারান্টি দেন যে আপনি আপলোড করা সমস্ত ছবি এবং বিবরণের মালিক।</li>
              <li><span className="font-semibold">লাইসেন্স:</span> আপনি গুরি অটোমোবাইলসকে প্ল্যাটফর্মে বিষয়বস্তু ব্যবহার করার অনুমতি দেন।</li>
              <li><span className="font-semibold">প্রতিবন্ধী বিষয়বস্তু:</span> কোনো অপমানজনক বা অবৈধ বিষয়বস্তু অনুমোদিত নয়।</li>
            </ul>
          </div>

          {/* Section 5 */}
          <div>
            <h2 className="mb-2 sm:mb-3 font-bold text-ink text-sm sm:text-base md:text-lg">৫. দায়িত্ব সীমাবদ্ধতা</h2>
            <ul className="list-inside space-y-1 sm:space-y-2 list-disc ml-2">
              <li><span className="font-semibold">কোন দায়িত্ব নেই:</span> গুরি অটোমোবাইলস ক্রেতা এবং বিক্রেতার মধ্যে সরাসরি লেনদেনের জন্য দায়বদ্ধ নয়।</li>
              <li><span className="font-semibold">বিরোধ নিষ্পত্তি:</span> যেকোনো বিরোধ পক্ষগুলির মধ্যে সমাধান করা হবে।</li>
            </ul>
          </div>

          {/* Section 6 */}
          <div>
            <h2 className="mb-3 font-bold text-ink">৬. গোপনীয়তা এবং ডেটা</h2>
            <ul className="list-inside space-y-2 list-disc ml-2">
              <li><span className="font-semibold">ডেটা সুরক্ষা:</span> আপনার ব্যক্তিগত তথ্য আমাদের গোপনীয়তা নীতি অনুযায়ী সুরক্ষিত।</li>
              <li><span className="font-semibold">তথ্য ভাগ করা:</span> আমরা আপনার তথ্য তৃতীয় পক্ষের সাথে শেয়ার করব না।</li>
            </ul>
          </div>

          {/* Section 7 */}
          <div>
            <h2 className="mb-3 font-bold text-ink">৭. অ্যাকাউন্ট স্থগিত এবং সমাপ্তি</h2>
            <ul className="list-inside space-y-2 list-disc ml-2">
              <li><span className="font-semibold">আচরণ নিয়মাবলী:</span> আমরা যেকোনো অনুচিত আচরণের জন্য অ্যাকাউন্ট স্থগিত করতে পারি।</li>
              <li><span className="font-semibold">জালিয়াতি:</span> জালিয়াতি সনাক্ত হলে তাৎক্ষণিক স্থগিত এবং আইনি ব্যবস্থা।</li>
            </ul>
          </div>

          {/* Section 8 */}
          <div>
            <h2 className="mb-3 font-bold text-ink">৮. পরিবর্তন এবং আপডেট</h2>
            <ul className="list-inside space-y-2 list-disc ml-2">
              <li><span className="font-semibold">নীতি পরিবর্তন:</span> আমরা যেকোনো সময় এই শর্তাবলী পরিবর্তন করার অধিকার সংরক্ষণ করি।</li>
              <li><span className="font-semibold">বিজ্ঞপ্তি:</span> গুরুত্বপূর্ণ পরিবর্তনগুলির জন্য আমরা আপনাকে বিজ্ঞপ্তি দেব।</li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <hr className="my-8 border-black/10" />

        {/* Agreement Checkbox */}
        <div className="mb-6">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={hasAgreed}
              onChange={(e) => setHasAgreed(e.target.checked)}
              className="mt-1 h-5 w-5 cursor-pointer rounded border border-black/20"
            />
            <span className="text-sm font-semibold text-ink">
              আমি সমস্ত ভেন্ডর শর্তাবলী সাবধানে পড়েছি এবং সম্মত হই।
            </span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={onDecline}
            className="flex-1 rounded-lg border border-black/20 bg-white/50 px-6 py-3 font-semibold text-ink hover:bg-black/5 transition-colors"
          >
            বাতিল করুন
          </button>
          <button
            onClick={onAccept}
            disabled={!hasAgreed}
            className="flex-1 rounded-lg bg-moss px-6 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 hover:opacity-90 transition-opacity"
          >
            সম্মত করুন এবং চালিয়ে যান
          </button>
        </div>
      </div>
    </div>
  );
}

