import * as path from "path"

import type { TSESTree } from "@typescript-eslint/experimental-utils"
import * as eslint from "eslint"
import { minimatch } from "minimatch"

const REPO_ROOT = path.resolve(__dirname, "../../../")

interface Option {
  target: string
  disallow: string[]
  message?: string
}

/**
 * eslint rule to check imports are allowed against specific patterns
 *
 * @example
 * ```json
 * "local/code-import-patterns": [
 *   "warn",
 *   {
 *     target: "packages/extension/src/ui/**",
 *     disallow: ["packages/extension/src/background/**"],
 *     message: "import background from ui is disallowed",
 *   },
 * ]
 * ```
 */

const rule: eslint.Rule.RuleModule = {
  meta: {
    type: "problem",
    messages: {
      badImport: "{{message}}",
    },
    docs: {
      description: "Disallow imports e.g. UI code from background process",
      recommended: true,
    },
    schema: {
      type: "array",
      items: {
        type: "object",
        properties: {
          target: { type: "string" },
          disallow: {
            type: "array",
            items: { type: "string" },
          },
          message: { type: "string" },
        },
        required: ["target", "disallow"],
        additionalProperties: false,
      },
    },
  },

  create: (context) => {
    const options: Option[] = context.options
    const relativeFilename = path.relative(REPO_ROOT, context.getFilename())

    for (const option of options) {
      if (minimatch(relativeFilename, option.target)) {
        return {
          ImportDeclaration: (declarationNode) => {
            const node = (<TSESTree.ImportDeclaration>declarationNode).source
            if (node.type === "Literal" && typeof node.value === "string") {
              checkImport(context, option, node)
            }
          },
        }
      }
    }

    return {}
  },
}

function checkImport(
  context: eslint.Rule.RuleContext,
  option: Option,
  node: TSESTree.StringLiteral,
) {
  const importPath = node.value
  const sourceFileBase = path.dirname(context.getFilename())
  const fullImportPath = path.resolve(sourceFileBase, importPath)
  const rootBasedImportPath = path.relative(REPO_ROOT, fullImportPath)

  for (const pattern of option.disallow) {
    if (
      minimatch(rootBasedImportPath, pattern) ||
      minimatch(importPath, pattern)
    ) {
      const defaultMessage = `import ${option.disallow.join(" or ")} from ${
        option.target
      } is disallowed`
      context.report({
        loc: node.loc,
        messageId: "badImport",
        data: {
          message: option.message || defaultMessage,
        },
      })
      return
    }
  }
}

export default rule
