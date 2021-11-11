import commonjs from "@rollup/plugin-commonjs"
import json from "@rollup/plugin-json"
import resolve from "@rollup/plugin-node-resolve"
import typescript from "@rollup/plugin-typescript"
import svelte from "rollup-plugin-svelte"
import { svelteSVG } from "rollup-plugin-svelte-svg"
import { terser } from "rollup-plugin-terser"
import sveltePreprocess from "svelte-preprocess"

const production = !process.env.ROLLUP_WATCH

export default {
  input: "src/index.ts",
  output: [{ format: "cjs", dir: "dist/", sourcemap: !production }],
  external: ["starknet"],
  plugins: [
    // SVGR to transform svg files into svelte components
    svelteSVG(),

    svelte({
      preprocess: sveltePreprocess(),
      emitCss: false,
      compilerOptions: {
        // enable run-time checks when not in production
        dev: !production,
      },
    }),

    json(),

    // If you have external dependencies installed from
    // npm, you'll most likely need these plugins. In
    // some cases you'll need additional configuration -
    // consult the documentation for details:
    // https://github.com/rollup/plugins/tree/master/packages/commonjs
    resolve({
      browser: true,
      dedupe: ["svelte"],
      preferBuiltins: true,
    }),
    commonjs(),
    typescript({
      sourceMap: !production,
      inlineSources: !production,
    }),

    // If we're building for production (npm run build
    // instead of npm run dev), minify
    production && terser(),
  ],
  watch: {
    clearScreen: false,
  },
}
