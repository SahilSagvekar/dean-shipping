'use client';

import React from 'react';

export default function IntroSection() {
  return (
    <section className="bg-[var(--primary-dark)] py-16 md:py-24 px-4 md:px-8">
      <div className="max-w-[1000px] mx-auto text-center">
        <h2 className="font-['Playfair_Display'] text-3xl md:text-[2.5rem] text-[var(--text-light)] mb-6 md:mb-8">
          Serving The Bahamas Since 1951
        </h2>

        <div className="w-16 md:w-20 h-[2px] bg-[var(--accent-gold)] mx-auto mb-6 md:mb-8" />

        <p className="text-base md:text-[1.15rem] color-[var(--text-muted)] leading-relaxed md:leading-[2] max-w-[800px] mx-auto">
          We are a Bahamas-based company that specializes in mailboat services to North Abaco Bahamas. We also provide international aggregate chartering services across the globe. With our fleet of two large shipping vessels, we are equipped to meet the transportation needs of businesses and individuals across different industries.
        </p>

        <p className="text-sm md:text-base text-[var(--accent-teal)] mt-8 md:mt-12 font-italic italic">
          Over 70 years of experience in freight hauling throughout The Bahamas
        </p>
      </div>
    </section>
  );
}
