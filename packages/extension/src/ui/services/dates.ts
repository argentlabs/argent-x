export const formatDate = (date: Date | string | number) =>
  new Date(date).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

export const formatDateTimeBase = (date: Date | string | number) =>
  new Date(date)
    .toLocaleDateString("en-GB", {
      hour: "numeric",
      minute: "numeric",
    })
    .replace(/,/g, "")

export const formatDateTime = (date: Date | string | number) =>
  new Date(date).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  })
