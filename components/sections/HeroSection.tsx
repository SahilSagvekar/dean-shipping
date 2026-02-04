'use client';

import React from 'react';
import { ServiceIcon } from '../ui';
import heroImage from '@/app/assets/5116e4be081f83018c8edb2f7af47539cf88e4f0.png';

interface HeroSectionProps {
  isLoaded: boolean;
}

export default function HeroSection({ isLoaded }: HeroSectionProps) {
  return (
    <section id="home" style={{
      position: 'relative',
      height: '100vh',
      minHeight: '700px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    }}>
      {/* Background Image */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `url(${heroImage.src})`,
        // backgroundImage: 'url("https://images.unsplash.com/photo-1605281317010-fe5ffe798166?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'brightness(0.7)',
      }} />
      
      {/* Gradient Overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(180deg, rgba(27, 77, 62, 0.4) 0%, rgba(27, 77, 62, 0.7) 100%)',
      }} />
      
      {/* Content */}
      <div className={`fade-in ${isLoaded ? 'visible' : ''}`} style={{
        position: 'relative',
        zIndex: 10,
        textAlign: 'center',
        padding: '0 2rem',
      }}>
        <p style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '1.3rem',
          color: 'var(--accent-gold)',
          marginBottom: '1rem',
          fontStyle: 'italic',
          letterSpacing: '3px',
          // text-color: 'var(--accent-gold)',         
        }}>Welcome to</p>
        
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(3rem, 8vw, 6rem)',
          fontWeight: 700,
          color: 'var(--text-light)',
          lineHeight: 1.1,
          marginBottom: '2rem',
          textShadow: '2px 4px 20px rgba(0,0,0,0.3)',
        }}>
          Dean&apos;s Shipping Ltd.
        </h1>
        
        <p style={{
          fontSize: '1.2rem',
          color: 'var(--text-muted)',
          maxWidth: '600px',
          margin: '0 auto 3rem',
          lineHeight: 1.8,
        }}>
          Your trusted partner for mailboat services and international aggregate chartering across the Bahamas and Caribbean
        </p>
        
        {/* Service Icons */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '4rem',
          marginTop: '2rem',
        }}>
          <ServiceIcon icon="vehicle" label="Vehicle" delay="delay-2" isLoaded={isLoaded} />
          <ServiceIcon icon="cargo" label="Cargo" delay="delay-3" isLoaded={isLoaded} />
          <ServiceIcon icon="passenger" label="Passenger" delay="delay-4" isLoaded={isLoaded} />
        </div>
      </div>

      {/* Scroll Indicator */}
      <div style={{
        position: 'absolute',
        bottom: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        animation: 'bounce 2s infinite',
      }}>
        <svg width="30" height="50" viewBox="0 0 30 50" fill="none">
          <rect x="1" y="1" width="28" height="48" rx="14" stroke="rgba(255,255,255,0.5)" strokeWidth="2"/>
          <circle cx="15" cy="15" r="5" fill="var(--accent-gold)">
            <animate attributeName="cy" values="15;30;15" dur="2s" repeatCount="indefinite"/>
          </circle>
        </svg>
      </div>
    </section>
  );
}

