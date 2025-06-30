'use client';

import { Clock, PlayCircle, BookOpen, Award } from 'lucide-react';
import type { Course } from '@/lib/shared/types/courses';
import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';

interface CourseStatsProps {
  course: Course;
  /** Toggle counter animation. Default: true */
  animate?: boolean;
}

// ───────────────────────────────────────────────────────────────────────────────
// Hook – detect when element enters viewport
// ───────────────────────────────────────────────────────────────────────────────
function useInViewport<T extends HTMLElement>(offset = '0px') {
  const ref = useRef<T | null>(null);
  const [isInView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting) {
          setInView(true);
          observer.disconnect(); // fire once
        }
      },
      { rootMargin: offset },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [offset]);

  return { ref, isInView } as const;
}

// ───────────────────────────────────────────────────────────────────────────────
// Hook – smooth count up
// ───────────────────────────────────────────────────────────────────────────────
function useAnimatedNumber(target: number, shouldStart: boolean, duration = 0.6) {
  const motionVal = useMotionValue(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const unsubscribe = motionVal.on('change', v => setDisplay(Math.floor(v)));
    return unsubscribe;
  }, [motionVal]);

  useEffect(() => {
    if (!shouldStart) return;
    const controls = animate(motionVal, target, {
      duration,
      ease: [0.16, 1, 0.3, 1], // springy curve
    });
    return controls.stop;
  }, [shouldStart, target, duration, motionVal]);

  return display;
}

export function CourseStats({ course, animate = true }: CourseStatsProps) {
  const { ref, isInView } = useInViewport<HTMLDivElement>('0px');
  const moduleCount = course.modules?.length ?? 0;
  const lessonCount = course.lessons?.length ?? 0;
  const totalSeconds = course.lessons?.reduce((acc, l) => acc + (l.duration ?? 0), 0) ?? 0;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const durationLabel = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}min`;

  const animatedModules = useAnimatedNumber(moduleCount, animate && isInView, 2);
  const animatedLessons = useAnimatedNumber(lessonCount, animate && isInView, 2);

  const stats = [
    {
      icon: <BookOpen className="h-3.5 w-3.5" />,
      label: 'Modules',
      value: animate ? animatedModules : moduleCount,
    },
    {
      icon: <PlayCircle className="h-3.5 w-3.5" />,
      label: 'Lessons',
      value: animate ? animatedLessons : lessonCount,
    },
    {
      icon: <Clock className="h-3.5 w-3.5" />,
      label: 'Duration',
      value: durationLabel,
    },
    {
      icon: <Award className="h-3.5 w-3.5" />,
      label: 'Certificate',
      value: 'Included',
    },
  ];

  return (
    <div ref={ref} className="flex flex-wrap items-center justify-center gap-8 py-6 text-sm">
      {stats.map((stat, index) => (
        <div key={stat.label} className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">{stat.icon}</span>
            <span className="text-slate-600">{stat.label}:</span>
            {typeof stat.value === 'number' ? (
              <motion.span
                className="font-medium text-slate-900"
                key={stat.label + '-num'}
                initial={{ filter: 'blur(6px)' }}
                animate={{ filter: 'blur(0px)' }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              >
                {stat.value}
              </motion.span>
            ) : (
              <span className="font-medium text-slate-900">{stat.value}</span>
            )}
          </div>
          {index < stats.length - 1 && (
            <div className="hidden h-4 w-px bg-slate-200 sm:block" aria-hidden />
          )}
        </div>
      ))}
    </div>
  );
}
