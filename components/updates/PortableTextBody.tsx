import {
  PortableText,
  type PortableTextComponents,
} from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="mb-3 leading-relaxed text-gray-700">{children}</p>
    ),
    h1: ({ children }) => (
      <h1 className="mb-3 mt-4 text-2xl font-bold text-gray-800">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="mb-2 mt-4 text-xl font-bold text-gray-800">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="mb-2 mt-3 text-lg font-semibold text-gray-800">
        {children}
      </h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-3 border-l-4 border-primary-color/40 pl-4 italic text-gray-600">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="mb-3 list-disc pl-6 text-gray-700">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="mb-3 list-decimal pl-6 text-gray-700">{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li className="mb-1">{children}</li>,
    number: ({ children }) => <li className="mb-1">{children}</li>,
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-semibold text-gray-800">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
    link: ({ children, value }) => {
      const href = (value as { href?: string } | undefined)?.href ?? "#";
      return (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="text-primary-color underline hover:text-primary-color-hover"
        >
          {children}
        </a>
      );
    },
  },
};

function PortableTextBody({ value }: { value: PortableTextBlock[] }) {
  return (
    <div className="text-sm md:text-base">
      <PortableText value={value} components={components} />
    </div>
  );
}

export default PortableTextBody;
