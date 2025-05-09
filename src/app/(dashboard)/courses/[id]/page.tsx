'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Play, Settings, Users, DollarSign, Star, Download } from 'lucide-react';

// Define Course type to avoid 'any'
interface Lesson {
  id: string;
  title: string;
  description?: string;
  videoId: string;
  duration: string;
  size: string;
  watched: number;
  order: number;
}

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  students: number;
  revenue: number;
  rating: number;
  status: 'published' | 'draft';
  lessons: Lesson[];
}

// Mock course data
const MOCK_COURSES: Record<string, Course> = {
  '1': {
    id: '1',
    title: 'Advanced TypeScript Patterns',
    description: 'Learn advanced TypeScript patterns used by top-tier companies to build scalable applications. This course covers type manipulation, conditional types, mapped types, and more.',
    price: 79.99,
    students: 47,
    revenue: 3760,
    rating: 4.8,
    status: 'published',
    lessons: [
      { 
        id: 'l1', 
        title: 'Introduction to Advanced Types', 
        description: 'An overview of the advanced type system in TypeScript and why it matters for building robust applications.',
        videoId: 'v1', 
        duration: '8:24', 
        size: '42MB', 
        watched: 2103,
        order: 1
      },
      { 
        id: 'l2', 
        title: 'Type Manipulation Fundamentals',
        description: 'Learn the core techniques for manipulating types including generics, keyof, and typeof operators.',
        videoId: 'v2', 
        duration: '17:35', 
        size: '89MB', 
        watched: 1982,
        order: 2
      },
      { 
        id: 'l3', 
        title: 'Mastering Conditional Types', 
        description: 'Deep dive into conditional types, using infer, and building powerful type utilities.',
        videoId: 'v3', 
        duration: '22:12', 
        size: '112MB', 
        watched: 1873,
        order: 3
      },
      { 
        id: 'l4', 
        title: 'Building with Mapped Types', 
        videoId: 'v4', 
        duration: '19:48', 
        size: '101MB', 
        watched: 1765,
        order: 4
      },
      { 
        id: 'l5', 
        title: 'Advanced Template Literal Types', 
        description: 'Using template literal types to create powerful string manipulation at the type level.',
        videoId: 'v5', 
        duration: '15:30', 
        size: '78MB', 
        watched: 1689,
        order: 5
      },
    ]
  },
  '2': {
    id: '2',
    title: 'Rust for JavaScript Developers',
    description: 'Bridge the gap between JavaScript and Rust. This course is designed specifically for JS developers looking to learn Rust without getting lost in computer science jargon.',
    price: 89.99,
    students: 12,
    revenue: 960,
    rating: 4.6,
    status: 'published',
    lessons: [
      { 
        id: 'l1', 
        title: 'Why Rust for JavaScript Developers', 
        description: 'Understanding the benefits of Rust from a JS developer perspective and setting up your environment.',
        videoId: 'v1', 
        duration: '10:14', 
        size: '52MB', 
        watched: 541,
        order: 1
      },
      { 
        id: 'l2', 
        title: 'The Ownership Model Explained', 
        description: 'Breaking down Rust\'s ownership model in terms that JavaScript developers can understand.',
        videoId: 'v2', 
        duration: '23:05', 
        size: '118MB', 
        watched: 487,
        order: 2
      },
      { 
        id: 'l3', 
        title: 'Error Handling in Rust', 
        description: 'How Rust\'s error handling compares to JavaScript\'s try/catch and promise patterns.',
        videoId: 'v3', 
        duration: '18:42', 
        size: '96MB', 
        watched: 423,
        order: 3
      },
    ]
  },
  '3': {
    id: '3',
    title: 'Building a Compiler from Scratch',
    description: 'Learn how compilers work by building one from scratch. This course covers lexical analysis, parsing, semantic analysis, and code generation.',
    price: 99.99,
    students: 0,
    revenue: 0,
    rating: 0,
    status: 'draft',
    lessons: [
      { 
        id: 'l1', 
        title: 'Compiler Fundamentals', 
        description: 'An introduction to how compilers work and the major phases of compilation.',
        videoId: 'v1', 
        duration: '12:33', 
        size: '64MB', 
        watched: 0,
        order: 1
      },
      { 
        id: 'l2', 
        title: 'Building a Lexical Analyzer', 
        description: 'Creating a lexer that converts source code into a stream of tokens.',
        videoId: 'v2', 
        duration: '20:17', 
        size: '104MB', 
        watched: 0,
        order: 2
      },
    ]
  }
};

export default function CourseDetailsPage({ params }: { params: { id: string } | Promise<{ id: string }> }) {
  // Unwrap params safely with React.use()
  const resolvedParams = params instanceof Promise ? use(params) : params;
  const courseId = resolvedParams.id;
  
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate API fetch with timeout
    setTimeout(() => {
      setCourse(MOCK_COURSES[courseId] || null);
      setLoading(false);
    }, 500);
  }, [courseId]);
  
  if (loading) {
    return (
      <div className="min-h-full w-full py-6 px-6 flex items-center justify-center">
        <div className="animate-pulse text-neutral-500">Loading course details...</div>
      </div>
    );
  }
  
  if (!course) {
    return (
      <div className="min-h-full w-full py-6 px-6">
        <div className="space-y-8">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center space-x-2">
              <Link href="/courses" className="text-neutral-500 hover:text-neutral-700">
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <h1 className="text-2xl font-semibold text-neutral-900">Course Not Found</h1>
            </div>
          </div>
          
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-md">
            The course you're looking for doesn't exist or you don't have access to it.
          </div>
          
          <div>
            <Link href="/courses">
              <button className="px-4 py-2 bg-neutral-800 text-white rounded-md hover:bg-neutral-700">
                Return to Courses
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-full w-full py-6 px-6">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col space-y-1">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Link href="/courses" className="text-neutral-500 hover:text-neutral-700">
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <h1 className="text-2xl font-semibold text-neutral-900">{course.title}</h1>
              
              <span className={`ml-3 inline-flex rounded-full px-2 text-xs font-medium ${
                course.status === 'published' 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : 'bg-neutral-100 text-neutral-800'
              }`}>
                {course.status === 'published' ? 'Published' : 'Draft'}
              </span>
            </div>
            
            <div>
              <Link href={`/courses/${course.id}/edit`}>
                <button className="flex items-center px-3 py-1.5 border border-neutral-300 text-neutral-700 rounded-md hover:bg-neutral-50 text-sm">
                  <Settings className="h-3.5 w-3.5 mr-1.5" />
                  Edit Course
                </button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Course info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-lg border border-neutral-200 bg-white overflow-hidden md:col-span-2">
            <div className="border-b border-neutral-200 px-6 py-4">
              <h3 className="text-md font-medium text-neutral-900">Course Information</h3>
            </div>
            <div className="p-6">
              <h3 className="font-medium mb-2 text-neutral-900">Description</h3>
              <p className="text-sm text-neutral-600 mb-6">{course.description}</p>
              
              <div className="border-t border-neutral-100 pt-6">
                <h3 className="font-medium mb-4 text-neutral-900">Course Content</h3>
                
                <div className="space-y-4">
                  {course.lessons.sort((a, b) => a.order - b.order).map((lesson) => (
                    <div key={lesson.id} className="border border-neutral-200 rounded-lg overflow-hidden">
                      <div className="bg-neutral-50 p-4 border-b border-neutral-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="h-7 w-7 rounded-full bg-neutral-200 flex items-center justify-center">
                              <span className="text-xs font-medium text-neutral-700">{lesson.order}</span>
                            </div>
                            <h4 className="font-medium text-neutral-800">{lesson.title}</h4>
                          </div>
                          <div className="text-xs text-neutral-500">
                            {lesson.duration}
                          </div>
                        </div>
                        
                        {lesson.description && (
                          <p className="text-sm text-neutral-600 mt-2 pl-9">
                            {lesson.description}
                          </p>
                        )}
                      </div>
                      
                      <div className="p-4 flex items-center justify-between bg-white">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center mr-3">
                            <Play className="h-3.5 w-3.5 text-neutral-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium">Video</div>
                            <div className="text-xs text-neutral-500">
                              {lesson.size}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          {course.status === 'published' && (
                            <div className="text-xs text-neutral-500 mr-4">
                              {lesson.watched.toLocaleString()} views
                            </div>
                          )}
                          
                          <button className="text-neutral-400 hover:text-neutral-700">
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            {/* Stats */}
            <div className="rounded-lg border border-neutral-200 bg-white overflow-hidden">
              <div className="border-b border-neutral-200 px-6 py-4">
                <h3 className="text-md font-medium text-neutral-900">Course Stats</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center">
                      <Users className="h-3.5 w-3.5 text-blue-600" />
                    </div>
                    <span className="text-sm text-neutral-600">Students</span>
                  </div>
                  <span className="font-medium">{course.students}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-7 w-7 rounded-full bg-emerald-100 flex items-center justify-center">
                      <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
                    </div>
                    <span className="text-sm text-neutral-600">Revenue</span>
                  </div>
                  <span className="font-medium">${course.revenue}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-7 w-7 rounded-full bg-amber-100 flex items-center justify-center">
                      <Star className="h-3.5 w-3.5 text-amber-600" />
                    </div>
                    <span className="text-sm text-neutral-600">Rating</span>
                  </div>
                  <span className="font-medium">
                    {course.rating > 0 ? course.rating.toFixed(1) : '-'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Price info */}
            <div className="rounded-lg border border-neutral-200 bg-white overflow-hidden">
              <div className="border-b border-neutral-200 px-6 py-4">
                <h3 className="text-md font-medium text-neutral-900">Pricing</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">Price</span>
                  <span className="font-medium">${course.price.toFixed(2)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">Potatix Fee (10%)</span>
                  <span className="font-medium text-neutral-500">
                    ${(course.price * 0.1).toFixed(2)}
                  </span>
                </div>
                
                <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                  <span className="text-sm font-medium">You receive</span>
                  <span className="font-medium text-emerald-600">
                    ${(course.price * 0.9).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Course link */}
            {course.status === 'published' && (
              <div className="rounded-lg border border-neutral-200 bg-white overflow-hidden">
                <div className="border-b border-neutral-200 px-6 py-4">
                  <h3 className="text-md font-medium text-neutral-900">Share Your Course</h3>
                </div>
                <div className="p-6">
                  <div className="relative">
                    <input
                      type="text"
                      value={`https://potatix.io/c/${course.id}`}
                      readOnly
                      className="w-full pr-20 pl-3 py-2 border border-neutral-300 rounded-md bg-neutral-50 text-sm"
                    />
                    <button
                      className="absolute right-1 top-1 px-3 py-1 bg-neutral-200 rounded text-xs font-medium"
                      onClick={() => {
                        navigator.clipboard.writeText(`https://potatix.io/c/${course.id}`);
                        alert('Link copied to clipboard!');
                      }}
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 