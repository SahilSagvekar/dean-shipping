'use client';

import React from 'react';
import { ProfileCard } from '../ui';

export default function AboutSection() {
  const teamMembers = [
    {
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      name: "Ernest Dean Jr.",
      role: "Owner",
      description: "Ernest Dean Jr. was born on February 27, 1962 as the last child to Captain Ernest and Mrs. Eula Dean. Birthed into a family of seafarers, it was only natural that he too would be drawn to the call of the sea."
    },
    {
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      name: "Ernest Dean",
      role: "Founder",
      description: "The late, Captain Ernest Alexander Dean was born on May 23, 1915, in the quaint settlement of Sandy Point, Abaco, Bahamas. As the eldest son of a fishing smack captain, Ernest's introduction to the sea came very early on in life."
    }
  ];

  return (
    <section id="about" className="bg-[var(--primary-dark)] py-12 md:py-24 px-4 md:px-8">
      <div className="max-w-[1200px] mx-auto">
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-16">
          <p className="text-[var(--accent-gold)] uppercase tracking-[3px] text-sm mb-4 font-semibold">Our Legacy</p>
          <h2 className="font-['Playfair_Display'] text-3xl md:text-5xl text-[var(--text-light)]">Our Operations</h2>
        </div>

        {/* Description */}
        <p className="text-[var(--text-muted)] leading-relaxed max-w-[900px] mx-auto mb-12 md:mb-20 text-center text-lg">
          Dean&apos;s Shipping Company is owned and operated by Ernest Dean Jr. and their Family. The Dean name is synonymous with shipping throughout The Bahamas, with more than 70 years of experience in freight hauling. The M/V Champion III, is locally owned and operated, and licensed for aggregate services and for inter-island transport within The Bahamas.
        </p>

        {/* Team Members */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-[900px] mx-auto">
          {teamMembers.map((member, index) => (
            <ProfileCard key={index} {...member} />
          ))}
        </div>
      </div>
    </section>
  );
}
