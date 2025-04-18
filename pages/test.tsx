
import StudentReportPDF from "@/components/subject/StudentReportPDF";
const data = {
  "schoolName": "Tatuga School",
  "reportTitle": "Student Report",
  "studentInfo": {
    "name": "นางสาวฐิติวรดา หาญแท้",
    "imageURL": "https://storage.googleapis.com/public-tatugaschool/avatars/18.png",
    "class": "ม.6/4"
  },
  "courseInfo": {
    "subject": " ภาษาอังกฤษเพื่อการสื่อสา",
    "description": "อ10001",
    "educationYear": "2567"
  },
  "teachers": {
    "homeroom": ["นายใหม่ไทย ใจตะวัน", "นางสาวดอกอ้อ กอทุ่ง"],
    "instructor": {
      "name": "นางสาวจินตหรา พูนลาภ",
      "imageURL": "https://storage.googleapis.com/public-tatugaschool/avatars/18.png",
      "email": "jin.poon@gmail.com"
    }
  },
  "attendance": {
    "status": "ผ่านเกณฑ์",
    "totalHours": 100,
    "summary": [
      {
        "status": "attended",
        "value": 80
      },
      {
        "status": "absent",
        "value": 10
      },
      {
        "status": "leave",
        "value": 10
      },
      {
        "status": "late",
        "value": 0
      }
    ]
  },
  "academicPerformance": {
    "overallGrade": 4.0,
    "overallScore": 80,
    "maxScore": 100,
    "assessments": [
      {
        "item": "Quiz 1",
        "score": 10,
        "maxScore": 10
      },
      {
        "item": "ใบงานที่ 1 : Public Speaking",
        "score": 15,
        "maxScore": 20
      },
      {
        "item": "ใบงานที่ 2 : Speech practice",
        "score": 15,
        "maxScore": 20
      },
      {
        "item": "ใบงาน 3 : Debate",
        "score": 15,
        "maxScore": 20
      },
      {
        "item": "Final Project",
        "score": 25,
        "maxScore": 30
      }
    ]
  },
  "skillAssessment": {
    "title": "สรุปผลทักษะจากรายวิชา",
    "skills": [
      {
        "skill": "Communication",
        "percentage": 20
      },
      {
        "skill": "Leadership",
        "percentage": 40
      },
      {
        "skill": "Critical thinking",
        "percentage": 16
      },
      {
        "skill": "Leadership",
        "percentage": 6
      },
      {
        "skill": "Social",
        "percentage": 4
      },
      {
        "skill": "Digital Literacy",
        "percentage": 4
      },
      {
        "skill": "Creativity",
        "percentage": 10
      }
    ]
  },
  "recommendations": "ข้อเสนอแนะจากสรุปผลทักษะ: กลุ่มอาชีพด้านการบริหารธุรกิจ การเงินและการธนาคาร งานบริหาร บัญชี HR นักวางผังทางการเงิน ผู้จัดการฝ่ายขายงานต่างๆ เจ้าของกิจการ นักวิเคราะห์ทางการตลาด เป็นต้น", // Recommendations based on skill summary: Business administration, finance/banking, management, accounting, HR, financial planner, sales manager, entrepreneur, market analyst, etc.
  "signatureFields": {
    "position": "ผู้อำนวยการ",
    "name": "(นายไหมไทย ใจตะวัน)"
  }
}

export default function Home() {
  return (
    <>
      <StudentReportPDF data={data}/>
    </>
  );
}
