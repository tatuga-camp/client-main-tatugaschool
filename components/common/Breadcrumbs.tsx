import Link from "next/link";
import { IoChevronForward } from "react-icons/io5";

const Breadcrumbs = (props: {
  breadcrumbs: { label: string; href: string }[];
}) => {
  return (
    <nav aria-label="breadcrumb" className="hidden md:block">
      <ol className="flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium shadow-sm">
        {props.breadcrumbs.map((crumb, index) => {
          const isLast = index === props.breadcrumbs.length - 1;

          return (
            <li key={crumb.href} className="flex items-center">
              {index > 0 && <IoChevronForward className="mx-1 text-gray-400" />}
              {isLast ? (
                <span className="rounded-full bg-primary-color px-3 py-1 text-white shadow-sm">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="rounded-md px-2 py-1 text-gray-600 transition-all duration-200 hover:bg-blue-50 hover:text-primary-color"
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
