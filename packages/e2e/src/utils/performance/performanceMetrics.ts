import { Page } from "@playwright/test"

interface PerformanceMetrics {
  totalDuration: number
  fps: number
}

export async function collectMetrics(page: Page): Promise<PerformanceMetrics> {
  try {
    const fps = await calculateFPS(page)

    return {
      totalDuration: await page.evaluate(() => performance.now()),
      fps,
    }
  } catch (error) {
    console.error("Error collecting metrics:", error)
    return {
      totalDuration: 0,
      fps: 0,
    }
  }
}

async function calculateFPS(page: Page): Promise<number> {
  const fps = await page.evaluate(() => {
    return new Promise((resolve) => {
      let frameCount = 0
      let lastTime = performance.now()

      function count() {
        frameCount++
        const now = performance.now()
        if (now - lastTime >= 1000) {
          resolve(Math.round((frameCount * 1000) / (now - lastTime)))
        } else {
          requestAnimationFrame(count)
        }
      }

      requestAnimationFrame(count)
    })
  })

  return fps as number
}
