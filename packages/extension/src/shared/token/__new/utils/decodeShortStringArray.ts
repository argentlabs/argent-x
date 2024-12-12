import { shortString } from "starknet"

export function decodeShortStringArray(shortStringArray: string[]): string {
  if (shortStringArray.length === 3) {
    return shortString.decodeShortString(shortStringArray[1])
  }
  return shortString.decodeShortString(shortStringArray[0])
}
