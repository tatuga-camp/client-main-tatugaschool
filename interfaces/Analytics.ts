export type AtRiskStudent = {
  studentId: string;
  firstName: string;
  lastName: string;
  number: string;
  photo: string;
  classId: string;
  className: string;
  riskScore: number;
  tier: "HIGH" | "MEDIUM";
  limitedData: boolean;
  signals: {
    missingCount: number;
    missingRate: number;
    avgScorePercent: number | null;
    absentCount: number;
    absentRate: number | null;
  };
};

export type SchoolAnalytics = {
  schoolId: string;
  educationYear: string;
  generatedAt: string;
  source: "scheduled" | "on-demand";
  summary: {
    totalStudents: number;
    atRiskCount: number;
    highRiskCount: number;
    mediumRiskCount: number;
    onTimeSubmissionRate: number;
    awaitingGradingCount: number;
    attendanceRate: number;
    avgScorePercent: number;
  };
  atRiskStudents: AtRiskStudent[];
  scoreDistribution: Array<{ bucket: string; count: number }>;
  attendanceOverview: { present: number; absent: number; other: number; rate: number };
  classLeaderboard: Array<{
    classId: string;
    title: string;
    level: string;
    studentCount: number;
    atRiskCount: number;
    avgScorePercent: number;
  }>;
  subjectLeaderboard: Array<{
    subjectId: string;
    title: string;
    attendanceRate: number;
    atRiskCount: number;
    studentCount: number;
    avgScorePercent: number;
    teachers: Array<{ userId: string; firstName: string; lastName: string; photo: string }>;
  }>;
  teacherLeaderboard: Array<{
    userId: string;
    firstName: string;
    lastName: string;
    photo: string;
    subjectCount: number;
    studentCount: number;
    atRiskCount: number;
    atRiskRate: number;
  }>;
};

export type StudentInsightDetail = {
  studentId: string;
  missingAssignments: Array<{
    studentOnAssignmentId: string;
    assignmentId: string;
    title: string;
    subjectId: string;
    subjectTitle: string;
    dueDate: string | null;
  }>;
};
