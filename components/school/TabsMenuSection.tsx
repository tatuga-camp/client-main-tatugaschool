import { useEffect, useState } from "react";
import { FC } from "react";
import { MemberOnSchool, School } from "@/interfaces";
import BasicInformationSection from "./BasicInformationSection";
import MemberSection from "./MemberSection";
import BillingPlanSection from "./BillingPlanSection";
import { useGetLanguage, useGetUser } from "../../react-query";
import { schoolDataLanguage } from "../../data/languages";
import { useRouter } from "next/router";
import { MenuSchool } from "../../data";

export interface TabsMenuSectionProps {
  school: School;
  members: MemberOnSchool[];
  onInvite: () => void;
}

const tabs = [
  { name: "Members" },
  { name: "Setting" },
  { name: "Subscription" },
] as const;

const TabsMenuSection: FC<TabsMenuSectionProps> = ({
  school,
  members,
  onInvite,
}) => {
  const language = useGetLanguage();
  const router = useRouter();
  const [activeTab, setActiveTab] =
    useState<(typeof tabs)[number]["name"]>("Members");
  const user = useGetUser();

  useEffect(() => {
    if (router.isReady) {
      setActiveTab(() => {
        const query = router.query.menu;
        const tabNames = tabs.map((tab) => tab.name);

        if (
          typeof query === "string" &&
          tabNames.includes(query as (typeof tabs)[number]["name"])
        ) {
          return query as (typeof tabs)[number]["name"];
        }

        return "Members";
      });
    }
  }, [router.isReady, router.query.menu]);

  return (
    <>
      <div className="flex px-10">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className={`pb-2 text-gray-600 ${
              activeTab === tab.name
                ? "border-b-2 border-primary-color px-5 font-semibold text-primary-color"
                : "px-5 hover:text-gray-800"
            }`}
          >
            {schoolDataLanguage[
              tab.name.toLowerCase() as keyof typeof schoolDataLanguage
            ](language.data ?? "en")}
          </button>
        ))}
      </div>

      {activeTab === "Members" && user.data && (
        <MemberSection
          onInvite={onInvite}
          user={user.data}
          schoolId={school.id}
        />
      )}
      {activeTab === "Setting" && <BasicInformationSection school={school} />}
      {activeTab === "Subscription" && (
        <BillingPlanSection schoolId={school.id} />
      )}
    </>
  );
};

export default TabsMenuSection;
