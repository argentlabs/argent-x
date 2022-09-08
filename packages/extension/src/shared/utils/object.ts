import { isArray, isObject, isPlainObject, isString } from "lodash-es"

/** removes empty entries "" {} [] undefined, allowing null, zero and false */

export const isEmptyValue = (value: any) => {
  const result = isString(value)
    ? value === ""
    : isObject(value)
    ? Object.keys(value).length === 0
    : value === undefined
  return result
}

export const omitEmpty = (value: Record<string, any>) => {
  if (isPlainObject(value)) {
    const result: Record<string, any> = {}
    Object.entries(value).forEach(([key, value]) => {
      const omitted = omitEmpty(value)
      if (!isEmptyValue(omitted)) {
        result[key] = omitted
      }
    })
    return result
  } else if (isArray(value)) {
    const omitted = value.filter((entry) => !isEmptyValue(entry))
    if (!isEmptyValue(omitted)) {
      return omitted
    }
  } else if (!isEmptyValue(value)) {
    return value
  }
}
