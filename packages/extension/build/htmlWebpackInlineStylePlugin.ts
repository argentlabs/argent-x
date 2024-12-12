import type { Compiler, Compilation } from "webpack"
import HtmlWebpackPlugin from "html-webpack-plugin"
import CleanCSS from "clean-css"

interface HtmlPluginData {
  html: string
  outputName: string
  plugin: HtmlWebpackPlugin
}

/**
 * InlineStylePlugin
 *
 * This webpack plugin works in conjunction with HtmlWebpackPlugin to minify inline CSS styles
 * within <style> tags in HTML files. It hooks into HtmlWebpackPlugin's processing pipeline
 * to modify the HTML content before it's emitted.
 *
 * Key features:
 * - Uses CleanCSS to perform CSS minification
 * - Reduces the size of embedded styles without extracting them to external files
 * - Particularly useful for critical CSS that needs to be inlined for performance reasons
 *
 * Note: This plugin should be included in the webpack config after HtmlWebpackPlugin
 * to ensure it has access to the generated HTML.
 */

export class InlineStylePlugin {
  apply(compiler: Compiler): void {
    compiler.hooks.compilation.tap(
      "InlineStylePlugin",
      (compilation: Compilation) => {
        HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync(
          "InlineStylePlugin",
          (
            data: HtmlPluginData,
            cb: (error: Error | null, data: HtmlPluginData) => void,
          ) => {
            const cleancss = new CleanCSS()
            data.html = data.html.replace(
              /<style>([\s\S]*?)<\/style>/gi,
              (match: string, p1: string) => {
                const minified = cleancss.minify(p1).styles
                return `<style>${minified}</style>`
              },
            )
            cb(null, data)
          },
        )
      },
    )
  }
}
