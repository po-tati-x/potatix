import axios from "axios";

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
  status: "active" | "pending" | "rejected";
  user?: {
    name?: string;
    email?: string;
    image?: string;
  };
}

export const enrollmentApi = {
  async getStudents(courseId: string): Promise<Enrollment[]> {
    // Explicitly type the axios response to avoid implicit `any`
    const { data } = await axios.get<Enrollment[]>(
      `/api/courses/enrollments?courseId=${courseId}`,
    );
    return data;
  },
  async updateEnrollment(
    enrollmentId: string,
    status: "active" | "pending" | "rejected",
  ): Promise<void> {
    await axios.patch(`/api/courses/enrollments/${enrollmentId}`, { status });
  },
}; 