export const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[-]+/g, "-")
    .replace(/[^\w-]+/g, "")
