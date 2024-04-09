import { analyticsService } from "."
import { Environment } from "../../ampli"
import { settingsStore } from "../settings"
import { StoreDexie } from "../shield/idb"

export const initAmplitude = async () => {
  try {
    const idb = new StoreDexie()
    const privacyShareAnalyticsData = await settingsStore.get(
      "privacyShareAnalyticsData",
    )

    const deviceId = await idb.ids.get("deviceId")

    const analyticsConfig = {
      environment: "argentdev" as Environment,
      disabled: privacyShareAnalyticsData === false,
      client: {
        configuration: {
          defaultTracking: false,
          ...(deviceId && { deviceId: deviceId.id }),
        },
      },
    }
    if (!analyticsService.isLoaded) {
      analyticsService.load(analyticsConfig)
    }

    if (!deviceId && analyticsService.isLoaded) {
      const newDeviceId = analyticsService.client.getDeviceId()
      if (newDeviceId) {
        await idb.ids.add({ key: "deviceId", id: newDeviceId })
      }
    }
  } catch (e) {
    console.error("Error loading ampli", e)
  }
}
