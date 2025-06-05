'use client';

import { useState, useEffect } from 'react';
import { BlurFade } from '@/components/ui/potatix/blur-fade';

// Fake testimonial data because marketing said we need "social proof"
const testimonials = [
  {
    quote: "Potatix is the easiest way for developers to share their knowledge and earn money without subscription fees.",
    author: "John Developer",
    role: "Made $25,000 last month",
    initials: "JD"
  },
  {
    quote: "I was able to quit my job after just 2 months of selling my Docker course on Potatix.",
    author: "Sarah Smith",
    role: "Ex-Google Engineer",
    initials: "SS"
  },
  {
    quote: "The zero subscription fee model is what made me switch from other platforms. I keep more of my earnings.",
    author: "Mike Johnson",
    role: "AWS Certified Instructor",
    initials: "MJ"
  },
  {
    quote: "Creating courses was easy, but getting paid was hard. Potatix solved both problems for me.",
    author: "Anna Chen",
    role: "Frontend Specialist",
    initials: "AC"
  },
  {
    quote: "My Python tutorial made $18K in its first week. I've never seen conversion rates like this before.",
    author: "David Kumar",
    role: "AI Researcher",
    initials: "DK"
  }
];

export default function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
        setIsVisible(true);
      }, 300); // Wait for fade out before changing
      
    }, 5000); // Change every 5 seconds
    
    return () => clearInterval(interval);
  }, []);

  const testimonial = testimonials[currentIndex];

  return (
    <BlurFade key={currentIndex} className="max-w-md mx-auto text-center" inView={isVisible}>
      <svg className="w-10 h-10 mx-auto mb-4 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
      </svg>
      
      <blockquote className="text-2xl font-medium mb-4">
        &ldquo;{testimonial.quote}&rdquo;
      </blockquote>
      
      <div className="flex items-center justify-center">
        <div className="flex-shrink-0 mr-3">
          <div className="w-12 h-12 rounded-full bg-emerald-700 flex items-center justify-center">
            <span className="font-bold text-xl">{testimonial.initials}</span>
          </div>
        </div>
        <div className="text-left">
          <p className="font-semibold">{testimonial.author}</p>
          <p className="text-emerald-300 text-sm">{testimonial.role}</p>
        </div>
      </div>
    </BlurFade>
  );
} 