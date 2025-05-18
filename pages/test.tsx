import React, { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { StudentReportHTML } from "@/components/StudentReportSVG";

// นำ mock data ที่คุณมีมาใส่ตรงนี้
const mockData = {
  schoolName: "Tatuga School",
  reportTitle: "Student Report",
  studentInfo: {
    name: "นางสาวฐิติวรดา หาญแท้",
    imageURL: "https://avatars.githubusercontent.com/u/29640973?s=64&u=37f5153de3857b97ec7422b859831ab2bf700868&v=4",
    class: "ม.6/4"
  },
  courseInfo: {
    subject: "ภาษาอังกฤษเพื่อการสื่อสาร",
    description: "อ10001",
    educationYear: "2567"
  },
  teachers: {
    homeroom: ["นายใหม่ไทย ใจตะวัน", "นางสาวดอกอ้อ กอทุ่ง"],
    instructor: {
      name: "นางสาวจินตหรา พูนลาภ",
      imageURL: "https://avatars.githubusercontent.com/u/29640973?s=64&u=37f5153de3857b97ec7422b859831ab2bf700868&v=4",
      email: "jin.poon@gmail.com"
    }
  },
  attendance: {
    status: "ผ่านเกณฑ์",
    totalHours: 100,
    summary: [
      { status: "attended", value: 80 },
      { status: "absent", value: 10 },
      { status: "leave", value: 10 },
      { status: "late", value: 0 }
    ]
  },
  academicPerformance: {
    overallGrade: 4.0,
    overallScore: 80,
    maxScore: 100,
    assessments: [
      { item: "Quiz 1", score: 10, maxScore: 10 },
      { item: "ใบงานที่ 1 : Public Speaking", score: 15, maxScore: 20 },
      { item: "ใบงานที่ 2 : Speech practice", score: 15, maxScore: 20 },
      { item: "ใบงาน 3 : Debate", score: 15, maxScore: 20 },
      { item: "Final Project", score: 25, maxScore: 30 }
    ]
  },
  skillAssessment: {
    title: "สรุปผลทักษะจากรายวิชา",
    skills: [
      { skill: "Communication", percentage: 20 },
      { skill: "Leadership", percentage: 40 },
      { skill: "Critical thinking", percentage: 16 },
      { skill: "Leadership", percentage: 6 },
      { skill: "Social", percentage: 4 },
      { skill: "Digital Literacy", percentage: 4 },
      { skill: "Creativity", percentage: 10 }
    ]
  },
  recommendations: "ข้อเสนอแนะจากสรุปผลทักษะ: กลุ่มอาชีพด้านการบริหารธุรกิจ การเงินและการธนาคาร งานบริหาร บัญชี HR นักวางผังทางการเงิน ผู้จัดการฝ่ายขายงานต่างๆ เจ้าของกิจการ นักวิเคราะห์ทางการตลาด เป็นต้น",
  signatureFields: {
    position: "ผู้อำนวยการ",
    name: "(นายไหมไทย ใจตะวัน)"
  }
};

export default function TestPage() {
  const svgRef = useRef<HTMLDivElement>(null);

  const handleExportPDF = async () => {
    if (!svgRef.current) return;

    // Wait for all images to load
    const images = svgRef.current.getElementsByTagName('img');
    const imagePromises = Array.from(images).map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise(resolve => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    });
    await Promise.all(imagePromises);

    const canvas = await html2canvas(svgRef.current, { 
      backgroundColor: "#fff", 
      scale: 2,
      logging: true,
      useCORS: true,
      allowTaint: true
    });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: [canvas.width, canvas.height],
    });
    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save("student-report.pdf");
  };

  return (
    <div>
      <StudentReportHTML ref={svgRef} data={mockData} />
      <button onClick={handleExportPDF} style={{ marginTop: 24 }}>
        Export PDF
      </button>
    </div>
  );
}
