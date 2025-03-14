import { ChatAnthropic } from "@langchain/anthropic"
import { PromptTemplate } from "@langchain/core/prompts"
import type { Runnable } from "@langchain/core/runnables"
import { RunnableSequence } from "@langchain/core/runnables"
import fs from "fs-extra"
import path from "path"
import { z } from "zod"
import { zodToJsonSchema } from "zod-to-json-schema"
import dotenv from "dotenv"
import { defaultTranslationFilePath, config } from "./config"

/**
 * This script is using Anthropic's Claude 3.5 Haiku model to translate the JSON file.
 *
 * TODO: This prompt works great for PoC, but if this is to be used more than one-time, look at
 * https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/prompt-improver
 * and use the Prompt Improver tool to improve the promp, or batch processing to reduce cost
 * https://docs.anthropic.com/en/docs/build-with-claude/batch-processing
 */

dotenv.config()

const MODEL_NAME = "claude-3-haiku-20240307"
const MAX_TOKENS = 4000
const TEMPERATURE = 0

/**
 * Larger values may hit issues with truncated responses from the model
 */
const CHUNK_SIZE = 8

const TARGET_LANGUAGES = {
  vi: "Vietnamese",
  zh_CN: "Chinese Simplified",
  tr: "Turkish",
  uk: "Ukrainian",
  ru: "Russian",
}

function cleanAndValidateJson(jsonString: string): string {
  // Remove any potential text before or after the JSON object
  const jsonMatch = jsonString.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error("No JSON object found in response")
  }

  let cleanJson = jsonMatch[0]

  try {
    // First try parsing as-is - if it's already valid JSON, just return it
    JSON.parse(cleanJson)
    return cleanJson
  } catch (e) {
    // If parsing fails, apply cleaning steps
    cleanJson = cleanJson
      .replace(/,(\s*[}\]])/g, "$1") // Remove trailing commas
      .replace(/\u2018|\u2019/g, "'") // Replace smart quotes
      .replace(/\u201C|\u201D/g, '"') // Replace smart double quotes
      .replace(/([^\\])\\'/g, "$1'") // Remove invalid single quote escapes
      .replace(/\\\\/g, "\\") // Fix double escapes

    // Only re-escape quotes if necessary
    try {
      JSON.parse(cleanJson)
      return cleanJson
    } catch (e) {
      // If still invalid, try standardizing quotes
      cleanJson = cleanJson
        .replace(/\\"/g, '"')
        .replace(/"/g, '\\"')
        .replace(/^([^{]*)({[\s\S]*?})([^}]*)$/, "$2") // Extract just the JSON object

      // Final validation
      JSON.parse(cleanJson)
      return cleanJson
    }
  }
}

function createTranslationChain(chunkSchema: z.ZodType) {
  const model = new ChatAnthropic({
    modelName: MODEL_NAME,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    temperature: TEMPERATURE,
    maxTokens: MAX_TOKENS,
  })

  const promptTemplate =
    PromptTemplate.fromTemplate(`You are an expert localization specialist translating a software interface from English to {target_language_name}. Focus on maintaining semantic meaning while adapting to local conventions and cultural context.

Core Requirements:
1. CRITICAL - Key Preservation:
   - You MUST keep all JSON keys EXACTLY as they appear - no modifications allowed
   - Example of what NOT to do:
     ❌ "youWillBeAble" -> "youWillBeAbleTo"    (changing the key)
     ❌ "confirmScreen" -> "confirm_screen"      (changing format)
   - Example of correct key preservation:
     ✓ "youWillBeAble": "Translation here"      (key stays exactly the same)
     ✓ "confirmScreen": "Translation here"      (key stays exactly the same)
   - If you modify ANY key names, the translation will be rejected

2. Technical Requirements:
   - Keep {{variableName}} exactly as is, including double braces
   - Preserve HTML tags if present
   - Don't modify any technical terms or code
   - NEVER escape single quotes with backslash
   - ONLY escape double quotes with backslash: \\"example\\"

3. Translation Guidelines:
   - Maintain a warm, user-friendly tone appropriate for software interfaces
   - Use standard {target_language_name} translations for common UI terms (buttons, menus, etc.)
   - Adapt idioms and expressions to local equivalents rather than translating literally
   - Consider cultural context while maintaining the original meaning
   - Ensure proper grammar, pluralization, and number formatting for {target_language_name}

4. Format Requirements:
   - Return ONLY valid JSON with no trailing commas
   - Keep all JSON keys EXACTLY as they appear in the source - never modify key names
   - Preserve the exact JSON structure and nesting
   - Maintain any existing spacing in strings
   - NEVER escape single quotes (')
   - ONLY escape double quotes with a single backslash: \\"example\\"
   - Never use unescaped quotes inside JSON string values

5. Quality Standards:
   - Ensure consistency in terminology throughout the translation
   - Verify that placeholders and variables remain functional
   - Double-check that no technical terms are translated
   - Confirm natural sentence flow in {target_language_name}
   - Verify all quotes in translated text are properly escaped
   - VERIFY EACH JSON KEY MATCHES THE SOURCE EXACTLY - no exceptions

Translate this JSON:
{source_json}

Remember: 
1. Return ONLY the translated JSON object with no additional text
2. Ensure it is valid JSON with properly escaped quotes and no trailing commas
3. DO NOT MODIFY ANY KEY NAMES - they must match the source exactly`)

  // Create a chain that logs the raw response
  const chainWithLogging = RunnableSequence.from([
    promptTemplate,
    model,
    async (response: any) => {
      console.log("\nRaw model response:", response.content)
      try {
        // Clean and validate the JSON response
        const cleanedJson = cleanAndValidateJson(response.content)
        const parsedJson = JSON.parse(cleanedJson)

        // Validate against our schema
        return chunkSchema.parse(parsedJson)
      } catch (error) {
        console.error("Failed to parse or validate JSON:", error)
        throw error
      }
    },
  ]).withConfig({
    runName: "translation",
    metadata: { schema: zodToJsonSchema(chunkSchema) },
  })

  return chainWithLogging
}

async function translateChunk(
  chain: Runnable<any>,
  chunk: Record<string, any>,
  targetLanguageName: string,
): Promise<Record<string, any>> {
  console.log(`\nTranslating chunk to ${targetLanguageName}...`)

  const response = await chain.invoke({
    target_language_name: targetLanguageName,
    source_json: JSON.stringify(chunk, null, 2),
  })

  return response
}

async function processTranslations(
  sourcePath: string,
  targetLanguage: string,
  targetLanguageName: string,
  outputPath: string,
) {
  // Read the source translation file
  const sourceContent = await fs.readFile(sourcePath, "utf-8")
  const translations = JSON.parse(sourceContent)

  // Get top-level keys
  const topLevelKeys = Object.keys(translations)
  const result: Record<string, any> = {}

  // Process in chunks
  for (let i = 0; i < topLevelKeys.length; i += CHUNK_SIZE) {
    const chunkKeys = topLevelKeys.slice(i, i + CHUNK_SIZE)
    const chunk: Record<string, any> = {}

    chunkKeys.forEach((key) => {
      chunk[key] = translations[key]
    })

    // Create dynamic schema based on the current chunk structure
    const chunkSchema = z.object(
      Object.fromEntries(
        Object.entries(chunk).map(([key, value]) => [
          key,
          z.object(
            Object.fromEntries(
              Object.entries(value).map(([k, _v]) => [k, z.string()]),
            ),
          ),
        ]),
      ),
    )

    // Create translation chain with current chunk schema
    const translationChain = createTranslationChain(chunkSchema)

    console.log(
      `Processing chunk ${i / CHUNK_SIZE + 1} of ${Math.ceil(
        topLevelKeys.length / CHUNK_SIZE,
      )}`,
    )

    const translatedChunk = await translateChunk(
      translationChain,
      chunk,
      targetLanguageName,
    )

    console.log("translatedChunk", translatedChunk)

    Object.assign(result, translatedChunk)
  }

  // Write the result
  await fs.writeFile(outputPath, JSON.stringify(result, null, 2), "utf-8")
  console.log(`Translation completed and saved to ${outputPath}`)
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY environment variable is not set")
  }

  for (const [lang, langName] of Object.entries(TARGET_LANGUAGES)) {
    const outputFile = path.join(config.outputDir, `${lang}/translation.json`)
    await fs.mkdir(path.dirname(outputFile), { recursive: true })

    console.log(`\nTranslating to ${langName}...`)
    await processTranslations(
      defaultTranslationFilePath,
      lang,
      langName,
      outputFile,
    )
  }
}

main().catch(console.error)
