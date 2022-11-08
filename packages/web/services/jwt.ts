import { Device, idb } from "./idb"

let device: Device

const createDevice = async (): Promise<Device> => {
  const signingKey = await window.crypto.subtle.generateKey(
    {
      name: "ECDSA",
      namedCurve: "P-256",
    },
    false,
    ["sign", "verify"],
  )
  return {
    id: 0,
    signingKey,
  }
}

export const getDevice = async () => {
  if (!device) {
    const newDevice = await createDevice()

    device = await idb.transaction("r", idb.devices, async () => {
      const device = await idb.devices.get(0)
      if (device) {
        return device
      }
      await idb.devices.add(newDevice)
      return newDevice
    })
  }

  return device
}
