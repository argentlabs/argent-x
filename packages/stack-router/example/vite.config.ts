import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"

export default defineConfig({
  root: __dirname,
  plugins: [react()],
  define: {
    "process.env": {},
  },
  server: {
    port: 3000,
  },
})
