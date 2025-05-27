import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { GetServerSideProps } from "next";
import { useEffect, useRef, useState } from "react";
import { MdDownload } from "react-icons/md";
import { StudentReportHTML } from "../../../../components/StudentReportSVG";
import { useGetStudentOnSubjectReport } from "../../../../react-query";

function Index({ studentOnSubjectId }: { studentOnSubjectId: string }) {
  const studentReport = useGetStudentOnSubjectReport({ studentOnSubjectId });
  const svgRef = useRef<HTMLDivElement>(null);
  const [triggerDowload, setTriggerDowload] = useState(false);
  const handleExportPDF = async () => {
    setTriggerDowload(true);
    document.body.style.overflow = "auto";
    if (!svgRef.current) return;

    // Wait for all images to load
    const images = svgRef.current.getElementsByTagName("img");
    const imagePromises = Array.from(images).map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve) => {
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
      allowTaint: true,
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

  useEffect(() => {
    document.body.style.overflow = "hidden";
  }, []);

  if (studentReport.isLoading) {
    return (
      <div className="gradient-bg flex h-dvh w-screen flex-col items-center justify-center gap-2 font-Anuphan text-white">
        Loading..
      </div>
    );
  }

  return (
    <div>
      {!triggerDowload && (
        <div className="fixed bottom-0 left-0 right-0 top-0 z-20 m-auto flex h-screen w-screen items-center justify-center bg-white/50 backdrop-blur-md">
          <button
            className="main-button flex items-center justify-center gap-2"
            onClick={handleExportPDF}
            style={{ marginTop: 24 }}
          >
            Dowload PDF <MdDownload />
          </button>
        </div>
      )}
      {studentReport.data && (
        <StudentReportHTML ref={svgRef} data={studentReport.data} />
      )}
    </div>
  );
}

export default Index;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const params = ctx.params;

  if (!params?.studentOnSubjectId) {
    return {
      notFound: true,
    };
  }
  return {
    props: {
      studentOnSubjectId: params.studentOnSubjectId,
    },
  };
};
