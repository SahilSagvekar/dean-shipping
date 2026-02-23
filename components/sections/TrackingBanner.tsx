'use client';

import React from 'react';
import { PrimaryButton } from '../ui';
import Image1 from '../../app/assets/ammiel-j-wan-qX2ENCIxquA-unsplash.jpg';

export default function TrackingBanner() {
  return (
    <section
      className="relative py-16 md:py-24 px-4 md:px-8 bg-fixed bg-cover bg-center"
      style={{ backgroundImage: `url("${Image1.src}")` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-[var(--bg-dark-overlay)]" />

      {/* Content */}
      <div className="relative z-10 max-w-[800px] mx-auto text-center">
        <h2 className="font-['Playfair_Display'] text-3xl md:text-[2.5rem] text-[var(--text-light)] mb-6">
          Real-Time Tracking System
        </h2>

        <p className="text-base md:text-lg text-[var(--text-muted)] leading-relaxed md:leading-[1.9] mb-8 md:mb-10">
          We make tracking your parcels effortless. Our advanced real-time tracking system ensures you always know where your shipment is—from pickup to delivery. Whether it&apos;s local or global, small or oversized, our secure logistics network guarantees speed, reliability, and transparency.
        </p>

        <div className="inline-block transform transition-transform hover:scale-105 active:scale-95">
          <PrimaryButton variant="gold">
            Track Your Cargo
          </PrimaryButton>
        </div>
      </div>
    </section>
  );
}
