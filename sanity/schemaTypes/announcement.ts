import { defineField, defineType } from "sanity";

export const announcement = defineType({
  name: "announcement",
  title: "Announcement",
  type: "document",
  groups: [
    { name: "english", title: "English", default: true },
    { name: "thai", title: "ไทย (Thai)" },
    { name: "settings", title: "Settings" },
  ],
  fields: [
    defineField({
      name: "titleEn",
      title: "Title (English)",
      type: "string",
      group: "english",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "bodyEn",
      title: "Body (English)",
      type: "array",
      of: [{ type: "block" }],
      group: "english",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "titleTh",
      title: "Title (Thai)",
      type: "string",
      group: "thai",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "bodyTh",
      title: "Body (Thai)",
      type: "array",
      of: [{ type: "block" }],
      group: "thai",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "type",
      title: "Type",
      type: "string",
      group: "settings",
      options: {
        list: [
          { title: "Feature", value: "feature" },
          { title: "Fix", value: "fix" },
          { title: "News", value: "news" },
          { title: "Announcement", value: "announcement" },
        ],
        layout: "radio",
      },
      initialValue: "feature",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "publishedAt",
      title: "Published at",
      type: "datetime",
      group: "settings",
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "coverImage",
      title: "Cover image",
      type: "image",
      group: "settings",
      options: { hotspot: true },
    }),
  ],
  preview: {
    select: { title: "titleEn", subtitle: "type", media: "coverImage" },
  },
  orderings: [
    {
      title: "Published date, newest first",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
});
