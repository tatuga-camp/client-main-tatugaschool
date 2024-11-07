import React from "react";
import { useGetAttendanceRowByTableId } from "../../react-query";

function Attendance() {
  const attendanceRows = useGetAttendanceRowByTableId({
    attendanceTableId: "6729bcf22473d9a28bb6e12b",
  });
  return <div>Attendance</div>;
}

export default Attendance;
