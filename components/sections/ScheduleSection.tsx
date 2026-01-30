'use client';

import React from 'react';
import { ScheduleItem } from '../ui';

export default function ScheduleSection() {
  return (
    <section id="schedule" style={{
      padding: '6rem 2rem',
      backgroundColor: 'var(--bg-section)',
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231B4D3E' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <p style={{
            color: 'var(--accent-gold)',
            textTransform: 'uppercase',
            letterSpacing: '3px',
            fontSize: '0.9rem',
            marginBottom: '1rem',
          }}>Plan Your Shipment</p>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '2.8rem',
            color: 'var(--primary-dark)',
          }}>Mailboat Schedule to Abaco</h2>
        </div>

        {/* Schedule Card */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          overflow: 'hidden',
        }}>
          {/* Nassau Header */}
          <div style={{
            backgroundColor: 'var(--primary-dark)',
            padding: '1.5rem 2rem',
            textAlign: 'center',
          }}>
            <h3 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '1.5rem',
              color: 'var(--text-light)',
            }}>NASSAU</h3>
          </div>

          <div style={{ padding: '2rem' }}>
            {/* Nassau Schedule */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '2rem',
              marginBottom: '2rem',
              paddingBottom: '2rem',
              borderBottom: '1px solid #eee',
            }}>
              <ScheduleItem day="Monday" time="8am – 3pm" detail="DRY FREIGHT DROP-OFF ONLY" />
              <ScheduleItem day="Tuesday" time="8am – 3pm" detail="ALL FREIGHT DROP-OFF" />
            </div>

            {/* Abaco Marsh Harbour */}
            <ScheduleHeader title="ABACO | Marsh Harbour" />
            <div style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid #eee' }}>
              <ScheduleItem day="Wednesday" time="10am – 4pm" detail="ALL FREIGHT FROM NASSAU" />
            </div>

            {/* Baker's Bay */}
            <ScheduleHeader title="ABACO | Baker's Bay" />
            <div style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid #eee' }}>
              <ScheduleItem day="Thursday" time="6am – 7am" detail="FREIGHT DROP-OFF & PICK-UP" />
            </div>

            {/* Green Turtle Cay */}
            <ScheduleHeader title="ABACO | Green Turtle Cay" />
            <div style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid #eee' }}>
              <ScheduleItem day="Thursday" time="9:30am – 11am" detail="FREIGHT DROP-OFF & PICK-UP" />
            </div>

            {/* Marsh Harbour Return */}
            <ScheduleHeader title="ABACO | Marsh Harbour" />
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '2rem',
              marginBottom: '2rem',
              paddingBottom: '2rem',
              borderBottom: '1px solid #eee',
            }}>
              <div>
                <p style={{ fontWeight: 600, color: 'var(--primary-dark)', marginBottom: '0.25rem' }}>Thursday</p>
                <p style={{ color: '#666' }}>PICK UP <span style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>9:00AM – 4:00PM</span></p>
              </div>
              <div>
                <p style={{ fontWeight: 600, color: 'var(--primary-dark)', marginBottom: '0.25rem' }}>Thursday</p>
                <p style={{ color: '#666' }}>DROP-OFF <span style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>9:00AM – 2:00PM</span></p>
              </div>
            </div>

            {/* Nassau Return */}
            <div style={{
              backgroundColor: 'var(--primary-dark)',
              padding: '1rem 1.5rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
            }}>
              <h4 style={{
                fontFamily: "'Playfair Display', serif",
                color: 'white',
                fontSize: '1.1rem',
              }}>NASSAU</h4>
            </div>
            <div>
              <p style={{ fontWeight: 600, color: 'var(--primary-dark)', marginBottom: '0.25rem' }}>Friday</p>
              <p style={{ color: '#666' }}>FREIGHT PICK-UP <span style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>8AM – 3PM</span></p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Schedule Header Sub-component
function ScheduleHeader({ title }: { title: string }) {
  return (
    <div style={{
      backgroundColor: 'var(--primary-light)',
      padding: '1rem 1.5rem',
      borderRadius: '8px',
      marginBottom: '1.5rem',
    }}>
      <h4 style={{
        fontFamily: "'Playfair Display', serif",
        color: 'white',
        fontSize: '1.1rem',
      }}>{title}</h4>
    </div>
  );
}
