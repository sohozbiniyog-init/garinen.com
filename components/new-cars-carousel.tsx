'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface CarouselCar {
  id: string;
  brand?: string;
  model?: string;
  year?: number;
  price?: number;
  shop?: string;
  redirectTo?: string; // optional link target (e.g. '/listings?brand=BMW')
  image?: string;
}

interface NewCarsCarouselProps {
  cars: CarouselCar[];
}

export default function NewCarsCarousel({ cars }: NewCarsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  useEffect(() => {
    if (!isAutoPlay || cars.length === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % cars.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [isAutoPlay, cars.length]);

  // Detect swipe direction
  useEffect(() => {
    if (touchStart === null || touchEnd === null) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50; // swipe left = go next
    const isRightSwipe = distance < -50; // swipe right = go previous
    
    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }
    
    // Reset touch states
    setTouchStart(null);
    setTouchEnd(null);
  }, [touchStart, touchEnd]);

  const goToPrevious = () => {
    setIsAutoPlay(false);
    setCurrentIndex((prev) => (prev - 1 + cars.length) % cars.length);
  };

  const goToNext = () => {
    setIsAutoPlay(false);
    setCurrentIndex((prev) => (prev + 1) % cars.length);
  };

  const goToSlide = (index: number) => {
    setIsAutoPlay(false);
    setCurrentIndex(index);
  };

  const handleClickCurrent = () => {
    const current = cars[currentIndex];
    if (!current) return;
    if (current.redirectTo) {
      if (typeof window !== 'undefined') window.location.href = String(current.redirectTo);
    } else if (current.brand) {
      // default redirect to brand-filtered listings
      if (typeof window !== 'undefined') window.location.href = `/listings?brand=${encodeURIComponent(current.brand)}`;
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setIsAutoPlay(false);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setTouchEnd(e.changedTouches[0].clientX);
    setIsAutoPlay(true);
  };

  if (cars.length === 0) {
    return (
      <div className="w-full h-96 bg-gradient-to-br from-sand/30 to-sand/10 rounded-[2rem] flex items-center justify-center">
        <p className="text-smoke">No featured cars available</p>
      </div>
    );
  }

  const current = cars[currentIndex];

  return (
    <div className="relative w-full h-full overflow-hidden" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      {/* Slide area fills parent; parent controls hero height */}
      <div className="relative h-full w-full">
        {/* Current Slide Image */}
        <div className="absolute inset-0">
          {current.image ? (
            <Image
              src={current.image}
              alt={`${current.brand ?? ''} ${current.model ?? ''}`}
              fill
              className="object-fit object-center lg:object-right transition-transform duration-700 hover:scale-105"
              priority
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-sand/40 via-white/20 to-sand/30 flex items-center justify-center">
              <div className="text-center text-smoke">
                <p className="text-lg font-semibold">{current.brand} {current.model}</p>
                <p className="text-3xl font-black text-ink mt-2">৳ {current.price?.toLocaleString()}</p>
              </div>
            </div>
          )}

          {/* Clickable overlay to navigate */}
          <button
            onClick={handleClickCurrent}
            onMouseEnter={() => setIsAutoPlay(false)}
            onMouseLeave={() => setIsAutoPlay(true)}
            className="absolute inset-0 w-full h-full bg-transparent cursor-pointer focus:outline-none focus:ring-4 focus:ring-moss/50"
            aria-label={`Open ${current.brand ?? 'listing'}`}
          />

          {/* Car info overlay bottom (optional) */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6 text-white hidden md:block">
            <h3 className="text-2xl font-bold">{current.brand} {current.model} {current.year}</h3>
            <p className="text-sm text-white/80 mt-1">by {current.shop}</p>
          </div>
        </div>
      </div>

      {/* Pagination Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex justify-center gap-2">
        {cars.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition focus:outline-none focus:ring-2 focus:ring-moss ${index === currentIndex ? 'bg-moss w-8' : 'bg-black/20 w-2 hover:bg-black/40'}`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
