import jsPDF from 'jspdf';
import { StudentReportData } from '../interfaces';

export const generateStudentReportPDF = async (data: StudentReportData) => {
  // Create new PDF document
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;

  // Set font
  doc.setFont('helvetica');

  // Header
  doc.setFontSize(24);
  doc.text(data.schoolName, pageWidth / 2, margin + 10, { align: 'center' });
  
  doc.setFontSize(20);
  doc.text(data.reportTitle, pageWidth / 2, margin + 20, { align: 'center' });

  // Student Info
  doc.setFontSize(12);
  doc.text(`ชื่อ: ${data.studentInfo.name}`, margin, margin + 40);
  doc.text(`ชั้น: ${data.studentInfo.class}`, margin, margin + 50);
  doc.text(`วิชา: ${data.courseInfo.subject}`, margin, margin + 60);
  doc.text(`รหัสวิชา: ${data.courseInfo.description}`, pageWidth - margin - 50, margin + 40);
  doc.text(`ปีการศึกษา: ${data.courseInfo.educationYear}`, pageWidth - margin - 50, margin + 50);

  // Teachers
  doc.text('ครูประจำชั้น:', margin, margin + 80);
  data.teachers.homeroom.forEach((teacher, index) => {
    doc.text(`- ${teacher}`, margin + 20, margin + 90 + (index * 10));
  });
  doc.text(`ครูผู้สอน: ${data.teachers.instructor.name}`, margin, margin + 110);
  doc.text(`อีเมล: ${data.teachers.instructor.email}`, margin, margin + 120);

  // Attendance
  doc.text('การเข้าเรียน:', margin, margin + 140);
  doc.text(`จำนวนชั่วโมงเรียนทั้งหมด: ${data.attendance.totalHours} ชั่วโมง`, margin + 20, margin + 150);
  data.attendance.summary.forEach((item, index) => {
    doc.text(`${item.status}: ${item.value}%`, margin + 20, margin + 160 + (index * 10));
  });

  // Academic Performance
  doc.text('ผลการเรียน:', margin, margin + 200);
  doc.text(`เกรด: ${data.academicPerformance.overallGrade}`, margin + 20, margin + 210);
  doc.text(`คะแนนรวม: ${data.academicPerformance.overallScore}/${data.academicPerformance.maxScore}`, margin + 20, margin + 220);
  
  // Assessment Items
  doc.text('รายการประเมิน:', margin, margin + 240);
  data.academicPerformance.assessments.forEach((assessment, index) => {
    doc.text(`${assessment.item}: ${assessment.score}/${assessment.maxScore}`, 
      margin + 20, margin + 250 + (index * 10));
  });

  // Skills Assessment
  if (pageHeight - (margin + 280) < 100) {
    doc.addPage();
  }
  doc.text('ทักษะที่ได้รับการประเมิน:', margin, margin + 280);
  data.skillAssessment.skills.forEach((skill, index) => {
    doc.text(`${skill.skill}: ${skill.percentage}%`, 
      margin + 20, margin + 290 + (index * 10));
  });

  // Recommendations
  if (pageHeight - (margin + 380) < 50) {
    doc.addPage();
  }
  doc.text('ข้อเสนอแนะ:', margin, margin + 380);
  const splitRecommendations = doc.splitTextToSize(data.recommendations, pageWidth - (margin * 4));
  doc.text(splitRecommendations, margin + 20, margin + 390);

  // Signature
  doc.text(data.signatureFields.position, pageWidth - margin - 80, pageHeight - margin - 20);
  doc.text(data.signatureFields.name, pageWidth - margin - 80, pageHeight - margin - 10);

  return doc;
}; 