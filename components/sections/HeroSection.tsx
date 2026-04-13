'use client';

import React from 'react';
import { ServiceIcon } from '../ui';
import heroImage from '@/app/assets/5116e4be081f83018c8edb2f7af47539cf88e4f0.png';

interface HeroSectionProps {
  isLoaded: boolean;
}

export default function HeroSection({ isLoaded }: HeroSectionProps) {
  return (
    <section 
      id="home" 
      className="relative h-screen min-h-[500px] md:min-h-[700px] flex items-center justify-center overflow-hidden"
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center brightness-[0.7]"
        style={{ backgroundImage: `url(${heroImage.src})` }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[rgba(27,77,62,0.4)] to-[rgba(27,77,62,0.7)]" />

      {/* Content */}
      <div className={`fade-in ${isLoaded ? 'visible' : ''} relative z-10 text-center px-4 md:px-8`}>
        <p className="font-['Playfair_Display'] text-base md:text-xl text-[var(--accent-gold)] mb-2 md:mb-4 italic tracking-[3px]">
          Welcome to
        </p>

        <h1 className="font-['Playfair_Display'] text-[2.5rem] md:text-[clamp(3rem,8vw,6rem)] font-bold text-[var(--text-light)] leading-[1.1] mb-4 md:mb-8 drop-shadow-[2px_4px_20px_rgba(0,0,0,0.3)]">
          Dean&apos;s Shipping Ltd.
        </h1>

        <p className="text-sm md:text-lg text-[var(--text-muted)] max-w-[600px] mx-auto mb-6 md:mb-12 leading-relaxed md:leading-[1.8] px-2">
          Your trusted partner for mailboat services and international aggregate chartering across the Bahamas and Caribbean
        </p>

        {/* Service Icons */}
        <div className="flex flex-row justify-center gap-6 md:gap-16 mt-4 md:mt-8">
          <ServiceIcon icon="vehicle" label="Vehicle" delay="delay-2" isLoaded={isLoaded} />
          <ServiceIcon icon="cargo" label="Cargo" delay="delay-3" isLoaded={isLoaded} />
          <ServiceIcon icon="passenger" label="Passenger" delay="delay-4" isLoaded={isLoaded} />
        </div>
      </div>

      {/* Scroll Indicator - hidden on mobile */}
      <div className="hidden md:block absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg width="30" height="50" viewBox="0 0 30 50" fill="none">
          <rect x="1" y="1" width="28" height="48" rx="14" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
          <circle cx="15" cy="15" r="5" fill="var(--accent-gold)">
            <animate attributeName="cy" values="15;30;15" dur="2s" repeatCount="indefinite" />
          </circle>
        </svg>
      </div>
    </section>
  );
}