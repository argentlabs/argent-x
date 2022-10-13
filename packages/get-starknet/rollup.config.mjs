import commonjs from "@rollup/plugin-commonjs"
import resolve from "@rollup/plugin-node-resolve"
import esbuild from "rollup-plugin-esbuild"
import generateDeclarations from "rollup-plugin-generate-declarations"

const production = !process.env.ROLLUP_WATCH

export default {
  input: "src/index.ts",
  output: [{ format: "cjs", dir: "dist/", sourcemap: !production }],
  external: ["starknet"],
  plugins: [
    // If you have external dependencies installed from
    // npm, you'll most likely need these plugins. In
    // some cases you'll need additional configuration -
    // consult the documentation for details:
    // https://github.com/rollup/plugins/tree/master/packages/commonjs
    resolve({
      browser: true,
      preferBuiltins: true,
    }),
    commonjs(),
    esbuild({
      minify: production,
    }),
    generateDeclarations(),
  ],
  watch: {
    clearScreen: false,
  },
}
