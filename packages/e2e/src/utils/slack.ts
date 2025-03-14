import fs from "fs/promises"
import path from "path"
import config from "../config"
import { WebClient } from "@slack/web-api"

interface MetricData {
  Average: string
  Median: string
  "Std Dev": string
  Best: string
  Worst: string
  Baseline: string
  "Best vs Base": string
  Status: string
}

interface PerformanceData {
  "Duration (ms)": MetricData
  FPS: MetricData
}

interface ResultsFile {
  results: {
    testName: string
    title: string
    prLink: string
    message: string
    data: PerformanceData
  }[]
}

function getGitHubPRLink(): string {
  const repo = process.env.GITHUB_REPOSITORY
  const prNumber = process.env.GITHUB_REF?.split("/")[2]

  return repo && prNumber
    ? `https://github.com/${repo}/pull/${prNumber}`
    : "No PR link available"
}

function formatMessage(
  testName: string,
  tableData: PerformanceData,
  title: string,
  prLink: string,
): string {
  let message = `*${title}* - *${testName}* - ${prLink}\n\n`

  for (const [metricName, values] of Object.entries(tableData)) {
    message += `*${metricName}*\n`
    message += `• Average: ${values.Average}\n`
    message += `• Median: ${values.Median}\n`
    message += `• Std Dev: ${values["Std Dev"]}\n`
    message += `• Best: ${values.Best}\n`
    message += `• Worst: ${values.Worst}\n`
    message += `• Baseline: ${values.Baseline}\n`
    message += `• Best vs Base: ${values["Best vs Base"]}\n`
    message += `• Status: ${values.Status}\n\n`
  }

  return message
}

export async function sendPerformanceTableToSlack(
  testName: string,
  tableData: PerformanceData,
  title: string = "Performance Results",
) {
  // Only for CI
  if (!config.isCI) {
    return
  }
  const prLink = getGitHubPRLink()
  const message = formatMessage(testName, tableData, title, prLink)
  const resultPath = path.resolve(process.cwd(), "performance/perf-result.json")

  // Append to results file
  try {
    // Create directory if it doesn't exist
    await fs.mkdir(path.dirname(resultPath), { recursive: true })

    // Read existing file or create new one
    let results: ResultsFile = { results: [] }
    try {
      const fileContent = await fs.readFile(resultPath, "utf-8")
      results = JSON.parse(fileContent)
    } catch (error) {
      // File doesn't exist or is invalid, use empty results
    }

    // Append new result
    results.results.push({
      testName,
      title,
      prLink,
      message,
      data: tableData,
    })

    // Write back to file
    await fs.writeFile(resultPath, JSON.stringify(results, null, 2))
  } catch (error) {
    console.error("Error saving results:", error)
  }

  const web = new WebClient(config.slackToken)
  await web.chat.postMessage({
    channel: config.slackChannelId,
    text: message,
    mrkdwn: true,
  })
}
