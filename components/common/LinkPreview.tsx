import React from "react";

const LinkPreview = ({
  title,
  description,
  image,
  url,
}: {
  title: string;
  description: string;
  image: string;
  url: string;
}) => {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="mx-auto max-w-md overflow-hidden bg-white duration-300 md:max-w-2xl"
    >
      <div className="md:flex">
        <div className="md:flex-shrink-0">
          <img
            className="h-full w-16 object-cover"
            src={image}
            alt="Link preview"
          />
        </div>
        <div className="p-2">
          <div className="text-sm font-semibold uppercase tracking-wide text-indigo-500">
            {new URL(url).hostname}
          </div>
          <h1 className="mt-1 block text-base font-medium leading-tight text-black">
            {title}
          </h1>
        </div>
      </div>
    </a>
  );
};

export default LinkPreview;
