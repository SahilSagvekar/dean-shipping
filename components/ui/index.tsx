'use client';

import React from 'react';

// Navigation Link Component
export function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a 
      href={href}
      style={{
        color: 'var(--text-light)',
        textDecoration: 'none',
        fontSize: '0.9rem',
        fontWeight: 500,
        letterSpacing: '0.5px',
        transition: 'color 0.3s ease',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = 'var(--accent-gold)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = 'var(--text-light)';
      }}
    >
      {children}
    </a>
  );
}

// Social Icon for Header
export function SocialIcon({ icon }: { icon: string }) {
  return (
    <div 
      style={{
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        border: '1px solid rgba(255,255,255,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        fontSize: '0.8rem',
        color: 'white',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--accent-gold)';
        e.currentTarget.style.color = 'var(--accent-gold)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
        e.currentTarget.style.color = 'white';
      }}
    >
      {icon === 'facebook' ? 'f' : '○'}
    </div>
  );
}

// Social Icon for Footer
export function SocialIconFooter({ icon }: { icon: string }) {
  return (
    <div 
      style={{
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        backgroundColor: 'rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        color: 'white',
        fontSize: '0.85rem',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--accent-gold)';
        e.currentTarget.style.color = 'var(--primary-dark)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
        e.currentTarget.style.color = 'white';
      }}
    >
      {icon[0].toUpperCase()}
    </div>
  );
}

// Footer Link Component
export function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a 
      href={href}
      style={{
        color: 'var(--text-muted)',
        textDecoration: 'none',
        fontSize: '0.9rem',
        transition: 'color 0.3s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = 'var(--accent-gold)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = 'var(--text-muted)';
      }}
    >
      {children}
    </a>
  );
}

// Service Icon for Hero Section
export function ServiceIcon({ 
  icon, 
  label, 
  delay, 
  isLoaded 
}: { 
  icon: string; 
  label: string; 
  delay: string; 
  isLoaded: boolean 
}) {
  const iconSvgs: Record<string, React.ReactNode> = {
    vehicle: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="1" y="3" width="15" height="13" rx="2"/>
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
        <circle cx="5.5" cy="18.5" r="2.5"/>
        <circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    ),
    cargo: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
        <line x1="12" y1="22.08" x2="12" y2="12"/>
      </svg>
    ),
    passenger: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  };

  return (
    <div 
      className={`fade-in ${delay} ${isLoaded ? 'visible' : ''}`} 
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
        cursor: 'pointer',
        transition: 'transform 0.3s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-5px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div style={{
        width: '90px',
        height: '90px',
        borderRadius: '50%',
        border: '2px solid rgba(255,255,255,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        transition: 'all 0.3s ease',
        backgroundColor: 'rgba(255,255,255,0.05)',
      }}>
        {iconSvgs[icon]}
      </div>
      <span style={{
        color: 'var(--text-light)',
        fontSize: '0.95rem',
        fontWeight: 500,
        letterSpacing: '1px',
        textTransform: 'uppercase',
      }}>{label}</span>
    </div>
  );
}

// Service Item for Services Section
export function ServiceItem({ title, description }: { title: string; description: string }) {
  return (
    <div style={{
      marginBottom: '2rem',
      paddingLeft: '1.5rem',
      borderLeft: '3px solid var(--accent-gold)',
    }}>
      <h4 style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: '1.2rem',
        color: 'var(--text-light)',
        marginBottom: '0.5rem',
      }}>{title}</h4>
      <p style={{
        color: 'var(--text-muted)',
        fontSize: '0.95rem',
        lineHeight: 1.7,
      }}>{description}</p>
    </div>
  );
}

// Schedule Item
export function ScheduleItem({ day, time, detail }: { day: string; time: string; detail: string }) {
  return (
    <div>
      <p style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: '1.2rem',
        color: 'var(--primary-dark)',
        marginBottom: '0.25rem',
      }}>{day} <span style={{ fontWeight: 400, color: 'var(--accent-gold)' }}>{time}</span></p>
      <p style={{
        color: '#888',
        fontSize: '0.85rem',
        textTransform: 'uppercase',
        letterSpacing: '1px',
      }}>{detail}</p>
    </div>
  );
}

// Profile Card for About Section
export function ProfileCard({ 
  image, 
  name, 
  role, 
  description 
}: { 
  image: string; 
  name: string; 
  role: string; 
  description: string 
}) {
  return (
    <div 
      style={{
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: '12px',
        padding: '2rem',
        textAlign: 'center',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        margin: '0 auto 1.5rem',
        overflow: 'hidden',
        border: '3px solid var(--accent-gold)',
      }}>
        <img 
          src={image}
          alt={name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
      <h3 style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: '1.4rem',
        color: 'var(--text-light)',
        marginBottom: '0.25rem',
      }}>{name}</h3>
      <p style={{
        color: 'var(--accent-gold)',
        fontSize: '0.9rem',
        marginBottom: '1rem',
        fontWeight: 500,
      }}>{role}</p>
      <p style={{
        color: 'var(--text-muted)',
        fontSize: '0.9rem',
        lineHeight: 1.7,
      }}>{description}</p>
      <a href="#" style={{
        display: 'inline-block',
        marginTop: '1rem',
        color: 'var(--accent-gold)',
        textDecoration: 'none',
        fontSize: '0.9rem',
        fontWeight: 500,
      }}>Learn More...</a>
    </div>
  );
}

// Primary Button
export function PrimaryButton({ 
  children, 
  onClick,
  variant = 'filled'
}: { 
  children: React.ReactNode; 
  onClick?: () => void;
  variant?: 'filled' | 'outline' | 'gold'
}) {
  const baseStyles: React.CSSProperties = {
    padding: variant === 'outline' ? '0.6rem 1.5rem' : '1rem 2rem',
    fontFamily: "'Source Sans 3', sans-serif",
    fontSize: variant === 'outline' ? '0.85rem' : '0.9rem',
    fontWeight: variant === 'gold' ? 700 : 600,
    letterSpacing: '1px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    border: 'none',
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    filled: {
      backgroundColor: 'var(--primary-dark)',
      color: 'white',
    },
    outline: {
      backgroundColor: 'transparent',
      border: '1.5px solid var(--accent-gold)',
      color: 'var(--accent-gold)',
      textTransform: 'uppercase',
    },
    gold: {
      backgroundColor: 'var(--accent-gold)',
      color: 'var(--primary-dark)',
    },
  };

  return (
    <button
      style={{ ...baseStyles, ...variantStyles[variant] }}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (variant === 'filled') {
          e.currentTarget.style.backgroundColor = 'var(--primary-light)';
        } else if (variant === 'outline') {
          e.currentTarget.style.backgroundColor = 'var(--accent-gold)';
          e.currentTarget.style.color = 'var(--primary-dark)';
        } else if (variant === 'gold') {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 10px 30px rgba(201, 169, 97, 0.3)';
        }
      }}
      onMouseLeave={(e) => {
        if (variant === 'filled') {
          e.currentTarget.style.backgroundColor = 'var(--primary-dark)';
        } else if (variant === 'outline') {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = 'var(--accent-gold)';
        } else if (variant === 'gold') {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
    >
      {children}
    </button>
  );
}
