const ROW_DELIMITER =
  "\n----------------------------------------------------------------\n"

export const formatDataForDownload = (data: { [key: string]: any }): string => {
  const title: string = `${ROW_DELIMITER}Application logs${ROW_DELIMITER}\n\n\n`
  const formattedData = Object.entries(data)
    .map(([key, value]) => {
      let formattedValue
      try {
        if (typeof value === "bigint") {
          formattedValue = value?.toString()
        } else if (typeof value === "string") {
          formattedValue = value
        } else {
          formattedValue = JSON.stringify(value, null, 2)
        }
      } catch (e) {
        console.error("Error while stringifying logs data", e)
      }
      return `${key}\n${formattedValue}\n`
    })
    .join(`${ROW_DELIMITER}\n`)

  return `${title}${formattedData}`
}

export const downloadFile = (data: string, filename: string): void => {
  const blob = new Blob([data], { type: "text/plain" })

  // Create a URL representing the Blob
  const url = URL.createObjectURL(blob)

  // Create a link element
  const link = document.createElement("a")
  link.href = url
  link.download = filename

  // Append the link to the body
  document.body.appendChild(link)

  // Simulate a click on the link
  link.click()

  // Remove the link from the body
  document.body.removeChild(link)
}

export const getBrowserName = () => {
  const userAgent = navigator.userAgent
  let browser = "Unknown Browser"

  if (userAgent.indexOf("Chrome") > -1) {
    browser = "Google Chrome"
  } else if (userAgent.indexOf("Safari") > -1) {
    browser = "Apple Safari"
  } else if (userAgent.indexOf("Firefox") > -1) {
    browser = "Mozilla Firefox"
  } else if (
    userAgent.indexOf("MSIE") > -1 ||
    userAgent.indexOf("Trident") > -1
  ) {
    browser = "Microsoft Internet Explorer"
  } else if (userAgent.indexOf("Edge") > -1) {
    browser = "Microsoft Edge"
  }

  return browser
}

export const getOSName = () => {
  const platform = navigator.platform
  let os = "Unknown OS"

  if (platform.indexOf("Win") > -1) {
    os = "Windows"
  } else if (platform.indexOf("Mac") > -1) {
    os = "MacOS"
  } else if (platform.indexOf("Linux") > -1) {
    os = "Linux"
  }

  return os
}
