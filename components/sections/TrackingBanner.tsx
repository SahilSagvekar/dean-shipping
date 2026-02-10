'use client';

import React from 'react';
import { PrimaryButton } from '../ui';
import Image1 from '../../app/assets/ammiel-j-wan-qX2ENCIxquA-unsplash.jpg';

export default function TrackingBanner() {
  return (
    <section style={{
      position: 'relative',
      padding: '5rem 2rem',
      backgroundImage: `url("${Image1.src}")`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
    }}>
      {/* Overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'var(--bg-dark-overlay)',
      }} />
      
      {/* Content */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        maxWidth: '800px',
        margin: '0 auto',
        textAlign: 'center',
      }}>
        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '2.5rem',
          color: 'var(--text-light)',
          marginBottom: '1.5rem', 
        }}>Real-Time Tracking System</h2>
        
        <p style={{
          color: 'var(--text-muted)',
          lineHeight: 1.9,
          marginBottom: '2rem',
        }}>
          We make tracking your parcels effortless. Our advanced real-time tracking system ensures you always know where your shipment is—from pickup to delivery. Whether it&apos;s local or global, small or oversized, our secure logistics network guarantees speed, reliability, and transparency.
        </p>
        
        <PrimaryButton variant="gold">
          Track Your Cargo
        </PrimaryButton>
      </div>
    </section>
  );
}
