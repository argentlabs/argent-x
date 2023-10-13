import { resolve } from "path"

import { defineConfig, Plugin } from "vite"
import { spawnSync } from "child_process"

function createDeclarationFiles(): Plugin {
  return {
    name: "create-declaration-files",
    apply: "build",
    enforce: "post",

    closeBundle() {
      console.log("Generating declaration files...")
      console.time("Generated declaration files in")
      spawnSync("tsc", ["--emitDeclarationOnly"], {
        stdio: "inherit",
        cwd: __dirname,
      })
      // create entry file
      console.log("Creating entry file...")
      spawnSync(
        "echo",
        ["\"export * from './main'\"", ">", "./dist/web-sdk.d.ts"],
        {
          shell: true,
          stdio: "inherit",
          cwd: __dirname,
        },
      )

      console.timeEnd("Generated declaration files in")
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    emptyOutDir: false,
    target: "es2020",
    lib: {
      entry: resolve(__dirname, "src/main.ts"),
      name: "web-sdk",
      // the proper extensions will be added
      fileName: "web-sdk",
    },
  },
  plugins: [createDeclarationFiles()],
})
