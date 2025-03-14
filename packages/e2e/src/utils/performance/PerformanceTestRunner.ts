import { Page } from "@playwright/test"
import {
  PerformanceBaseline,
  BaselineComparisonResult,
} from "./PerformanceBaseline"
import { collectMetrics } from "./performanceMetrics"
import HARServer from "./HARServer"
import { sendPerformanceTableToSlack } from "../slack"

// Types
export interface PerformanceTestCase {
  name: string
  description: string
  skip?: boolean
  useRegexp: boolean
  action: (extension: any) => Promise<void>
  assertions?: (extension: any) => Promise<void>
  thresholds?: {
    maxRegressionPercent?: number
  }
}

interface TestResult {
  totalDuration: number
  fps: number
  timestamp: number
}

interface TestStatistics {
  avg: number
  std: number
  best: number
  worst: number
  median: number
}

export class PerformanceTestRunner {
  private static readonly DEFAULT_CONFIG = {
    iterations: 3,
    warmupIterations: 1,
    stabilityTimeout: 500,
    defaultRegressionThreshold: 15,
  } as const

  private readonly config: typeof PerformanceTestRunner.DEFAULT_CONFIG
  private readonly baseline: PerformanceBaseline
  private harServer: HARServer

  constructor(
    config = PerformanceTestRunner.DEFAULT_CONFIG,
    baseline = new PerformanceBaseline(),
  ) {
    this.config = { ...PerformanceTestRunner.DEFAULT_CONFIG, ...config }
    this.baseline = baseline
    this.harServer = new HARServer()
  }

  private calculateStatistics(
    values: number[],
    higherIsBetter: boolean = false,
  ): TestStatistics {
    const sorted = higherIsBetter
      ? [...values].sort((a, b) => b - a) // Sort descending for FPS
      : [...values].sort((a, b) => a - b) // Sort ascending for duration
    const avg = values.reduce((a, b) => a + b) / values.length
    const variance =
      values.reduce((sum, val) => sum + (val - avg) ** 2, 0) / values.length

    return {
      avg,
      std: Math.sqrt(variance),
      best: higherIsBetter ? sorted[0] : sorted[0], // First is highest for FPS, lowest for duration
      worst: higherIsBetter
        ? sorted[sorted.length - 1]
        : sorted[sorted.length - 1], // Last is lowest for FPS, highest for duration
      median: sorted[Math.floor(sorted.length / 2)],
    }
  }

  private async waitForStableState(page: Page): Promise<void> {
    await Promise.all([
      page.waitForLoadState("networkidle"),
      page.waitForLoadState("domcontentloaded"),
    ])
    await page.waitForTimeout(this.config.stabilityTimeout)
  }

  private logIterationResult(
    testCase: PerformanceTestCase,
    iteration: number,
    result: TestResult,
    isWarmup: boolean,
    comparison?: BaselineComparisonResult,
  ): void {
    const prefix = isWarmup ? "Warmup" : "Test"
    console.log(
      `\n${prefix} - ${testCase.description} - Iteration ${iteration + 1}:`,
    )

    const getDeltaIndicator = (
      change: number,
      higherIsBetter: boolean = false,
    ) => {
      if (!change) return ""
      const numericChange = parseFloat(String(change))
      if (higherIsBetter) {
        return numericChange > 0 ? "✅" : "❌"
      }
      return numericChange < 0 ? "✅" : "❌"
    }

    const tableData = {
      "Duration (ms)": {
        Current: result.totalDuration.toFixed(2),
        Baseline: comparison
          ? comparison.totalDuration.baseline.toFixed(2)
          : "-",
        Change: comparison
          ? `${comparison.totalDuration.percentageChange}% ${getDeltaIndicator(Number(comparison.totalDuration.percentageChange))}`
          : "-",
        Status: comparison ? comparison.totalDuration.status : "-",
      },
      FPS: {
        Current: result.fps.toFixed(2),
        Baseline: comparison ? comparison.fps.baseline.toFixed(2) : "-",
        Change: comparison
          ? `${comparison.fps.percentageChange}% ${getDeltaIndicator(Number(comparison.fps.percentageChange), true)}`
          : "-",
        Status: comparison ? comparison.fps.status : "-",
      },
    }

    console.table(tableData)
  }

  private async runSingleIteration(
    extension: any,
    testCase: PerformanceTestCase,
    iteration: number,
    isWarmup = false,
  ): Promise<TestResult> {
    await this.waitForStableState(extension.page)

    const startTime = performance.now()
    await testCase.action(extension)
    await testCase.assertions?.(extension)
    const endTime = performance.now()

    const metrics = await collectMetrics(extension.page)
    const result = {
      totalDuration: endTime - startTime,
      fps: metrics.fps,
      timestamp: Date.now(),
    }

    const comparison = await this.baseline.compareWithBaseline(testCase.name, {
      totalDuration: result.totalDuration,
      fps: result.fps,
    })

    this.logIterationResult(
      testCase,
      iteration,
      result,
      isWarmup,
      comparison || undefined,
    )
    return result
  }

  private formatStatValue(value: number): string {
    return value.toFixed(2)
  }

  private async logDetailedResults(
    testCase: PerformanceTestCase,
    statistics: { duration: TestStatistics; fps: TestStatistics },
  ): Promise<void> {
    const comparison = await this.baseline.compareWithBaseline(testCase.name, {
      totalDuration: statistics.duration.best, // Using best (lowest) value for duration
      fps: statistics.fps.best, // Using best (highest) value for FPS
    })

    console.log(`\n📊 ${testCase.description} - Summary:`)

    const getDeltaIndicator = (
      change: number,
      higherIsBetter: boolean = false,
    ) => {
      if (!change) return ""
      const numericChange = parseFloat(String(change))
      if (higherIsBetter) {
        return numericChange > 0 ? "✅" : "❌"
      }
      return numericChange < 0 ? "✅" : "❌"
    }

    const tableData = {
      "Duration (ms)": {
        Average: this.formatStatValue(statistics.duration.avg),
        Median: this.formatStatValue(statistics.duration.median),
        "Std Dev": this.formatStatValue(statistics.duration.std),
        Best: `${this.formatStatValue(statistics.duration.best)} (lowest)`,
        Worst: `${this.formatStatValue(statistics.duration.worst)} (highest)`,
        Baseline: comparison
          ? this.formatStatValue(comparison.totalDuration.baseline)
          : "-",
        "Best vs Base": comparison
          ? `${comparison.totalDuration.percentageChange}% ${getDeltaIndicator(Number(comparison.totalDuration.percentageChange))}`
          : "-",
        Status: comparison ? comparison.totalDuration.status : "-",
      },
      FPS: {
        Average: this.formatStatValue(statistics.fps.avg),
        Median: this.formatStatValue(statistics.fps.median),
        "Std Dev": this.formatStatValue(statistics.fps.std),
        Best: `${this.formatStatValue(statistics.fps.best)} (highest)`,
        Worst: `${this.formatStatValue(statistics.fps.worst)} (lowest)`,
        Baseline: comparison
          ? this.formatStatValue(comparison.fps.baseline)
          : "-",
        "Best vs Base": comparison
          ? `${comparison.fps.percentageChange}% ${getDeltaIndicator(Number(comparison.fps.percentageChange), true)}`
          : "-",
        Status: comparison ? comparison.fps.status : "-",
      },
    }

    console.table(tableData)
    await sendPerformanceTableToSlack(testCase.name, tableData)
  }

  private async validateResults(
    testCase: PerformanceTestCase,
    statistics: { duration: TestStatistics; fps: TestStatistics },
  ): Promise<void> {
    const maxRegression =
      testCase.thresholds?.maxRegressionPercent ??
      this.config.defaultRegressionThreshold

    const comparison = await this.baseline.compareWithBaseline(testCase.name, {
      totalDuration: statistics.duration.best,
      fps: statistics.fps.best,
    })

    if (!comparison) return

    const errors: string[] = []

    // For duration, higher values are worse (regressions)
    if (comparison.totalDuration.diff > maxRegression) {
      errors.push(
        `Duration: ${comparison.totalDuration.diff.toFixed(2)}% regression detected (max allowed: ${maxRegression}%)`,
      )
    }

    // For FPS, higher values are better
    if (comparison.fps.diff < -maxRegression) {
      errors.push(
        `FPS: ${Math.abs(comparison.fps.diff).toFixed(2)}% regression detected (max allowed: ${maxRegression}%)`,
      )
    }

    if (errors.length > 0) {
      throw new Error(`Performance test failures:\n${errors.join("\n")}`)
    }
  }

  public async runTest(
    testCase: PerformanceTestCase,
    extension: any,
  ): Promise<void> {
    await this.harServer.reload(`${testCase.name}.har`, testCase.useRegexp)

    // Warmup phase
    console.log(
      `\n🔥 Running ${this.config.warmupIterations} warmup iterations...`,
    )
    for (let i = 0; i < this.config.warmupIterations; i++) {
      await this.runSingleIteration(extension, testCase, i, true)
      await extension.resetExtension()
    }

    // Test phase
    console.log(`\n🚀 Running ${this.config.iterations} test iterations...`)
    const results: TestResult[] = []
    for (let i = 0; i < this.config.iterations; i++) {
      const result = await this.runSingleIteration(extension, testCase, i)
      results.push(result)
      if (i < this.config.iterations - 1) {
        await extension.resetExtension()
      }
    }

    const statistics = {
      duration: this.calculateStatistics(results.map((r) => r.totalDuration)),
      fps: this.calculateStatistics(
        results.map((r) => r.fps),
        true,
      ), // true indicates higher is better for FPS
    }

    await this.logDetailedResults(testCase, statistics)
    await this.validateResults(testCase, statistics)
  }
}
