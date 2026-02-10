'use client';

import { useEffect, useState } from 'react';
import {
  HeroSection,
  IntroSection,
  ServicesSection,
  ScheduleSection,
  AboutSection,
  TrackingBanner,
} from '@/components/sections';

export default function HomePage() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fff' }}>
      {/* Main Content Sections */}
      <main>
        <HeroSection isLoaded={isLoaded} />
        <IntroSection />
        <ServicesSection />
        <ScheduleSection />
        <AboutSection />
        <TrackingBanner />
      </main>
    </div>
  );
}
