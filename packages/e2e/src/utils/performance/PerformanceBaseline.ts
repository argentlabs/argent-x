import fs from "fs/promises"
import path from "path"
import config from "../../config"

export interface PerformanceMetrics {
  totalDuration: number
  fps: number
}

export interface BaselineComparison {
  metricName: string
  current: number
  baseline: number
  diff: number
  status: string
  percentageChange: string
}

export interface BaselineComparisonResult {
  totalDuration: BaselineComparison
  fps: BaselineComparison
  summary: {
    hasRegression: boolean
    overallStatus: string
    recommendations: string[]
  }
}

interface CacheEntry {
  data: Record<string, PerformanceMetrics>
  timestamp: number
}

export class PerformanceBaseline {
  private static readonly DEFAULT_CONFIG = {
    thresholds: {
      regression: +config.performanceThresholdRegression,
      improvement: +config.performanceThresholdImprovement,
      warning: +config.performanceThresholdWarning,
    },
    cacheTTL: 5000, // 5 seconds cache TTL
  } as const

  private readonly baselinePath: string
  private readonly thresholds: typeof PerformanceBaseline.DEFAULT_CONFIG.thresholds
  private readonly cacheTTL: number
  private cache: CacheEntry | null = null

  constructor(
    baselinePath = path.join(
      process.cwd(),
      "performance",
      "performance-baseline.json",
    ),
    config = PerformanceBaseline.DEFAULT_CONFIG,
  ) {
    this.baselinePath = baselinePath
    this.thresholds = {
      ...PerformanceBaseline.DEFAULT_CONFIG.thresholds,
      ...config.thresholds,
    }
    this.cacheTTL = config.cacheTTL
  }

  private isCacheValid(): boolean {
    return !!(this.cache && Date.now() - this.cache.timestamp < this.cacheTTL)
  }

  private async ensureBaselineDirectory(): Promise<void> {
    const dir = path.dirname(this.baselinePath)
    await fs.mkdir(dir, { recursive: true }).catch(() => {})
  }

  private getStatusEmoji(diff: number, higherIsBetter: boolean): string {
    // For FPS (higherIsBetter), we want to show:
    // 🟢 when diff is positive (current > baseline)
    // 🔴 when diff is negative (current < baseline)
    const adjustedDiff = higherIsBetter ? -diff : diff

    if (adjustedDiff > this.thresholds.regression * 100) return "🔴"
    if (adjustedDiff > this.thresholds.warning * 100) return "🟡"
    if (adjustedDiff < this.thresholds.improvement * 100) return "🟢"
    return "⚪"
  }

  private calculateComparison(
    metricName: string,
    current: number,
    baseline: number,
    higherIsBetter = false,
  ): BaselineComparison {
    const rawDiff = ((current - baseline) / baseline) * 100
    // Don't invert the diff here, leave it as-is
    const adjustedDiff = rawDiff
    const sign = rawDiff > 0 ? "+" : ""

    return {
      metricName,
      current,
      baseline,
      diff: adjustedDiff, // Use raw diff
      status: this.getStatusEmoji(adjustedDiff, higherIsBetter),
      percentageChange: `${sign}${rawDiff.toFixed(2)}%`,
    }
  }

  public async loadBaselines(): Promise<Record<string, PerformanceMetrics>> {
    if (this.isCacheValid()) {
      return this.cache!.data
    }

    try {
      const data = await fs.readFile(this.baselinePath, "utf-8")
      const baselines = JSON.parse(data)
      this.cache = {
        data: baselines,
        timestamp: Date.now(),
      }
      return baselines
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        console.error("Error loading baseline:", error)
      }
      return {}
    }
  }

  public async saveBaseline(
    testName: string,
    metrics: PerformanceMetrics,
    force = false,
  ): Promise<void> {
    await this.ensureBaselineDirectory()

    const baselines = await this.loadBaselines()
    if (!force && baselines[testName]) {
      const comparison = await this.compareWithBaseline(testName, metrics)
      if (comparison?.summary.hasRegression) {
        console.warn(
          "⚠️ Warning: New baseline shows regression. Use force=true to override.",
        )
        return
      }
    }

    baselines[testName] = metrics
    this.cache = {
      data: baselines,
      timestamp: Date.now(),
    }

    await fs.writeFile(this.baselinePath, JSON.stringify(baselines, null, 2))
  }

  public async compareWithBaseline(
    testName: string,
    currentMetrics: PerformanceMetrics,
  ): Promise<BaselineComparisonResult | null> {
    const baselines = await this.loadBaselines()
    const baseline = baselines[testName]

    if (!baseline) {
      console.log("📊 No baseline found, saving current metrics as baseline")
      await this.saveBaseline(testName, currentMetrics)
      return null
    }

    const durationComparison = this.calculateComparison(
      "Total Duration (ms)",
      currentMetrics.totalDuration,
      baseline.totalDuration,
      false, // lower is better for duration
    )

    const fpsComparison = this.calculateComparison(
      "Frames Per Second",
      currentMetrics.fps,
      baseline.fps,
      true, // higher is better for FPS
    )

    const hasRegression =
      durationComparison.diff > this.thresholds.regression * 100 ||
      fpsComparison.diff > this.thresholds.regression * 100

    return {
      totalDuration: durationComparison,
      fps: fpsComparison,
      summary: {
        hasRegression,
        overallStatus: this.getOverallStatus(hasRegression),
        recommendations: this.generateRecommendations(
          durationComparison,
          fpsComparison,
        ),
      },
    }
  }
  private getOverallStatus(hasRegression: boolean): string {
    return hasRegression
      ? "🔴 Performance Regression Detected"
      : "✅ Performance Within Acceptable Range"
  }

  private generateRecommendations(
    duration: BaselineComparison,
    fps: BaselineComparison,
  ): string[] {
    const recommendations: string[] = []
    const regressionThreshold = this.thresholds.regression * 100

    if (duration.diff > regressionThreshold) {
      recommendations.push(
        `Consider investigating the ${duration.diff.toFixed(2)}% increase in duration`,
      )
    }

    if (fps.diff > regressionThreshold) {
      recommendations.push(
        `Consider investigating the ${fps.diff.toFixed(2)}% decrease in FPS`,
      )
    }

    return recommendations
  }

  public async clearBaseline(testName?: string): Promise<void> {
    try {
      if (testName) {
        const baselines = await this.loadBaselines()
        delete baselines[testName]
        this.cache = {
          data: baselines,
          timestamp: Date.now(),
        }
        await fs.writeFile(
          this.baselinePath,
          JSON.stringify(baselines, null, 2),
        )
      } else {
        await fs.unlink(this.baselinePath)
        this.cache = null
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        throw error
      }
    }
  }

  public async getBaseline(
    testName: string,
  ): Promise<PerformanceMetrics | null> {
    const baselines = await this.loadBaselines()
    return baselines[testName] || null
  }
}
