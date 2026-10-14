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

type Props = { trail: TrailNode[] };
type RowProps = { node: TrailNode; current: boolean };

// Indent only from `lg`; the rail below it stacks centered icons.
const INDENT = ["lg:pl-0", "lg:pl-4", "lg:pl-8"];
const CONNECTOR_LEFT = ["", "lg:left-2.5", "lg:left-[1.625rem]"];

/** Stacked "you are here" trail: School › Classroom › Subject. */
function SidebarTrail({ trail }: Props) {
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
                  className={`absolute bottom-1/2 hidden ${CONNECTOR_LEFT[depth]} h-5 w-1.5 rounded-bl-md border-b border-l border-icon-color/20 lg:block`}
                />
              )}
              <TrailRow
                node={node}
                current={index === trail.length - 1}
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

function SchoolTrailRow({ node, current }: RowProps) {
  const school = useGetSchool({ schoolId: node.id });
  return (
    <TrailRowShell
      current={current}
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

function ClassroomTrailRow({ node, current }: RowProps) {
  const classroom = useGetClassroom({ classId: node.id });
  return (
    <TrailRowShell
      current={current}
      href={`/classroom/${node.id}`}
      label={classroom.data?.title}
      leading={<BsPeopleFill className="text-primary-color" />}
    />
  );
}

function SubjectTrailRow({ node, current }: RowProps) {
  const subject = useGetSubject({ subjectId: node.id });
  return (
    <TrailRowShell
      current={current}
      href={`/subject/${node.id}`}
      label={subject.data?.title}
      leading={<SiGoogleclassroom className="text-primary-color" />}
    />
  );
}

function TrailRowShell({
  current,
  href,
  label,
  leading,
  badge,
}: {
  current: boolean;
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
        <span className="hidden min-w-0 flex-1 truncate text-left lg:block">
          {label}
        </span>
      ) : (
        <span className="hidden h-3 w-24 animate-pulse rounded bg-icon-color/10 lg:block" />
      )}
      {badge && <span className="hidden shrink-0 lg:block">{badge}</span>}
    </>
  );

  const base =
    "flex w-full min-w-0 items-center justify-center gap-2 rounded-xl py-1 text-sm lg:justify-start lg:px-1.5";

  if (current) {
    return (
      <div
        aria-current="location"
        title={label}
        className={`${base} bg-primary-color/10 font-semibold text-icon-color`}
      >
        {content}
      </div>
    );
  }
  return (
    <Link
      href={href}
      title={label}
      className={`${base} text-icon-color/80 transition-colors hover:bg-primary-color/10 hover:text-icon-color`}
    >
      {content}
    </Link>
  );
}

export default SidebarTrail;
