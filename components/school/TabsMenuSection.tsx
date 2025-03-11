import { useState } from "react";
import { FC } from "react";
import { MemberOnSchool, School } from "@/interfaces";
import BasicInformationSection from "./BasicInformationSection";
import MemberSection from "./MemberSection";
import BillingPlanSection from "./BillingPlanSection";
import { useGetLanguage, useGetUser } from "../../react-query";
import { schoolDataLanguage } from "../../data/languages";

export interface TabsMenuSectionProps {
  school: School;
  members: MemberOnSchool[];
  onInvite: () => void;
}

const tabs = [
  { name: "members" },
  { name: "basicInfo" },
  { name: "billing" },
] as const;

const TabsMenuSection: FC<TabsMenuSectionProps> = ({
  school,
  members,
  onInvite,
}) => {
  const language = useGetLanguage();
  const [activeTab, setActiveTab] =
    useState<(typeof tabs)[number]["name"]>("members");
  const user = useGetUser();

  return (
    <>
      <div className="flex  px-10">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className={`text-gray-600 pb-2 ${
              activeTab === tab.name
                ? "text-primary-color font-semibold border-b-2 border-primary-color px-5"
                : "hover:text-gray-800 px-5"
            }`}
          >
            {schoolDataLanguage[tab.name as keyof typeof schoolDataLanguage](
              language.data ?? "en"
            )}
          </button>
        ))}
      </div>

      {activeTab === "members" && user.data && (
        <MemberSection
          onInvite={onInvite}
          user={user.data}
          schoolId={school.id}
        />
      )}
      {activeTab === "basicInfo" && <BasicInformationSection school={school} />}
      {activeTab === "billing" && <BillingPlanSection schoolId={school.id} />}
    </>
  );
};

export default TabsMenuSection;
