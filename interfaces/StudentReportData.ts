export interface StudentReportData {
  schoolName: string;
  reportTitle: string;
  studentInfo: {
    name: string;
    imageURL: string;
    class: string;
  };
  courseInfo: {
    subject: string;
    description: string;
    educationYear: string;
  };
  teachers: {
    homeroom: string[];
    instructor: {
      name: string;
      imageURL: string;
      email: string;
    };
  };
  attendance: {
    status: string;
    totalHours: number;
    summary: Array<{
      status: string;
      value: number;
    }>;
  };
  academicPerformance: {
    overallGrade: number;
    overallScore: number;
    maxScore: number;
    assessments: Array<{
      item: string;
      score: number;
      maxScore: number;
    }>;
  };
  skillAssessment: {
    title: string;
    skills: Array<{
      skill: string;
      percentage: number;
    }>;
  };
  recommendations: string;
  signatureFields: {
    position: string;
    name: string;
  };
} 