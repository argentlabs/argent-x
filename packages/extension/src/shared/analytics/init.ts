import { UUID } from "@amplitude/analytics-core"
import { ampli } from "."
import { Environment, LoadOptions } from "../../ampli"
import { settingsStore } from "../settings"
import { StoreDexie } from "../smartAccount/idb"

export const initAmplitude = async () => {
  try {
    const idb = new StoreDexie()
    const privacyShareAnalyticsData = await settingsStore.get(
      "privacyShareAnalyticsData",
    )

    const deviceId = await idb.ids.get("deviceId")
    const userId = await idb.ids.get("userId")
    const analyticsConfig = {
      environment: "argentdev" as Environment,
      disabled: privacyShareAnalyticsData === false,
      client: {
        configuration: {
          identityStorage: "localStorage",
          defaultTracking: false,
          ...(deviceId && { deviceId: deviceId.id }),
          ...(userId && { userId: userId.id }),
        },
      },
    } as LoadOptions
    if (!ampli.isLoaded) {
      ampli.load(analyticsConfig)
    }

    if (!deviceId && ampli.isLoaded) {
      const newDeviceId = ampli.client.getDeviceId()
      if (newDeviceId) {
        await idb.ids.add({ key: "deviceId", id: newDeviceId })
      } else {
        const generatedDeviceId = UUID()
        await idb.ids.add({ key: "deviceId", id: generatedDeviceId })
        ampli.client.setDeviceId(generatedDeviceId)
      }
    }
  } catch (e) {
    console.error("Error loading ampli", e)
  }
}
