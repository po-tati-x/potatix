'use client';

import { BookOpen, Calendar, Users, Play, ChevronRight, Lock, Clock, CheckCircle, ArrowRight, Star, Code, BarChart2, GraduationCap } from 'lucide-react';
import Image from 'next/image';
import { Course, Lesson } from '@/lib/types/api';
import Link from 'next/link';
import { Button } from '@/components/ui/potatix/Button';

interface CourseOverviewProps {
  course: Course;
  unlockedLessonsCount: number;
  totalLessonsCount: number;
  courseSlug: string;
}

export default function CourseOverview({ 
  course, 
  unlockedLessonsCount, 
  totalLessonsCount, 
  courseSlug 
}: CourseOverviewProps) {
  // Mock data for additional content sections
  const instructorData = {
    name: "Sarah Johnson",
    role: "Senior Developer & Instructor",
    bio: "10+ years experience in web development. Former lead engineer at Netflix.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=120&h=120&auto=format&fit=crop",
    courses: 12,
    students: 8750
  };
  
  const skills = [
    "JavaScript Fundamentals", 
    "React State Management", 
    "API Integration", 
    "Component Architecture",
    "Performance Optimization"
  ];
  
  const reviews = [
    {
      id: 1,
      name: "Alex Thompson",
      avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=40&h=40&auto=format&fit=crop",
      rating: 5,
      date: "2 weeks ago",
      comment: "This course completely changed how I approach frontend development. Clear explanations and practical examples."
    },
    {
      id: 2,
      name: "Maya Peterson",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=40&h=40&auto=format&fit=crop",
      rating: 4,
      date: "1 month ago",
      comment: "Great content overall. Some sections could have been more detailed, but I learned a lot of useful techniques."
    }
  ];
  
  const relatedCourses = [
    {
      id: "adv-js",
      title: "Advanced JavaScript Patterns",
      instructor: "Sarah Johnson",
      students: 1245,
      imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=120&h=80&auto=format&fit=crop"
    },
    {
      id: "react-perf",
      title: "React Performance Optimization",
      instructor: "Michael Chen",
      students: 879,
      imageUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=120&h=80&auto=format&fit=crop"
    }
  ];
  
  const faqs = [
    {
      question: "How long do I have access to the course?",
      answer: "You&apos;ll have lifetime access to all course materials after purchase."
    },
    {
      question: "Is this course suitable for beginners?",
      answer: "This course is designed for intermediate developers who already have basic knowledge of JavaScript and React."
    },
    {
      question: "Are the project files included?",
      answer: "Yes, you&apos;ll get access to all source code and project files used in the course."
    }
  ];

  return (
    <div className="h-full overflow-y-auto pb-12">
      {/* Hero section with course info */}
      <div className="bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-4 py-8 sm:py-10">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Course image */}
            <div className="w-full md:w-1/3 aspect-video md:aspect-square relative rounded-md overflow-hidden flex-shrink-0 bg-slate-800 border border-slate-700">
              {course.imageUrl ? (
                <Image
                  src={course.imageUrl}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <BookOpen className="h-14 w-14 text-slate-600" />
                </div>
              )}
            </div>
            
            {/* Course details */}
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-medium mb-3">{course.title}</h1>
              
              <p className="text-base text-slate-300 mb-4">
                {course.description || "Learn how to build modern web applications with expert guidance."}
              </p>
              
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-4 w-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <span className="text-sm text-slate-300">(42 reviews)</span>
                <span className="text-sm text-slate-400">|</span>
                <span className="text-sm text-slate-300">1,234 students enrolled</span>
              </div>
              
              <div className="flex flex-wrap gap-4 text-sm text-slate-400 mb-5">
                <div className="flex items-center gap-1.5">
                  <Play className="h-4 w-4" />
                  <span>{totalLessonsCount} lessons</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span>6 hours</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <span>Last updated: Oct 2023</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <BarChart2 className="h-4 w-4" />
                  <span>Intermediate level</span>
        </div>
      </div>
      
              <div className="flex flex-wrap gap-3">
                <Link href={`/viewer/${courseSlug}/lesson/${course.lessons?.[0]?.id || '1'}`}>
                  <Button
                    type="primary"
                    size="medium"
                    iconRight={<ChevronRight className="h-4 w-4" />}
                  >
                    Start learning
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button
                    type="outline"
                    size="medium"
                    className="text-white border-slate-600 hover:border-slate-500"
                  >
                    Subscribe to unlock all
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Course access info */}
        <div className="mb-6 border border-emerald-200 rounded-md bg-emerald-50 overflow-hidden">
          <div className="flex items-start gap-3 p-4">
            <div className="mt-0.5 h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-base font-medium text-slate-900 mb-1">Demo Access</h2>
              <p className="text-sm text-slate-600 mb-2">
                You have access to {unlockedLessonsCount} of {totalLessonsCount} lessons in this course.
                Subscribe to unlock all content.
              </p>
              <Link href="/pricing">
                <Button
                  type="link"
                  size="small"
                  iconRight={<ChevronRight className="h-3.5 w-3.5" />}
                >
                  View pricing
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Navigation tabs */}
        <div className="border-b border-slate-200 mb-6">
          <div className="flex space-x-6">
            <button className="pb-2 text-sm border-b-2 border-emerald-600 text-emerald-600 font-medium">
              Overview
            </button>
            <button className="pb-2 text-sm text-slate-600 hover:text-slate-900">
              Curriculum
            </button>
            <button className="pb-2 text-sm text-slate-600 hover:text-slate-900">
              Reviews
            </button>
            <button className="pb-2 text-sm text-slate-600 hover:text-slate-900">
              Instructor
            </button>
          </div>
        </div>
        
        {/* Two column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content column */}
          <div className="lg:col-span-2 space-y-6">
            {/* What you'll learn section */}
            <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
              <div className="border-b border-slate-200 px-4 py-3 bg-slate-50">
                <h2 className="text-base font-medium text-slate-900">What you&apos;ll learn</h2>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {skills.map((skill, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-slate-700">{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Popular lessons section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-medium text-slate-900">Start learning</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {course.lessons?.slice(0, 2).map((lesson: Lesson) => (
                  <Link 
                    key={lesson.id}
                    href={`/viewer/${courseSlug}/lesson/${lesson.id}`}
                    className="group p-4 bg-white border border-slate-200 rounded-md hover:border-emerald-300 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                        <Play className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-base font-medium text-slate-900 group-hover:text-emerald-600 mb-1 transition-colors line-clamp-1">
                          {lesson.title}
                        </h3>
                        <p className="text-sm text-slate-500 line-clamp-2">
                          {lesson.description || "Start watching this lesson now."}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            
            {/* Course structure */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-medium text-slate-900">Course curriculum</h2>
                <span className="text-sm text-slate-500">{totalLessonsCount} lessons • 6 hrs total</span>
              </div>
              
              {/* Module 1 */}
              <CourseStructureSection 
                title="Developer's Mindset"
                description="How to Think Like a Programmer and Solve Problems"
                availableLessons={2}
                totalLessons={4}
                courseSlug={courseSlug}
                firstLessonId={course.lessons?.[0]?.id}
              />
              
              {/* Module 2 */}
              <CourseStructureSection 
                title="Web Development Basics"
                description="Learn the fundamental building blocks of modern web development"
                availableLessons={0}
                totalLessons={6}
                courseSlug={courseSlug}
                isLocked={true}
              />
              
              {/* Module 3 */}
              <CourseStructureSection 
                title="Advanced Techniques"
                description="Master complex patterns and optimize your applications"
                availableLessons={0}
                totalLessons={8}
                courseSlug={courseSlug}
                isLocked={true}
              />
            </div>
            
            {/* Instructor section */}
            <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
              <div className="border-b border-slate-200 px-4 py-3 bg-slate-50">
                <h2 className="text-base font-medium text-slate-900">Your Instructor</h2>
              </div>
              <div className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="h-16 w-16 rounded-full overflow-hidden">
                      <Image 
                        src={instructorData.avatar} 
                        alt={instructorData.name}
                        width={64}
                        height={64}
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-medium text-slate-900">{instructorData.name}</h3>
                    <p className="text-sm text-slate-600 mb-3">{instructorData.role}</p>
                    
                    <div className="flex gap-4 mb-3">
                      <div className="flex items-center gap-1.5">
                        <GraduationCap className="h-4 w-4 text-slate-500" />
                        <span className="text-sm text-slate-700">{instructorData.courses} courses</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="h-4 w-4 text-slate-500" />
                        <span className="text-sm text-slate-700">{instructorData.students.toLocaleString()} students</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-slate-700 mb-3">{instructorData.bio}</p>
                    
                    <Button
                      type="outline"
                      size="small"
                      className="border-slate-200"
                    >
                      View profile
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Reviews section */}
            <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
              <div className="border-b border-slate-200 px-4 py-3 bg-slate-50 flex items-center justify-between">
                <h2 className="text-base font-medium text-slate-900">Student reviews</h2>
                <Button
                  type="outline"
                  size="small"
                  className="border-slate-200"
                >
                  See all 42 reviews
                </Button>
              </div>
              <div className="divide-y divide-slate-100">
                {reviews.map(review => (
                  <div key={review.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full overflow-hidden">
                          <Image 
                            src={review.avatar} 
                            alt={review.name}
                            width={32}
                            height={32}
                            className="object-cover"
                          />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1">
                          <h3 className="text-sm font-medium text-slate-900">{review.name}</h3>
                          <span className="text-xs text-slate-500">{review.date}</span>
                        </div>
                        <div className="flex mb-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star} 
                              className={`h-3.5 w-3.5 ${star <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} 
                            />
                          ))}
                        </div>
                        <p className="text-sm text-slate-700">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* FAQ section */}
            <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
              <div className="border-b border-slate-200 px-4 py-3 bg-slate-50">
                <h2 className="text-base font-medium text-slate-900">Frequently Asked Questions</h2>
              </div>
              <div className="divide-y divide-slate-100">
                {faqs.map((faq, index) => (
                  <div key={index} className="p-4">
                    <h3 className="text-sm font-medium text-slate-900 mb-2">{faq.question}</h3>
                    <p className="text-sm text-slate-600">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6 lg:relative">
            {/* Sticky container for sidebar content */}
            <div className="lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-auto pb-4 space-y-6">
              {/* Call to action */}
              <div className="border border-slate-200 rounded-md overflow-hidden bg-white">
                <div className="p-5">
                  <div className="mb-4">
                    <div className="text-2xl font-medium text-slate-900">
                      <span className="mr-2">$49</span>
                      <span className="line-through text-base text-slate-500">$129</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium">
                        62% off
                      </span>
                      <span className="text-slate-500">
                        2 days left at this price!
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <Button
                      type="primary"
                      size="medium"
                      className="w-full justify-center"
                    >
                      Buy this course
                    </Button>
                    
                    <Button
                      type="outline"
                      size="medium"
                      className="w-full justify-center"
                    >
                      Try free preview
                    </Button>
                  </div>
                  
                  <div className="text-xs text-slate-500 text-center mb-4">
                    30-day money-back guarantee
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-slate-900">This course includes:</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Play className="h-4 w-4 text-slate-400" />
                        <span>6 hours on-demand video</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Code className="h-4 w-4 text-slate-400" />
                        <span>12 coding exercises</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <File className="h-4 w-4 text-slate-400" />
                        <span>5 downloadable resources</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Trophy className="h-4 w-4 text-slate-400" />
                        <span>Certificate of completion</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Globe className="h-4 w-4 text-slate-400" />
                        <span>Lifetime access</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Related courses */}
              <div className="border border-slate-200 rounded-md overflow-hidden bg-white">
                <div className="border-b border-slate-200 px-4 py-3 bg-slate-50">
                  <h2 className="text-sm font-medium text-slate-900">Related Courses</h2>
                </div>
                <div className="divide-y divide-slate-100">
                  {relatedCourses.map(course => (
                    <Link 
                      key={course.id}
                      href={`/viewer/${course.id}`}
                      className="block p-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-12 h-8 bg-slate-100 rounded overflow-hidden">
                          {course.imageUrl ? (
                            <Image 
                              src={course.imageUrl}
                              alt={course.title}
                              width={48}
                              height={32}
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <BookOpen className="h-3.5 w-3.5 text-slate-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-slate-900 line-clamp-1">{course.title}</h3>
                          <p className="text-xs text-slate-500">By {course.instructor}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} className="h-3 w-3 text-amber-400 fill-amber-400" />
                              ))}
                            </div>
                            <span className="text-xs text-slate-500">({course.students})</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
              
              {/* Course tags */}
              <div className="border border-slate-200 rounded-md overflow-hidden bg-white">
                <div className="border-b border-slate-200 px-4 py-3 bg-slate-50">
                  <h2 className="text-sm font-medium text-slate-900">Course tags</h2>
                </div>
                <div className="p-4">
                  <div className="flex flex-wrap gap-2">
                    {["JavaScript", "React", "Web Development", "Frontend", "Performance"].map((tag, index) => (
                      <Link 
                        key={index}
                        href={`/courses/tag/${tag.toLowerCase()}`}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded-full transition-colors"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface CourseStructureSectionProps {
  title: string;
  description: string;
  availableLessons: number;
  totalLessons: number;
  courseSlug: string;
  firstLessonId?: string;
  isLocked?: boolean;
}

function CourseStructureSection({
  title,
  description,
  availableLessons,
  totalLessons,
  courseSlug,
  firstLessonId,
  isLocked = false
}: CourseStructureSectionProps) {
  return (
    <div className="mb-3 bg-white border border-slate-200 rounded-md overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-base font-medium text-slate-900">{title}</h3>
          <div className="text-sm bg-slate-100 px-2 py-0.5 rounded-full text-slate-600">
            {availableLessons} / {totalLessons} lessons
          </div>
        </div>
        
        <p className="text-sm text-slate-600 mb-3">{description}</p>
        
        {isLocked ? (
          <div className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-md">
            <Lock className="h-4 w-4 text-slate-500" />
            <p className="text-sm text-slate-600">
              Subscribe to unlock all lessons in this module
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {firstLessonId && (
              <Link href={`/viewer/${courseSlug}/lesson/${firstLessonId}`}>
                <Button 
                  type="outline"
                  size="small"
                  iconRight={<ArrowRight className="h-3.5 w-3.5" />}
                  className="text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100"
                >
                  Start module
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Missing icons that were used but not imported
interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

function File(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

function Trophy(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}

function Globe(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" x2="22" y1="12" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}