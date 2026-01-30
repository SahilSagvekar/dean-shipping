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
    <section id="about" style={{
      backgroundColor: 'var(--primary-dark)',
      padding: '6rem 2rem',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <p style={{
            color: 'var(--accent-gold)',
            textTransform: 'uppercase',
            letterSpacing: '3px',
            fontSize: '0.9rem',
            marginBottom: '1rem',
          }}>Our Legacy</p>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '2.8rem',
            color: 'var(--text-light)',
          }}>Our Operations</h2>
        </div>

        {/* Description */}
        <p style={{
          color: 'var(--text-muted)',
          lineHeight: 2,
          maxWidth: '900px',
          margin: '0 auto 4rem',
          textAlign: 'center',
          fontSize: '1.1rem',
        }}>
          Dean&apos;s Shipping Company is owned and operated by Ernest Dean Jr. and their Family. The Dean name is synonymous with shipping throughout The Bahamas, with more than 70 years of experience in freight hauling. The M/V Champion III, is locally owned and operated, and licensed for aggregate services and for inter-island transport within The Bahamas.
        </p>

        {/* Team Members */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '3rem',
          maxWidth: '900px',
          margin: '0 auto',
        }}>
          {teamMembers.map((member, index) => (
            <ProfileCard key={index} {...member} />
          ))}
        </div>
      </div>
    </section>
  );
}
