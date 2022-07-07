import browser from "webextension-polyfill"

import { AllowPromise } from "../../shared/storage/types"

export type AlarmNames = "background_check_transactions"

export function setAlarm(
  name: AlarmNames,
  options: browser.alarms.AlarmCreateInfo,
) {
  return browser.alarms.create(name, options)
}

export function onAlarm(
  name: AlarmNames,
  listener: (alarmInfo: browser.alarms.Alarm) => AllowPromise<void>,
) {
  const handler = (alarmInfo: browser.alarms.Alarm) => {
    if (alarmInfo.name === name) {
      console.log(`Alarm ${name} fired`)
      listener(alarmInfo)
    }
  }
  browser.alarms.onAlarm.addListener(handler)
  return () => browser.alarms.onAlarm.removeListener(handler)
}
