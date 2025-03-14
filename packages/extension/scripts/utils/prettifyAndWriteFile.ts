import fs from "fs-extra"
import prettier from "prettier"

export async function prettifyAndWriteFile(filepath: string, data: string) {
  const options = await prettier.resolveConfig(filepath)
  const formatted = await prettier.format(data, {
    ...options,
    filepath,
  })
  await fs.writeFile(filepath, formatted, "utf8")
}
