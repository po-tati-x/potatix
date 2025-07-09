export interface Lesson {
  id: string;
  title: string;
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
} 