import path from "path"

export default {
  artifactsDir: path.resolve(__dirname, "../artifacts/playwright"),
  reportsDir: path.resolve(__dirname, "../artifacts/reports"),
  distDir: path.join(__dirname, "../../dist/"),
}
