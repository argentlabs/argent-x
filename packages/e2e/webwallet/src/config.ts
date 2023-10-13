import path from "path"

export default {
  validLogin: {
    email: "testuser@mail.com",
    pin: "1111111",
    password: "myNewPass12!",
  },
  url: "http://localhost:3005",
  artifactsDir: path.resolve(__dirname, "../../artifacts/playwright"),
  reportsDir: path.resolve(__dirname, "../../artifacts/reports"),
}
