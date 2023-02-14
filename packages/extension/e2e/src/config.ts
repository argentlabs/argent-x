import path from "path"

export default {
  password: "MyP@ss3!",
  artifactsDir: path.resolve(__dirname, "../artifacts/playwright"),
  reportsDir: path.resolve(__dirname, "../artifacts/reports"),
  distDir: path.join(__dirname, "../../dist/"),
}
