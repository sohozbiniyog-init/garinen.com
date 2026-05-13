"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Profile = {
  id?: string;
  email?: string | null;
  vendorApprovalStatus?: string | null;
  vendorInfo?: Record<string, unknown> | null;
  vendorOnboardingCreatedAt?: string | null;
};

export default function PendingVendorDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) throw new Error('Unauthorized');
        const json = await res.json();
        if (mounted) setProfile(json.profile || null);
      } catch (err) {
        console.error('Failed to load profile for pending dashboard', err);
        // If unauthorized, send to login
        router.replace('/login');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="text-center text-slate-300">লোড হচ্ছে…</div>
      </div>
    );
  }

  const hasSubmitted = Boolean(profile?.vendorInfo);

  return (
    <div className="min-h-screen py-12 bg-gradient-to-b from-slate-950 to-slate-900">
      <div className="max-w-3xl mx-auto px-4">
        <div className="glass-card p-6">
          <h1 className="text-2xl font-semibold text-black">ভেন্ডর ড্যাশবোর্ড — Pending</h1>
          <p className="mt-2 text-sm text-black">আপনার ভেন্ডর অ্যাকাউন্ট সম্পূর্ণ হয়নি; ভেন্ডর ক্ষমতা অস্থায়ীভাবে অকার্যকর রয়েছে।</p>

          <div className="mt-6 space-y-4">
            <div className="p-4 rounded-md bg-white/5">
              <h3 className="font-medium text-black">আপনি কী করতে পারবেন</h3>
              <ul className="mt-2 list-disc pl-5 text-sm text-black">
                <li>লিস্টিংগুলো ব্রাউজ ও দেখুন (রিড-অনলি)</li>
                <li>বুকিং ও লেনদেন শুরু করা এখন বন্ধ থাকবে</li>
                <li>ভেন্ডর-নির্দিষ্ট অপশনগুলো ডিসেবল হয়ে থাকবে</li>
              </ul>
            </div>

            <div className="p-4 rounded-md bg-white/5">
              {hasSubmitted ? (
                <div className="space-y-2">
                  <p className="text-sm text-black">আপনি ইতিমধ্যেই অনবোর্ডিং জমা দিয়েছেন। আমাদের টিম যাচাই করছে।</p>
                  <button disabled className="w-full py-2 bg-white/5 text-black rounded-md">জমা হয়েছে — যাচাই চলছে</button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-black">অনবোর্ডিং পূরণ করে সাবমিশন করুন যাতে আমরা আপনার দোকান যাচাই করতে পারি।</p>
                  <button
                    onClick={() => router.push('/vendor/onboarding')}
                    className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-black rounded-md"
                  >
                    অনবোর্ডিং সম্পূর্ণ করুন
                  </button>
                </div>
              )}
            </div>

            <div className="text-sm text-black">
              <p>আপডেট বা অনুমোদন হলে আপনার ড্যাশবোর্ড স্বাভাবিকভাবে সক্রিয় হবে। কোনো সমস্যা হলে প্রশাসকের সাথে যোগাযোগ করুন।</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
