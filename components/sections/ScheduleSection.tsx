'use client';

import React from 'react';
import { ScheduleItem } from '../ui';

export default function ScheduleSection() {
  return (
    <section id="schedule" className="py-12 md:py-24 px-4 md:px-8 bg-[var(--bg-section)]" style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231B4D3E' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
    }}>
      <div className="max-w-[900px] mx-auto">
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-16">
          <p className="text-[var(--accent-gold)] uppercase tracking-[3px] text-sm mb-4 font-semibold">Plan Your Shipment</p>
          <h2 className="font-['Playfair_Display'] text-3xl md:text-5xl text-[var(--primary-dark)]">Mailboat Schedule to Abaco</h2>
        </div>

        {/* Schedule Card */}
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100">
          {/* Nassau Header */}
          <div className="bg-[var(--primary-dark)] py-6 px-8 text-center">
            <h3 className="font-['Playfair_Display'] text-2xl text-[var(--text-light)]">NASSAU</h3>
          </div>

          <div className="p-6 md:p-10">
            {/* Nassau Schedule */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8 pb-8 border-b border-gray-100">
              <ScheduleItem day="Monday" time="8am – 3pm" detail="DRY FREIGHT DROP-OFF ONLY" />
              <ScheduleItem day="Tuesday" time="8am – 3pm" detail="ALL FREIGHT DROP-OFF" />
            </div>

            {/* Abaco Marsh Harbour */}
            <ScheduleHeader title="ABACO | Marsh Harbour" />
            <div className="mb-8 pb-8 border-b border-gray-100">
              <ScheduleItem day="Wednesday" time="10am – 4pm" detail="ALL FREIGHT FROM NASSAU" />
            </div>

            {/* Baker's Bay */}
            <ScheduleHeader title="ABACO | Baker's Bay" />
            <div className="mb-8 pb-8 border-b border-gray-100">
              <ScheduleItem day="Thursday" time="6am – 7am" detail="FREIGHT DROP-OFF & PICK-UP" />
            </div>

            {/* Green Turtle Cay */}
            <ScheduleHeader title="ABACO | Green Turtle Cay" />
            <div className="mb-8 pb-8 border-b border-gray-100">
              <ScheduleItem day="Thursday" time="9:30am – 11am" detail="FREIGHT DROP-OFF & PICK-UP" />
            </div>

            {/* Marsh Harbour Return */}
            <ScheduleHeader title="ABACO | Marsh Harbour" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8 pb-8 border-b border-gray-100">
              <div>
                <p className="font-bold text-[var(--primary-dark)] text-lg mb-1">Thursday</p>
                <p className="text-gray-600">PICK UP <span className="text-[var(--accent-gold)] font-bold">9:00AM – 4:00PM</span></p>
              </div>
              <div>
                <p className="font-bold text-[var(--primary-dark)] text-lg mb-1">Thursday</p>
                <p className="text-gray-600">DROP-OFF <span className="text-[var(--accent-gold)] font-bold">9:00AM – 2:00PM</span></p>
              </div>
            </div>

            {/* Nassau Return */}
            <div className="bg-[var(--primary-dark)] py-4 px-6 rounded-lg mb-6">
              <h4 className="font-['Playfair_Display'] text-white text-lg">NASSAU</h4>
            </div>
            <div>
              <p className="font-bold text-[var(--primary-dark)] text-lg mb-1">Friday</p>
              <p className="text-gray-600">FREIGHT PICK-UP <span className="text-[var(--accent-gold)] font-bold">8AM – 3PM</span></p>
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
