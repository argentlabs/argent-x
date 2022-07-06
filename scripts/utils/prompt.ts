import readline from "readline"

const readlineInterface = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

/** Prompt for user input */
const prompt = async (query: string) => {
  return new Promise((resolve) => {
    readlineInterface.question(query, resolve)
  })
}

export default prompt
