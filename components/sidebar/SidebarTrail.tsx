import Image from "next/image";
import Link from "next/link";
import React from "react";
import { BsPeopleFill } from "react-icons/bs";
import { SiGoogleclassroom } from "react-icons/si";
import { defaultBlurHash } from "../../data";
import {
  useGetClassroom,
  useGetSchool,
  useGetSubject,
} from "../../react-query";
import { decodeBlurhashToCanvas } from "../../utils";
import PlanBadge from "../common/PlanBadge";

export type TrailNode = {
  kind: "school" | "classroom" | "subject";
  id: string;
};

type Props = { trail: TrailNode[]; onNavigate?: () => void };
type RowProps = { node: TrailNode; current: boolean; onNavigate?: () => void };

const INDENT = ["pl-0", "pl-4", "pl-8"];
const CONNECTOR_LEFT = ["", "left-2.5", "left-[1.625rem]"];

/** Stacked "you are here" trail: School › Classroom › Subject. */
function SidebarTrail({ trail, onNavigate }: Props) {
  return (
    <nav aria-label="Location" className="w-full font-Anuphan">
      <ol className="flex w-full flex-col gap-0.5">
        {trail.map((node, index) => {
          const depth = Math.min(index, INDENT.length - 1);
          return (
            <li
              key={`${node.kind}-${node.id}`}
              className={`relative min-w-0 ${INDENT[depth]}`}
            >
              {depth > 0 && (
                <span
                  aria-hidden
                  className={`absolute bottom-1/2 ${CONNECTOR_LEFT[depth]} h-5 w-1.5 rounded-bl-md border-b border-l border-icon-color/20`}
                />
              )}
              <TrailRow
                node={node}
                current={index === trail.length - 1}
                onNavigate={onNavigate}
              />
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function TrailRow(props: RowProps) {
  if (props.node.kind === "school") return <SchoolTrailRow {...props} />;
  if (props.node.kind === "classroom") return <ClassroomTrailRow {...props} />;
  return <SubjectTrailRow {...props} />;
}

function SchoolTrailRow({ node, current, onNavigate }: RowProps) {
  const school = useGetSchool({ schoolId: node.id });
  return (
    <TrailRowShell
      current={current}
      onNavigate={onNavigate}
      href={`/school/${node.id}`}
      label={school.data?.title}
      badge={school.data ? <PlanBadge plan={school.data.plan} /> : undefined}
      leading={
        <span className="relative h-8 w-8 overflow-hidden rounded-full bg-white ring-1 ring-icon-color/10">
          <Image
            fill
            sizes="32px"
            src={school.data?.logo ?? "/favicon.ico"}
            className="object-cover"
            alt={`logo ${school.data?.title ?? ""}`}
            placeholder="blur"
            blurDataURL={decodeBlurhashToCanvas(
              school.data?.blurHash ?? defaultBlurHash,
            )}
          />
        </span>
      }
    />
  );
}

function ClassroomTrailRow({ node, current, onNavigate }: RowProps) {
  const classroom = useGetClassroom({ classId: node.id });
  return (
    <TrailRowShell
      current={current}
      onNavigate={onNavigate}
      href={`/classroom/${node.id}`}
      label={classroom.data?.title}
      leading={<BsPeopleFill className="text-primary-color" />}
    />
  );
}

function SubjectTrailRow({ node, current, onNavigate }: RowProps) {
  const subject = useGetSubject({ subjectId: node.id });
  return (
    <TrailRowShell
      current={current}
      onNavigate={onNavigate}
      href={`/subject/${node.id}`}
      label={subject.data?.title}
      leading={<SiGoogleclassroom className="text-primary-color" />}
    />
  );
}

function TrailRowShell({
  current,
  onNavigate,
  href,
  label,
  leading,
  badge,
}: {
  current: boolean;
  onNavigate?: () => void;
  href: string;
  label?: string;
  leading: React.ReactNode;
  badge?: React.ReactNode;
}) {
  const content = (
    <>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center">
        {leading}
      </span>
      {label ? (
        <span title={label} className="min-w-0 flex-1 truncate text-left">
          {label}
        </span>
      ) : (
        <span className="h-3 w-24 animate-pulse rounded bg-icon-color/10" />
      )}
      {badge && <span className="shrink-0">{badge}</span>}
    </>
  );

  const base =
    "flex w-full min-w-0 items-center gap-2 rounded-xl px-1.5 py-1 text-sm";

  if (current) {
    return (
      <div
        aria-current="location"
        className={`${base} bg-primary-color/10 font-semibold text-icon-color`}
      >
        {content}
      </div>
    );
  }
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`${base} text-icon-color/80 transition-colors hover:bg-primary-color/10 hover:text-icon-color`}
    >
      {content}
    </Link>
  );
}

export default SidebarTrail;
