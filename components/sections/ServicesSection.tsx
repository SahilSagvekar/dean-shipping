'use client';

import React from 'react';
import { ServiceItem, PrimaryButton } from '../ui';

export default function ServicesSection() {
  return (
    <>
      {/* Main Services Section */}
      <section id="services" style={{
        padding: '6rem 2rem',
        backgroundColor: 'var(--bg-section)',
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
            }}>What We Offer</p>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '2.8rem',
              color: 'var(--primary-dark)',
            }}>Our Services</h2>
          </div>

          {/* Mailboat Services */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '4rem',
            alignItems: 'center',
            marginBottom: '6rem',
          }}>
            <div>
              <h3 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '2rem',
                color: 'var(--primary-dark)',
                marginBottom: '1.5rem',
              }}>Mailboat Shipping Services</h3>
              <p style={{
                color: '#555',
                lineHeight: 1.9,
                marginBottom: '1.5rem',
              }}>
                Our mailboat shipping services offer a reliable and affordable way to transport mail and packages throughout the Bahamas and other Caribbean islands. With a regular weekly schedule to North Abaco, we ensure timely delivery of your mail and packages to any destination within our network.
              </p>
              <p style={{
                color: '#555',
                lineHeight: 1.9,
              }}>
                Dean&apos;s Shipping has over 70 years of experience, ensuring timely delivery of your mail and packages to any destination within our network. Our vessels are equipped with advanced technology and staffed by experienced professionals, ensuring that your shipments arrive safely and on time.
              </p>
              <div style={{ marginTop: '2rem' }}>
                <PrimaryButton>Learn More →</PrimaryButton>
              </div>
            </div>
            <div style={{
              position: 'relative',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            }}>
              <img 
                src="https://images.unsplash.com/photo-1494412651409-8963ce7935a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Lighthouse and cargo ship"
                style={{ width: '100%', height: '400px', objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '2rem',
                background: 'linear-gradient(transparent, rgba(27, 77, 62, 0.9))',
              }}>
                <p style={{
                  color: 'var(--accent-gold)',
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '1.2rem',
                }}>Weekly Schedule to North Abaco</p>
              </div>
            </div>
          </div>

          {/* Aggregate Chartering */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '4rem',
            alignItems: 'center',
          }}>
            <div style={{
              position: 'relative',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            }}>
              <img 
                src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Cargo containers"
                style={{ width: '100%', height: '400px', objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '2rem',
                background: 'linear-gradient(transparent, rgba(27, 77, 62, 0.9))',
              }}>
                <p style={{
                  color: 'var(--accent-gold)',
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '1.2rem',
                }}>M/V Champion III</p>
              </div>
            </div>
            <div>
              <h3 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '2rem',
                color: 'var(--primary-dark)',
                marginBottom: '1.5rem',
              }}>International Aggregate Chartering</h3>
              <p style={{
                color: '#555',
                lineHeight: 1.9,
                marginBottom: '1.5rem',
              }}>
                In addition to our mailboat shipping services, we also offer international aggregate chartering services. Our vessels specialize in transporting various types of aggregate materials, including sand, gravel, and crushed stone, to destinations around the world.
              </p>
              <p style={{
                color: '#555',
                lineHeight: 1.9,
              }}>
                With our real-time monitoring and tracking capabilities, we provide reliable and efficient delivery of your cargo, ensuring that it arrives at its destination on time and in excellent condition.
              </p>
              <div style={{ marginTop: '2rem' }}>
                <PrimaryButton>Learn More →</PrimaryButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Include Section */}
      <section style={{
        backgroundColor: 'var(--primary-dark)',
        padding: '6rem 2rem',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '4rem',
            alignItems: 'center',
          }}>
            <div>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '2.5rem',
                color: 'var(--text-light)',
                marginBottom: '2rem',
              }}>Our Services Include</h2>
              
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
            <div style={{
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)',
            }}>
              <img 
                src="https://images.unsplash.com/photo-1520334363269-c1fd85a51764?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Captain at work"
                style={{ width: '100%', height: '500px', objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
