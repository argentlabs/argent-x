export const fileToString = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader()
    fileReader.onload = (event) => {
      const result = event?.target?.result
      if (result) {
        resolve(result.toString())
      } else {
        reject(new Error("Failed to read file"))
      }
    }
    fileReader.onerror = reject
    fileReader.readAsText(file)
  })
}
