'use client';

interface ReviewCardProps {
  author: string;
  location: string;
  rating: number;
  content: string;
  avatar?: string;
  initials?: string;
}

export function ReviewCard({
  author,
  location,
  rating,
  content,
  avatar,
  initials
}: ReviewCardProps) {
  return (
    <div className="glass-card rounded-[1.5rem] p-6 shadow-soft">
      <div className="mb-4">
        <p className="text-sm italic leading-7 text-slate-700">&quot;{content}&quot;</p>
      </div>

      <div className="mt-6 flex items-start gap-4 border-t border-white/20 pt-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-sky-300/60 to-sky-500/60 font-semibold text-white flex-shrink-0">
          {initials || author.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-slate-900">{author}</p>
          <p className="text-xs text-slate-600">{location}</p>
          <div className="mt-2 flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg
                key={i}
                className={`h-4 w-4 ${i < rating ? 'text-yellow-400' : 'text-yellow-200'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

