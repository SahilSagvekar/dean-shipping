'use client';

import React from 'react';

export default function IntroSection() {
  return (
    <section style={{
      backgroundColor: 'var(--primary-dark)',
      padding: '6rem 2rem',
    }}>
      <div style={{
        maxWidth: '1000px',
        margin: '0 auto',
        textAlign: 'center',
      }}>
        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '2.5rem',
          color: 'var(--text-light)',
          marginBottom: '2rem',
        }}>Serving The Bahamas Since 1951</h2>
        
        <div style={{
          width: '80px',
          height: '2px',
          backgroundColor: 'var(--accent-gold)',
          margin: '0 auto 2rem',
        }} />
        
        <p style={{
          fontSize: '1.15rem',
          color: 'var(--text-muted)',
          lineHeight: 2,
          maxWidth: '800px',
          margin: '0 auto',
        }}>
          We are a Bahamas-based company that specializes in mailboat services to North Abaco Bahamas. We also provide international aggregate chartering services across the globe. With our fleet of two large shipping vessels, we are equipped to meet the transportation needs of businesses and individuals across different industries.
        </p>
        
        <p style={{
          fontSize: '1rem',
          color: 'var(--accent-teal)',
          marginTop: '2rem',
          fontStyle: 'italic',
        }}>
          Over 70 years of experience in freight hauling throughout The Bahamas
        </p>
      </div>
    </section>
  );
}
