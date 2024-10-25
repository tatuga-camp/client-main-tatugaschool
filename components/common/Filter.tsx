import React, { memo, ReactNode, use, useEffect, useRef } from "react";
import {
  FaSortAmountDown,
  FaSortAmountDownAlt,
  FaSortAmountUp,
} from "react-icons/fa";
import { IoFilterSharp } from "react-icons/io5";
import useClickOutside from "../../hook/useClickOutside";

const menuFilter: {
  title: FilterTitle;
  orderBy: "asc" | "desc";
}[] = [
  {
    title: "Sort by Score",
    orderBy: "desc",
  },
  {
    title: "Sort by Name",
    orderBy: "desc",
  },
  {
    title: "Sort By Number",
    orderBy: "desc",
  },
];
export type FilterTitle = "Sort by Score" | "Sort by Name" | "Sort By Number";
type Props = {
  onValue: (
    value: { title: FilterTitle; orderBy: "asc" | "desc" } | undefined
  ) => void;
};
function Filter({ onValue }: Props) {
  const [filter, setFilter] = React.useState<
    {
      title: FilterTitle;
      orderBy: "asc" | "desc";
    }[]
  >(menuFilter);
  const filterRef = useRef<HTMLDivElement>(null);

  const [activeShow, setActiveShow] = React.useState(false);

  const [selectFilter, setSelectFilter] = React.useState<{
    title: FilterTitle;
    orderBy: "asc" | "desc";
  }>();

  useEffect(() => {
    onValue(selectFilter);
  }, [selectFilter]);

  useClickOutside(filterRef, () => {
    setActiveShow(false);
  });

  return (
    <div ref={filterRef} className="h-full relative">
      <button
        onClick={() => setActiveShow((prev) => !prev)}
        className="flex items-center h-full active:bg-gray-300/70 transition
       justify-center gap-1 px-5 py-1 rounded-md  hover:bg-gray-300/50"
      >
        <IoFilterSharp /> Filter
      </button>
      <div
        className={`   bg-white drop-shadow-md  transition-height
        ${activeShow ? "w-40 h-40" : " w-40 h-0"} overflow-clip
            absolute rounded-md pb-0  top-14 z-10 flex flex-col `}
      >
        {filter.map((menu, index) => (
          <button
            onClick={() => {
              setFilter((prev) => {
                return prev.map((list) => {
                  if (menu.title === list.title) {
                    return {
                      ...list,
                      orderBy: list.orderBy === "asc" ? "desc" : "asc",
                    };
                  } else {
                    return list;
                  }
                });
              });
              setSelectFilter(() => {
                return {
                  ...menu,
                  orderBy: menu.orderBy === "asc" ? "desc" : "asc",
                };
              });
            }}
            key={index}
            className={`flex ${
              menu.title === selectFilter?.title
                ? " gradient-bg text-white"
                : "bg-white hover:bg-gray-300/50"
            }  py-2 px-2 items-center text-sm justify-between  gap-1 `}
          >
            {menu.title}
            {menu?.orderBy === "desc" ? (
              <FaSortAmountDown />
            ) : (
              <FaSortAmountUp />
            )}
          </button>
        ))}
        <button
          onClick={() => {
            setSelectFilter(undefined);
          }}
          className={`flex py-2 px-2  items-center ${
            !selectFilter ? "g gradient-bg text-white" : " hover:bg-gray-300/50"
          } gap-1`}
        >
          Clear Filter
        </button>
      </div>
    </div>
  );
}

export default memo(Filter);
