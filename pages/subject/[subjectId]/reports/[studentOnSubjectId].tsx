import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { GetServerSideProps } from "next";
import { useRef, useState } from "react";
import { MdDownload } from "react-icons/md";
import { StudentReportHTML } from "../../../../components/StudentReportSVG";
import { useGetStudentOnSubjectReport } from "../../../../react-query";

function Index({ studentOnSubjectId }: { studentOnSubjectId: string }) {
  const studentReport = useGetStudentOnSubjectReport({ studentOnSubjectId });
  const svgRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleExportPDF = async () => {
    if (!svgRef.current) return;
    setIsDownloading(true);

    try {
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
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  if (studentReport.isLoading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-2 bg-[#F7F8FA] font-Anuphan text-[#2C7CD1]">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA] py-10 font-Anuphan">
      <div className="fixed bottom-8 right-8 z-50 print:hidden">
        <button
          className="flex items-center justify-center gap-2 rounded-full bg-[#2C7CD1] px-6 py-4 text-lg font-bold text-white shadow-lg transition-all hover:scale-105 hover:bg-[#2d6fb5] hover:shadow-xl active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
          onClick={handleExportPDF}
          disabled={isDownloading}
        >
          {isDownloading ? (
            <>Generating...</>
          ) : (
            <>
              Download PDF <MdDownload />
            </>
          )}
        </button>
      </div>

      {studentReport.data ? (
        <div className="flex justify-center overflow-auto px-4 pb-24">
          <StudentReportHTML ref={svgRef} data={studentReport.data} />
        </div>
      ) : (
        <div className="flex h-screen w-screen flex-col items-center justify-center gap-2 bg-[#F7F8FA] font-Anuphan text-[#2C7CD1]">
          Report not found
        </div>
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
