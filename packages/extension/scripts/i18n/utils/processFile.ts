import fs from "fs-extra"
import path from "path"
import * as parser from "@babel/parser"
import traverse from "@babel/traverse"
import generate from "@babel/generator"
import * as t from "@babel/types"
import type { NodePath } from "@babel/traverse"
import type { State, JSXNode } from "./types"
import type {
  VariableDeclarator,
  ArrowFunctionExpression,
  FunctionExpression,
  JSXElement,
  JSXFragment,
  JSXSpreadChild,
} from "@babel/types"
import { shouldLocalize } from "./shouldLocalize"
import {
  cleanTextContent,
  generateTranslationKey,
  getVariableName,
  isWhitespaceExpression,
  startsWithUppercase,
} from "./utils"
import prettier from "prettier"

// Main function to process a React component file
export async function processFile(filePath: string) {
  console.log("Processing file:", filePath)
  const content = fs.readFileSync(filePath, "utf-8")
  const componentName = path.basename(filePath, path.extname(filePath))
  return await processFileContent({ content, componentName })
}

export async function processFileContent({
  content,
  componentName,
}: {
  content: string
  componentName: string
}) {
  const translation: Record<string, string> = {}
  let needsTranslation = false
  // Track which components need translation
  const componentsNeedingTranslation = new Set<string>()

  const ast = parser.parse(content, {
    sourceType: "module",
    plugins: ["jsx", "typescript"],
  })

  // First pass: collect all translations and mark components that need them
  traverse(ast, {
    JSXElement(path: NodePath<JSXNode>) {
      const foundTranslation = processJSXElement(path, {
        translation,
        componentName,
      })
      if (foundTranslation) {
        needsTranslation = true
        // Find the parent function component
        let currentPath: NodePath | null = path
        while (
          currentPath &&
          !t.isFunctionDeclaration(currentPath.node) &&
          !t.isVariableDeclarator(currentPath.node) &&
          !t.isArrowFunctionExpression(currentPath.node) &&
          !t.isFunctionExpression(currentPath.node)
        ) {
          currentPath = currentPath.parentPath
        }
        if (currentPath) {
          // Handle function declarations
          if (
            t.isFunctionDeclaration(currentPath.node) &&
            currentPath.node.id
          ) {
            componentsNeedingTranslation.add(currentPath.node.id.name)
          }
          // Handle variable declarators
          else if (t.isVariableDeclarator(currentPath.node)) {
            // For variable declarations, we need to find the parent function
            let parentPath: NodePath | null = currentPath.parentPath
            while (
              parentPath &&
              !t.isFunctionDeclaration(parentPath.node) &&
              !t.isArrowFunctionExpression(parentPath.node) &&
              !t.isFunctionExpression(parentPath.node)
            ) {
              parentPath = parentPath.parentPath
            }
            if (parentPath) {
              if (
                t.isFunctionDeclaration(parentPath.node) &&
                parentPath.node.id
              ) {
                componentsNeedingTranslation.add(parentPath.node.id.name)
              } else if (
                (t.isArrowFunctionExpression(parentPath.node) ||
                  t.isFunctionExpression(parentPath.node)) &&
                t.isVariableDeclarator(parentPath.parentPath?.node) &&
                t.isIdentifier(parentPath.parentPath.node.id)
              ) {
                componentsNeedingTranslation.add(
                  parentPath.parentPath.node.id.name,
                )
              }
            }
          }
          // Handle arrow functions and function expressions
          else if (
            (t.isArrowFunctionExpression(currentPath.node) ||
              t.isFunctionExpression(currentPath.node)) &&
            t.isVariableDeclarator(currentPath.parentPath?.node) &&
            t.isIdentifier(currentPath.parentPath.node.id)
          ) {
            componentsNeedingTranslation.add(
              currentPath.parentPath.node.id.name,
            )
          }
        }
      }
    },
    CallExpression(path) {
      // Handle useMemo and similar hooks
      if (
        t.isIdentifier(path.node.callee) &&
        (path.node.callee.name === "useMemo" ||
          path.node.callee.name === "useCallback")
      ) {
        const [callback] = path.node.arguments
        if (
          t.isArrowFunctionExpression(callback) ||
          t.isFunctionExpression(callback)
        ) {
          // Check if the callback contains JSX with translations
          let foundTranslation = false
          traverse(
            callback,
            {
              JSXElement(jsxPath) {
                if (
                  processJSXElement(jsxPath, { translation, componentName })
                ) {
                  foundTranslation = true
                }
              },
            },
            path.scope,
            path,
          )

          if (foundTranslation) {
            needsTranslation = true
            // Find the parent function component
            let currentPath: NodePath | null = path
            while (
              currentPath &&
              !t.isFunctionDeclaration(currentPath.node) &&
              !t.isVariableDeclarator(currentPath.node)
            ) {
              currentPath = currentPath.parentPath
            }
            if (currentPath) {
              if (
                t.isFunctionDeclaration(currentPath.node) &&
                currentPath.node.id
              ) {
                componentsNeedingTranslation.add(currentPath.node.id.name)
              } else if (
                t.isVariableDeclarator(currentPath.node) &&
                t.isIdentifier(currentPath.node.id)
              ) {
                // For hooks, also check the parent function
                let parentPath: NodePath | null = currentPath.parentPath
                while (
                  parentPath &&
                  !t.isFunctionDeclaration(parentPath.node)
                ) {
                  parentPath = parentPath.parentPath
                }
                if (
                  parentPath &&
                  t.isFunctionDeclaration(parentPath.node) &&
                  parentPath.node.id
                ) {
                  componentsNeedingTranslation.add(parentPath.node.id.name)
                }
              }
            }
          }
        }
      }
    },
    ArrayExpression(path) {
      // Only process arrays that are part of a property assignment or variable declaration
      if (
        t.isObjectProperty(path.parent) ||
        t.isVariableDeclarator(path.parent)
      ) {
        const foundTranslation = processArrayLiteral(path, {
          translation,
          componentName,
        })
        if (foundTranslation) {
          needsTranslation = true
          // Find the parent function component
          let currentPath: NodePath | null = path
          while (
            currentPath &&
            !t.isFunctionDeclaration(currentPath.node) &&
            !t.isVariableDeclarator(currentPath.node)
          ) {
            currentPath = currentPath.parentPath
          }
          if (currentPath) {
            if (
              t.isFunctionDeclaration(currentPath.node) &&
              currentPath.node.id
            ) {
              componentsNeedingTranslation.add(currentPath.node.id.name)
            } else if (
              t.isVariableDeclarator(currentPath.node) &&
              t.isIdentifier(currentPath.node.id)
            ) {
              // For array literals, also check the parent function
              let parentPath: NodePath | null = currentPath.parentPath
              while (parentPath && !t.isFunctionDeclaration(parentPath.node)) {
                parentPath = parentPath.parentPath
              }
              if (
                parentPath &&
                t.isFunctionDeclaration(parentPath.node) &&
                parentPath.node.id
              ) {
                componentsNeedingTranslation.add(parentPath.node.id.name)
              }
            }
          }
        }
      }
    },
  })

  // Only add i18next import and hook if we found translation
  if (Object.keys(translation).length > 0) {
    needsTranslation = true

    // Add i18next import if not present
    let hasI18nImport = false
    traverse(ast, {
      ImportDeclaration(path: NodePath<JSXNode>) {
        if (path.node.source?.value === "react-i18next") {
          hasI18nImport = true
        }
      },
    })

    if (!hasI18nImport) {
      ast.program.body.unshift(
        t.importDeclaration(
          [
            t.importSpecifier(
              t.identifier("useTranslation"),
              t.identifier("useTranslation"),
            ),
          ],
          t.stringLiteral("react-i18next"),
        ),
      )
    }

    // Add useTranslation hook to components that need it
    traverse(ast, {
      // Handle forwardRef components
      CallExpression(path) {
        if (
          t.isIdentifier(path.node.callee) &&
          path.node.callee.name === "forwardRef"
        ) {
          const [forwardRefArg] = path.node.arguments
          if (
            t.isArrowFunctionExpression(forwardRefArg) ||
            t.isFunctionExpression(forwardRefArg)
          ) {
            // Convert pure JSX return to block if needed
            convertPureJsxToBlock(forwardRefArg)

            const functionBody = forwardRefArg.body
            if (t.isBlockStatement(functionBody)) {
              // Only add hook if this component needs translation
              let currentPath: NodePath | null = path
              while (currentPath && !t.isVariableDeclarator(currentPath.node)) {
                currentPath = currentPath.parentPath
              }
              if (
                currentPath &&
                t.isVariableDeclarator(currentPath.node) &&
                t.isIdentifier(currentPath.node.id)
              ) {
                if (
                  componentsNeedingTranslation.has(currentPath.node.id.name)
                ) {
                  addTranslationHook(functionBody)
                }
              }
            }
          }
        }
      },

      // Handle function declarations (function MyComponent() { ... })
      FunctionDeclaration(path) {
        if (path.node.id && t.isIdentifier(path.node.id)) {
          // Only add hook to component functions that need translation
          if (componentsNeedingTranslation.has(path.node.id.name)) {
            // Convert pure JSX return to block if needed
            if (
              t.isArrowFunctionExpression(path.node) ||
              t.isFunctionExpression(path.node)
            ) {
              convertPureJsxToBlock(path.node)
            }

            const functionBody = path.node.body
            if (t.isBlockStatement(functionBody)) {
              addTranslationHook(functionBody)
            }
          }
        }
      },

      // Handle arrow functions (const MyComponent = () => { ... })
      VariableDeclarator(path) {
        const node = path.node as VariableDeclarator
        if (
          t.isIdentifier(node.id) &&
          componentsNeedingTranslation.has(node.id.name) &&
          (t.isArrowFunctionExpression(node.init) ||
            t.isFunctionExpression(node.init))
        ) {
          const functionNode = node.init as
            | ArrowFunctionExpression
            | FunctionExpression

          // Convert pure JSX return to block if needed
          convertPureJsxToBlock(functionNode)

          const functionBody = functionNode.body
          if (t.isBlockStatement(functionBody)) {
            addTranslationHook(functionBody)
          }
        }
      },
    })
  }

  // Generate the modified code
  const { code } = generate(ast, {
    retainLines: true,
    comments: true,
  })

  // Format the code with prettier to make it nicer in test snapshots
  const formatted = await prettier.format(code, {
    parser: "typescript",
    printWidth: 80,
    singleQuote: false,
    trailingComma: "all",
  })

  // Sort translations by key for consistent ordering
  const sortedTranslation = Object.keys(translation)
    .sort()
    .reduce((acc: Record<string, string>, key) => {
      acc[key] = translation[key]
      return acc
    }, {})

  return {
    code: formatted,
    translation:
      Object.keys(sortedTranslation).length > 0 ? sortedTranslation : {},
    needsTranslation,
  }
}

// Helper to extract and translate string literals from any expression
function extractAndTranslateString(
  node: t.Node,
  state: State,
): { foundTranslation: boolean; translatedNode: t.Expression | null } {
  const { translation, componentName } = state
  let foundTranslation = false
  let translatedNode: t.Expression | null = null

  // Handle direct string literals
  if (t.isStringLiteral(node)) {
    const text = cleanTextContent(node.value)
    if (shouldLocalize(text)) {
      const key = generateTranslationKey(text, componentName)
      translation[key] = text
      foundTranslation = true
      translatedNode = t.callExpression(t.identifier("t"), [
        t.stringLiteral(key),
      ])
    }
  }
  // Handle template literals with no interpolation
  else if (t.isTemplateLiteral(node) && node.quasis.length === 1) {
    const text = cleanTextContent(node.quasis[0].value.raw)
    if (shouldLocalize(text)) {
      const key = generateTranslationKey(text, componentName)
      translation[key] = text
      foundTranslation = true
      translatedNode = t.callExpression(t.identifier("t"), [
        t.stringLiteral(key),
      ])
    }
  }
  // Handle conditional expressions (ternaries)
  else if (t.isConditionalExpression(node)) {
    const consequentResult = extractAndTranslateString(node.consequent, state)
    const alternateResult = extractAndTranslateString(node.alternate, state)

    if (consequentResult.foundTranslation || alternateResult.foundTranslation) {
      foundTranslation = true
      translatedNode = t.conditionalExpression(
        node.test,
        consequentResult.translatedNode || node.consequent,
        alternateResult.translatedNode || node.alternate,
      )
    }
  }

  return { foundTranslation, translatedNode }
}

// Process JSX strings and interpolations
function processJSXElement(path: NodePath<JSXNode>, state: State): boolean {
  const { translation, componentName } = state
  let foundTranslation = false

  if (!t.isJSXElement(path.node)) {
    return false
  }

  const element = path.node as t.JSXElement

  // Process JSX attributes
  element.openingElement.attributes.forEach((attr) => {
    if (t.isJSXAttribute(attr) && attr.value) {
      // Handle string literals in attributes
      if (t.isStringLiteral(attr.value)) {
        const text = cleanTextContent(attr.value.value)
        // For attributes, we need both shouldLocalize and startsWithUppercase checks
        if (shouldLocalize(text) && startsWithUppercase(text)) {
          const key = generateTranslationKey(text, componentName)
          translation[key] = text
          attr.value = t.jsxExpressionContainer(
            t.callExpression(t.identifier("t"), [t.stringLiteral(key)]),
          )
          foundTranslation = true
        }
      }
      // Handle expressions in attributes (including ternaries)
      else if (t.isJSXExpressionContainer(attr.value)) {
        // For JSX attributes, we want to be more selective about what gets translated
        const attrName = attr.name.name.toString()
        const isTranslatableAttr = [
          "title",
          "subtitle",
          "description",
          "label",
          "placeholder",
          "alt",
          "aria-label",
        ].includes(attrName)

        if (isTranslatableAttr) {
          const { foundTranslation: found, translatedNode } =
            extractAndTranslateString(attr.value.expression, state)
          if (found && translatedNode) {
            attr.value.expression = translatedNode
            foundTranslation = true
          }
        }
      }
    }
  })

  // Process children
  const children = element.children
  const newChildren: Array<
    | t.JSXText
    | t.JSXExpressionContainer
    | t.JSXElement
    | t.JSXFragment
    | t.JSXSpreadChild
  > = []
  let currentGroup: Array<{
    type: "text" | "expression" | "separator"
    content: string | t.Expression | t.JSXElement
    index: number
    node: t.JSXText | t.JSXExpressionContainer | t.JSXElement
  }> = []

  for (let i = 0; i < children.length; i++) {
    const child = children[i]

    // Handle text content
    if (t.isJSXText(child)) {
      const text = cleanTextContent(child.value)
      if (text) {
        currentGroup.push({
          type: "text",
          content: text,
          index: i,
          node: child,
        })
      } else if (currentGroup.length > 0 && i === children.length - 1) {
        // Only process group at the end of children
        const translatedNode = processSegmentGroup(
          currentGroup,
          element,
          translation,
          componentName,
        )
        if (translatedNode) {
          newChildren.push(translatedNode)
          foundTranslation = true
        } else {
          currentGroup.forEach((item) => newChildren.push(item.node))
        }
        currentGroup = []
        newChildren.push(child)
      } else if (!currentGroup.length) {
        // Add standalone whitespace
        newChildren.push(child)
      }
    }
    // Handle expressions in JSX
    else if (t.isJSXExpressionContainer(child)) {
      // Special handling for control characters and unicode symbols
      if (t.isStringLiteral(child.expression)) {
        const text = child.expression.value
        // Check if the text contains any control characters or unicode symbols
        const hasControlChars = text.split("").some((char) => {
          const code = char.charCodeAt(0)
          return (
            code <= 0x1f ||
            (code >= 0x7f && code <= 0x9f) ||
            (code >= 0x2000 && code <= 0x3000)
          )
        })
        if (!shouldLocalize(text) || hasControlChars) {
          if (currentGroup.length > 0) {
            const translatedNode = processSegmentGroup(
              currentGroup,
              element,
              translation,
              componentName,
            )
            if (translatedNode) {
              newChildren.push(translatedNode)
              foundTranslation = true
            } else {
              currentGroup.forEach((item) => newChildren.push(item.node))
            }
            currentGroup = []
          }
          newChildren.push(child)
          continue
        }
      }

      // Handle conditional expressions and other complex expressions
      if (
        t.isConditionalExpression(child.expression) ||
        t.isCallExpression(child.expression) ||
        t.isMemberExpression(child.expression)
      ) {
        if (currentGroup.length > 0) {
          const translatedNode = processSegmentGroup(
            currentGroup,
            element,
            translation,
            componentName,
          )
          if (translatedNode) {
            newChildren.push(translatedNode)
            foundTranslation = true
          } else {
            currentGroup.forEach((item) => newChildren.push(item.node))
          }
          currentGroup = []
        }
        const { foundTranslation: found, translatedNode } =
          extractAndTranslateString(child.expression, state)
        if (found && translatedNode) {
          newChildren.push(t.jsxExpressionContainer(translatedNode))
          foundTranslation = true
        } else {
          newChildren.push(child)
        }
      }
      // Handle simple identifiers that can be used for interpolation
      else if (t.isIdentifier(child.expression)) {
        currentGroup.push({
          type: "expression",
          content: child.expression,
          index: i,
          node: child,
        })
      }
      // Handle other expressions
      else {
        if (currentGroup.length > 0) {
          const translatedNode = processSegmentGroup(
            currentGroup,
            element,
            translation,
            componentName,
          )
          if (translatedNode) {
            newChildren.push(translatedNode)
            foundTranslation = true
          } else {
            currentGroup.forEach((item) => newChildren.push(item.node))
          }
          currentGroup = []
        }
        newChildren.push(child)
      }
    }
    // Handle other JSX elements
    else {
      if (currentGroup.length > 0) {
        const translatedNode = processSegmentGroup(
          currentGroup,
          element,
          translation,
          componentName,
        )
        if (translatedNode) {
          newChildren.push(translatedNode)
          foundTranslation = true
        } else {
          currentGroup.forEach((item) => newChildren.push(item.node))
        }
        currentGroup = []
      }
      newChildren.push(child)
    }
  }

  // Process any remaining group
  if (currentGroup.length > 0) {
    const translatedNode = processSegmentGroup(
      currentGroup,
      element,
      translation,
      componentName,
    )
    if (translatedNode) {
      newChildren.push(translatedNode)
      foundTranslation = true
    } else {
      currentGroup.forEach((item) => newChildren.push(item.node))
    }
  }

  // Update the element's children with the new array
  element.children = newChildren

  return foundTranslation
}

// Helper function to process a group of segments
function processSegmentGroup(
  group: Array<{
    type: "text" | "expression" | "separator"
    content: string | t.Expression | t.JSXElement
    index: number
    node: t.JSXText | t.JSXExpressionContainer | t.JSXElement
  }>,
  element: t.JSXElement,
  translation: Record<string, string>,
  componentName: string,
): t.JSXExpressionContainer | null {
  // Skip if we only have expressions with no text content
  const hasOnlyExpressions = group.every((s) => s.type === "expression")
  const hasTextContent = group.some(
    (s) =>
      s.type === "text" &&
      typeof s.content === "string" &&
      shouldLocalize(s.content),
  )

  if (hasOnlyExpressions || !hasTextContent) {
    return null
  }

  // Build the translation text and collect expressions
  let translationText = ""
  const expressions: Array<{ expr: t.Expression; name: string }> = []

  group.forEach((segment, idx) => {
    if (segment.type === "text") {
      translationText += segment.content
    } else if (segment.type === "expression") {
      const expr = segment.content as t.Expression
      let varName = ""
      if (t.isMemberExpression(expr)) {
        const memberPath = []
        let current: t.Expression | t.Identifier = expr
        while (t.isMemberExpression(current)) {
          if (t.isIdentifier(current.property)) {
            memberPath.unshift(current.property.name)
          }
          current = current.object
        }
        if (t.isIdentifier(current)) {
          memberPath.unshift(current.name)
        }
        varName = memberPath.join("_")
      } else {
        varName = getVariableName(expr, expressions.length)
      }

      // Add space before variable if needed
      if (translationText.length > 0 && !translationText.endsWith(" ")) {
        translationText += " "
      }
      translationText += `{{${varName}}}`
      // Add space after variable if there's more text coming
      const nextSegment = group[idx + 1]
      if (nextSegment && nextSegment.type === "text") {
        const nextText =
          typeof nextSegment.content === "string"
            ? nextSegment.content.trimStart()
            : ""
        if (nextText && !translationText.endsWith(" ")) {
          translationText += " "
        }
      }

      expressions.push({ expr, name: varName })
    }
  })

  // Only check for localization on the text parts, not the expressions
  const textOnlyParts = group
    .filter((s) => s.type === "text")
    .map((s) => s.content)
    .join(" ")
    .trim()

  if (shouldLocalize(textOnlyParts)) {
    const key = generateTranslationKey(
      textOnlyParts,
      componentName,
      expressions.map((e) => e.name),
    )
    translation[key] = translationText.trim()

    // Create t() call with interpolation if needed
    const tCallArgs: Array<t.StringLiteral | t.ObjectExpression> = [
      t.stringLiteral(key),
    ]
    if (expressions.length > 0) {
      tCallArgs.push(
        t.objectExpression(
          expressions.map(({ expr, name }) =>
            t.isIdentifier(expr) && expr.name === name
              ? t.objectProperty(t.identifier(name), expr, false, true)
              : t.objectProperty(t.identifier(name), expr),
          ),
        ),
      )
    }

    return t.jsxExpressionContainer(
      t.callExpression(t.identifier("t"), tCallArgs),
    )
  }

  return null
}

// Helper function to convert pure JSX return to block statement
function convertPureJsxToBlock(
  functionNode: ArrowFunctionExpression | FunctionExpression,
): boolean {
  const functionBody = functionNode.body
  if (t.isJSXElement(functionBody) || t.isJSXFragment(functionBody)) {
    // Convert pure JSX return to block statement with return
    functionNode.body = t.blockStatement([t.returnStatement(functionBody)])
    return true
  }
  return false
}

// Helper function to add translation hook to a function body
function addTranslationHook(functionBody: t.BlockStatement) {
  const hasTranslationHook = functionBody.body.some(
    (node: t.Node) =>
      t.isVariableDeclaration(node) &&
      node.declarations.some(
        (dec: t.VariableDeclarator) =>
          t.isVariableDeclarator(dec) &&
          t.isCallExpression(dec.init) &&
          t.isIdentifier(dec.init.callee, { name: "useTranslation" }),
      ),
  )

  if (!hasTranslationHook) {
    // Add hook at the start of the component
    functionBody.body.unshift(
      t.variableDeclaration("const", [
        t.variableDeclarator(
          t.objectPattern([
            t.objectProperty(t.identifier("t"), t.identifier("t"), false, true), // Use shorthand
          ]),
          t.callExpression(t.identifier("useTranslation"), []),
        ),
      ]),
    )
  }
}

// Helper function to process array literals
function processArrayLiteral(
  path: NodePath<t.ArrayExpression>,
  state: State,
): boolean {
  const { translation, componentName } = state
  let foundTranslation = false

  path.node.elements.forEach((element, index) => {
    if (t.isStringLiteral(element)) {
      const text = element.value
      if (shouldLocalize(text)) {
        const key = generateTranslationKey(text, componentName)
        translation[key] = text
        path.node.elements[index] = t.callExpression(t.identifier("t"), [
          t.stringLiteral(key),
        ])
        foundTranslation = true
      }
    }
  })

  return foundTranslation
}
