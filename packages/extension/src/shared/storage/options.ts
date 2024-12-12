import { isString } from "lodash-es"

import type {
  AreaName,
  OnlyOptionalPropertiesOf,
  RequiredPropertiesOf,
} from "./types"

export interface StorageOptions {
  namespace: string
  areaName?: AreaName
}
export type StorageOptionsOrNameSpace<
  T extends StorageOptions = StorageOptions,
> = string | T

export function getOptionsWithDefaults<T extends StorageOptions>(
  options: StorageOptionsOrNameSpace<T>,
  ...[defaults]: Exclude<
    RequiredPropertiesOf<T>,
    RequiredPropertiesOf<StorageOptions>
  > extends never
    ? []
    : [
        Pick<
          T,
          Exclude<RequiredPropertiesOf<T>, RequiredPropertiesOf<StorageOptions>>
        >,
      ]
): T & Required<StorageOptions> {
  if (isString(options)) {
    return getOptionsWithDefaultsFromObject<T>({
      ...defaults,
      namespace: options,
    } as T)
  }
  return getOptionsWithDefaultsFromObject<T>({ ...defaults, ...options })
}

export function getOptionsWithDefaultsFromObject<T extends StorageOptions>(
  options: T,
): T & Required<StorageOptions> {
  const defaultOptions: OnlyOptionalPropertiesOf<StorageOptions> = {
    areaName: "local",
  }
  return {
    ...defaultOptions,
    ...options,
  }
}
