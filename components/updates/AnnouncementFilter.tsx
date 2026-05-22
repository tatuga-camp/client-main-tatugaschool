import { Language } from "../../interfaces";
import { updatesLanguageData } from "../../data/languages";
import { AnnouncementType } from "../../services/announcement";

export type FilterValue = AnnouncementType | "all";

const filters: { value: FilterValue; label: (language: Language) => string }[] =
  [
    { value: "all", label: updatesLanguageData.filterAll },
    { value: "feature", label: updatesLanguageData.filterFeature },
    { value: "fix", label: updatesLanguageData.filterFix },
    { value: "news", label: updatesLanguageData.filterNews },
    { value: "announcement", label: updatesLanguageData.filterAnnouncement },
  ];

type Props = {
  active: FilterValue;
  onChange: (value: FilterValue) => void;
  language: Language;
};

function AnnouncementFilter({ active, onChange, language }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onChange(filter.value)}
          aria-pressed={active === filter.value}
          className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
            active === filter.value
              ? "border-primary-color bg-primary-color text-white"
              : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
          }`}
        >
          {filter.label(language)}
        </button>
      ))}
    </div>
  );
}

export default AnnouncementFilter;
