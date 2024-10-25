import React, { memo, SyntheticEvent, use, useRef, useState } from "react";
import { Calendar as CalendarPrimereact } from "primereact/calendar";
import { FormEvent, Nullable } from "primereact/ts-helpers";
import { CgClose } from "react-icons/cg";

type Props = {
  value: Nullable<(Date | null)[]>;
  onValue: (value: Nullable<(Date | null)[]>) => void;
};
function Calendar({ value, onValue }: Props) {
  const [data, setData] = useState<Nullable<(Date | null)[]>>(value);

  return (
    <div className="flex flex-col w-full h-full ">
      <label className="text-xs text-gray-500">Select Date</label>
      <div className="relative w-max ">
        <CalendarPrimereact
          dateFormat="dd/mm/yy"
          value={data}
          onChange={(event) => {
            setData(event.value);
            onValue(event.value);
          }}
          selectionMode="range"
          readOnlyInput
          pt={{
            root: { className: "h-full" },
            input: {
              root: { className: "w-60" },
            },
          }}
          hideOnRangeSelection
          showIcon
        />
        <button
          onClick={() => {
            setData(null);
            onValue(null);
          }}
          className="absolute hover:bg-gray-300/50 w-6 h-6 right-16 z-20 top-0 bottom-0 m-auto rounded-md active:bg-gray-400  flex 
    items-center justify-center  text-gray-600"
        >
          <CgClose />
        </button>
      </div>
    </div>
  );
}

export default memo(Calendar);
