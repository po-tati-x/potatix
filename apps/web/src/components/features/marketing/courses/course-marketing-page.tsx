'use client';

import type { Course } from '@/lib/shared/types/courses';
import { HeroSection } from './hero-section';
import { InstructorSpotlight } from './instructor-spotlight';
import { CurriculumPreview } from './curriculum-preview';
import { PricingSection } from './pricing-section';
import { FAQSection } from './faq-section';
import { CourseStats } from './course-stats';
import { FloatingEnrollBar } from './floating-enroll-bar';
import { useState, useEffect, useRef } from 'react';
import { Section } from '@/components/ui/section';
import Modal from '@/components/ui/Modal';
import LoginScreen from '@/components/features/auth/login-screen';
import { WhatYoullLearn } from './what-youll-learn';
import { Prerequisites } from './prerequisites';

interface CourseMarketingPageProps {
  course: Course;
  isLoggedIn: boolean;
}

export function CourseMarketingPage({ course, isLoggedIn }: CourseMarketingPageProps) {
  const [isFloatingBarVisible, setFloatingBarVisible] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  // Sentinel element used by IntersectionObserver to detect when we scroll past the hero
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Toggle floating bar using an IntersectionObserver instead of manual scroll math
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setFloatingBarVisible(entry ? !entry.isIntersecting : false),
      { threshold: 0.1, rootMargin: '-100px 0px 0px 0px' },
    );

    const sentinel = sentinelRef.current;
    if (sentinel) observer.observe(sentinel);

    return () => observer.disconnect();
  }, []);

  const handleEnroll = async () => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }

    setIsEnrolling(true);
    try {
      const response = await fetch(`/api/courses/${course.id}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        window.location.href = `/viewer/${course.slug}`;
      } else {
        // TODO: Show error toast
        console.error('Enrollment failed');
      }
    } catch (error) {
      console.error('Enrollment error:', error);
    } finally {
      setIsEnrolling(false);
    }
  };

  return (
    <>
      {/* Hero section with video preview */}
      <div id="hero-section" className="relative">
        <HeroSection
          course={course}
          isLoggedIn={isLoggedIn}
          onEnroll={handleEnroll}
          isEnrolling={isEnrolling}
        />
        {/* Invisible sentinel used by IntersectionObserver */}
        <div ref={sentinelRef} className="h-px w-full absolute bottom-0" aria-hidden />
      </div>

      <Section bg="white" className="border-y border-slate-200">
        <CourseStats course={course} />
      </Section>

      {/* Learning outcomes */}
      <WhatYoullLearn course={course} />

      {/* Prerequisites */}
      <Prerequisites course={course} />

      {/* Instructor */}
      <InstructorSpotlight courseId={course.id} />
          
      <PricingSection
        course={course}
        isLoggedIn={isLoggedIn}
        onEnroll={handleEnroll}
        isEnrolling={isEnrolling}
      />

      {/* Floating enrollment bar */}
      <FloatingEnrollBar
        course={course}
        isVisible={isFloatingBarVisible}
        isLoggedIn={isLoggedIn}
        onEnroll={handleEnroll}
        isEnrolling={isEnrolling}
      />

      {/* Curriculum – full-width slate section */}
      <CurriculumPreview course={course} />

      {/* FAQ – full-width slate section */}
      <FAQSection courseId={course.id} />

      {showAuthModal && (
        <Modal size="md" onClose={() => setShowAuthModal(false)}>
          <div className="p-6">
            <LoginScreen defaultCallbackUrl={`/viewer/${course.slug}`} />
          </div>
        </Modal>
      )}
    </>
  );
}
