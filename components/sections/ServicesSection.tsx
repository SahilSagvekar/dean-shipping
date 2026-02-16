'use client';

import React from 'react';
import { ServiceItem, PrimaryButton } from '../ui';
import Image1 from '../../app/assets/william-william-NndKt2kF1L4-unsplash.jpg';
import Image2 from '../../app/assets/aron-yigin-lNpAmLA_bvQ-unsplash.jpg';
import Image3 from '../../app/assets/aron-yigin-lNpAmLA_bvQ-unsplash.jpg';

export default function ServicesSection() {
  return (
    <>
      {/* Main Services Section */}
      <section id="services" className="py-12 md:py-24 px-4 md:px-8 bg-[var(--bg-section)]">
        <div className="max-w-[1200px] mx-auto">
          {/* Section Header */}
          <div className="text-center mb-10 md:mb-16">
            <p className="text-[var(--accent-gold)] uppercase tracking-[3px] text-sm mb-4 font-semibold">What We Offer</p>
            <h2 className="font-['Playfair_Display'] text-3xl md:text-5xl text-[var(--primary-dark)]">Our Services</h2>
          </div>

          {/* Mailboat Services */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center mb-16 md:mb-24">
            <div className="order-2 md:order-1">
              <h3 className="font-['Playfair_Display'] text-2xl md:text-[2rem] text-[var(--primary-dark)] mb-6">Mailboat Shipping Services</h3>
              <p className="text-[#555] leading-relaxed mb-6">
                Our mailboat shipping services offer a reliable and affordable way to transport mail and packages throughout the Bahamas and other Caribbean islands. With a regular weekly schedule to North Abaco, we ensure timely delivery of your mail and packages to any destination within our network.
              </p>
              <p className="text-[#555] leading-relaxed">
                Dean&apos;s Shipping has over 70 years of experience, ensuring timely delivery of your mail and packages to any destination within our network. Our vessels are equipped with advanced technology and staffed by experienced professionals, ensuring that your shipments arrive safely and on time.
              </p>
              <div className="mt-10">
                <PrimaryButton>Learn More →</PrimaryButton>
              </div>
            </div>
            <div className="relative rounded-lg overflow-hidden shadow-2xl order-1 md:order-2">
              <img
                src={Image1.src}
                alt="Lighthouse and cargo ship"
                className="w-full h-64 md:h-[400px] object-cover focus-ring"
              />
              <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 bg-gradient-to-t from-[rgba(27,77,62,0.9)] to-transparent">
                <p className="text-white font-['Playfair_Display'] text-xl">Weekly Schedule to North Abaco</p>
              </div>
            </div>
          </div>

          {/* Aggregate Chartering */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div className="relative rounded-lg overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Cargo containers"
                className="w-full h-64 md:h-[400px] object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 bg-gradient-to-t from-[rgba(27,77,62,0.9)] to-transparent">
                <p className="text-white font-['Playfair_Display'] text-xl">M/V Champion III</p>
              </div>
            </div>
            <div>
              <h3 className="font-['Playfair_Display'] text-2xl md:text-[2rem] text-[var(--primary-dark)] mb-6">International Aggregate Chartering</h3>
              <p className="text-[#555] leading-relaxed mb-6">
                In addition to our mailboat shipping services, we also offer international aggregate chartering services. Our vessels specialize in transporting various types of aggregate materials, including sand, gravel, and crushed stone, to destinations around the world.
              </p>
              <p className="text-[#555] leading-relaxed">
                With our real-time monitoring and tracking capabilities, we provide reliable and efficient delivery of your cargo, ensuring that it arrives at its destination on time and in excellent condition.
              </p>
              <div className="mt-10">
                <PrimaryButton>Learn More →</PrimaryButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Include Section */}
      <section className="bg-[var(--primary-dark)] py-12 md:py-24 px-4 md:px-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center">
            <div>
              <h2 className="font-['Playfair_Display'] text-3xl md:text-[2.5rem] text-[var(--text-light)] mb-8">Our Services Include</h2>

              <div className="space-y-2">
                <ServiceItem
                  title="Private Shipments"
                  description="Safe and secure transportation of your private goods between islands and throughout the Caribbean."
                />
                <ServiceItem
                  title="Large Aggregate Shipping"
                  description="We specialize in handling large cargo like construction materials, machinery, and more, ensuring safe delivery to your destination."
                />
                <ServiceItem
                  title="Vehicle Shipments"
                  description="Transport your cars, trucks, and other vehicles with ease and reliability."
                />
                <ServiceItem
                  title="Charter Services"
                  description="Affordable charter services to Florida and the Northern Caribbean."
                />
              </div>
            </div>
            <div className="rounded-lg overflow-hidden shadow-2xl hidden md:block">
              <img
                src={Image3.src}
                alt="Captain at work"
                className="w-full h-[500px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
