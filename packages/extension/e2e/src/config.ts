import path from "path"
type language = "en"
const appLanguage: language = (process.env.LANGUAGE as language) ?? "en"

export default {
  appLanguage,
  password: "MyP@ss3!",
  artifactsDir: path.resolve(__dirname, "../artifacts/playwright"),
  reportsDir: path.resolve(__dirname, "../artifacts/reports"),
  distDir: path.join(__dirname, "../../dist/"),
}
