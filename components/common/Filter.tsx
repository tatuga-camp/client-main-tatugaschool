import React, { memo, useEffect, useRef } from "react";
import { FaSortAmountDown, FaSortAmountUp } from "react-icons/fa";
import { IoFilterSharp } from "react-icons/io5";
import { MdCheck } from "react-icons/md";
import useClickOutside from "../../hook/useClickOutside";
import { studentPointsLanguage } from "../../data/languages";
import { Language } from "../../interfaces";

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

// The titles double as the persisted sort-config value, so only the display
// label is translated.
const filterLabel = (title: FilterTitle, lang: Language) => {
  switch (title) {
    case "Sort by Score":
      return studentPointsLanguage.sortByScore(lang);
    case "Sort by Name":
      return studentPointsLanguage.sortByName(lang);
    case "Sort By Number":
      return studentPointsLanguage.sortByNumber(lang);
  }
};

type Props = {
  onClick: (
    value: { title: FilterTitle; orderBy: "asc" | "desc" } | undefined,
  ) => void;
  value: { title: FilterTitle; orderBy: "asc" | "desc" } | undefined;
  lang?: Language;
};
function Filter({ value, onClick, lang = "en" }: Props) {
  const [filter, setFilter] = React.useState<
    {
      title: FilterTitle;
      orderBy: "asc" | "desc";
    }[]
  >(menuFilter);
  const filterRef = useRef<HTMLDivElement>(null);

  const [activeShow, setActiveShow] = React.useState(false);

  const [selectFilter, setSelectFilter] = React.useState<
    | {
        title: FilterTitle;
        orderBy: "asc" | "desc";
      }
    | undefined
  >(value);

  useEffect(() => {
    setSelectFilter(value);
    if (value) {
      setFilter((prev) => {
        return prev.map((f) => {
          if (f.title === value.title) {
            return {
              ...f,
              orderBy: value.orderBy,
            };
          }
          return f;
        });
      });
    }
  }, [value]);

  useClickOutside(filterRef, () => {
    setActiveShow(false);
  });

  return (
    <div ref={filterRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={activeShow}
        onClick={() => setActiveShow((prev) => !prev)}
        className={`flex h-10 items-center justify-center gap-1.5 rounded-xl border px-3 text-sm font-semibold transition-colors ${
          selectFilter
            ? "border-primary-color/30 bg-primary-color/5 text-primary-color"
            : "border-gray-200 bg-white text-icon-color hover:bg-background-color"
        }`}
      >
        {selectFilter ? (
          <>
            {selectFilter.orderBy === "desc" ? (
              <FaSortAmountDown />
            ) : (
              <FaSortAmountUp />
            )}
            {filterLabel(selectFilter.title, lang)}
          </>
        ) : (
          <>
            <IoFilterSharp />
            {studentPointsLanguage.sort(lang)}
          </>
        )}
      </button>
      {activeShow && (
        <div
          role="menu"
          className="absolute right-0 top-12 z-30 flex w-52 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white p-1 shadow-lg"
        >
          {filter.map((menu, index) => {
            const isActive = menu.title === selectFilter?.title;
            return (
              <button
                type="button"
                role="menuitem"
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
                  onClick({
                    title: menu.title,
                    orderBy: menu.orderBy === "asc" ? "desc" : "asc",
                  });
                  setSelectFilter(() => {
                    return {
                      ...menu,
                      orderBy: menu.orderBy === "asc" ? "desc" : "asc",
                    };
                  });
                }}
                key={index}
                className={`flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-primary-color/10 font-semibold text-primary-color"
                    : "text-icon-color hover:bg-background-color"
                }`}
              >
                {filterLabel(menu.title, lang)}
                {menu?.orderBy === "desc" ? (
                  <FaSortAmountDown className="text-gray-400" />
                ) : (
                  <FaSortAmountUp className="text-gray-400" />
                )}
              </button>
            );
          })}
          <div className="my-1 h-px bg-gray-100" />
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onClick(undefined);
              setSelectFilter(undefined);
              setActiveShow(false);
            }}
            className={`flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm transition-colors ${
              !selectFilter
                ? "bg-primary-color/10 font-semibold text-primary-color"
                : "text-icon-color hover:bg-background-color"
            }`}
          >
            {studentPointsLanguage.defaultOrder(lang)}
            {!selectFilter && <MdCheck />}
          </button>
        </div>
      )}
    </div>
  );
}

export default memo(Filter);
