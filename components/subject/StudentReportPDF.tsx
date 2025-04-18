import React from 'react';
import { StudentReportData } from '../../interfaces/StudentReportData';
import { generateStudentReportPDF } from '../../utils/generateStudentReportPDF';
import { IoDocumentText } from 'react-icons/io5';

interface Props {
  data: StudentReportData;
}

export default function StudentReportPDF({ data }: Props) {
  const handleGeneratePDF = async () => {
    try {
      const doc = await generateStudentReportPDF(data);
      // Save the PDF
      doc.save(`${data.studentInfo.name}-${data.courseInfo.subject}-report.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      // You might want to add proper error handling here
    }
  };

  return (
    <button
      onClick={handleGeneratePDF}
      className="main-button w-full xl:w-auto flex items-center justify-center gap-2 py-2 px-4 ring-1 ring-blue-600"
    >
      <IoDocumentText className="text-lg" />
      <span>Download PDF Report</span>
    </button>
  );
} 