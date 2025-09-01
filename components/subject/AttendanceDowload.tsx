import React, { useState } from "react";
import { ExportAttendanceService } from "../../services";
import { Toast } from "primereact/toast";
import { MdDownload, MdInfo, MdTimer } from "react-icons/md";
import { FiPlus } from "react-icons/fi";
const timePeriods = [
  "All",
  "Last 30 Days",
  "Today",
  "Yesterday",
  "This Month",
  "Last Month",
  "Custom Range",
] as const;

type TimePeriod = (typeof timePeriods)[number];
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // getMonth() is zero-based
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
type Props = {
  subjectId: string;
  toast: React.RefObject<Toast>;
  onClose: () => void;
};
function AttendanceDowload({ subjectId, toast, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("All");
  // State for the 'from' date
  const [fromDate, setFromDate] = useState<string>("");
  // State for the 'to' date
  const [toDate, setToDate] = useState<string>("");
  const handleDolwnloadExcel = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      setLoading(true);
      const response = await ExportAttendanceService({
        subjectId,
        ...(fromDate !== "" && {
          startDate: new Date(fromDate).toISOString(),
        }),
        ...(toDate !== "" &&
          (() => {
            // Create a new Date object from the toDate string
            const endDate = new Date(toDate);

            // Set the time to the last millisecond of the day
            endDate.setHours(23, 59, 59, 999);

            // Return the object with the ISO string
            return { endDate: endDate.toISOString() };
          })()),
      });
      const link = document.createElement("a");
      link.href = response;
      link.click();
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Failed to download the file", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to download the file",
        life: 3000,
      });
    }
  };

  const handleSwichDateRange = (time: TimePeriod) => {
    setTimePeriod(time);
    const today = new Date(); // Current date for consistency
    let newFromDate = new Date(today);
    let newToDate = new Date(today);

    switch (time) {
      case "Today":
        newFromDate = today;
        newToDate = today;
        break;
      case "Yesterday":
        newFromDate.setDate(today.getDate() - 1);
        newToDate.setDate(today.getDate());
        break;
      case "This Month":
        newFromDate = new Date(today.getFullYear(), today.getMonth(), 1);
        newToDate = today;
        break;
      case "Last Month":
        newFromDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        newToDate = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      case "Last 30 Days":
        newFromDate.setDate(today.getDate() - 30);
        newToDate = today;
        break;
      case "All":
        setFromDate("");
        setToDate("");
        return;
        break;
      case "Custom Range":
        // For custom range, we don't set the dates, user will pick them.
        // You might want to clear them or leave them as they are.
        setFromDate("");
        setToDate("");
        return; // Exit early
    }
    setFromDate(formatDate(newFromDate));
    setToDate(formatDate(newToDate));
  };

  console.log(toDate);
  return (
    <form
      onSubmit={handleDolwnloadExcel}
      className="h-max w-96 overflow-hidden rounded-lg bg-white font-Anuphan"
    >
      <header className="flex w-full items-center justify-start gap-3 bg-blue-600 p-3">
        <div className="flex items-center justify-center rounded-md bg-white/50 p-2 text-lg text-white">
          <MdDownload />
        </div>
        <h1 className="text-white">Dowload Excel</h1>
      </header>
      <main className="flex flex-col gap-3 p-2 pb-5">
        <section className="flex flex-col">
          <div className="flex items-center justify-start gap-2 font-semibold">
            <MdTimer className="text-blue-700" />
            <div>Quick Date Selection</div>
          </div>
          <select
            value={timePeriod}
            onChange={(e) => handleSwichDateRange(e.target.value as TimePeriod)}
            className="h-10 w-full rounded-lg border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            {timePeriods.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </section>
        <section className="flex flex-col">
          <div className="flex items-center justify-start gap-2 font-semibold">
            <MdInfo className="text-gray-700" />
            <div>Custom Date</div>
          </div>
          <div className="flex justify-between gap-2 rounded-lg bg-gray-100 p-2 text-sm">
            <label className="flex w-full flex-col">
              Start Date
              <input
                required={toDate !== ""}
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                disabled={timePeriod !== "Custom Range"}
                type="date"
                className="h-10 w-full rounded-lg border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </label>
            <label className="flex w-full flex-col">
              End Date
              <input
                required={fromDate !== ""}
                value={toDate}
                min={fromDate}
                onChange={(e) => setToDate(e.target.value)}
                disabled={timePeriod !== "Custom Range"}
                type="date"
                className="h-10 w-full rounded-lg border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </label>
          </div>
        </section>
      </main>
      <footer className="flex h-14 w-full items-center justify-end gap-3 border-t p-2">
        <button
          type="button"
          onClick={() => {
            onClose();
          }}
          className="second-button flex items-center justify-center gap-1 border"
        >
          Cancel
        </button>
        <button
          disabled={loading}
          type="submit"
          className="main-button flex w-40 items-center justify-center gap-1"
        >
          <FiPlus /> {loading ? "Loading" : "Dowload"}{" "}
        </button>
      </footer>
    </form>
  );
}

export default AttendanceDowload;
