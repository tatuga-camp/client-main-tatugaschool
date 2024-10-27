import { FC } from "react";
import MemberHeader from "./MemberHeader";
import MemberTable from "./MemberTable";
import { MemberOnSchool } from "@/interfaces";

export interface MemberSectionProps {
  members: MemberOnSchool[];
  onInvite: () => void;
}

const MemberSection: FC<MemberSectionProps> = ({ members, onInvite }) => {
  return (
    <div className="bg-white rounded-lg">
      <MemberHeader members={members} onInvite={onInvite} />
      <MemberTable members={members} />
    </div>
  );
};

export default MemberSection;
