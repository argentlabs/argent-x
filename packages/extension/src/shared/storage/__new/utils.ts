/** Function to recursively replace the value in an object or array
 *  Optionally, the replacement can be limited to specific keys
 */
export function replaceValueRecursively(
  obj: any,
  oldValue: any,
  newValue: any,
  keys?: string[],
): void {
  if (typeof obj === "object" && obj !== null) {
    for (const key in obj) {
      if (typeof obj[key] === "object" && obj[key] !== null) {
        // Recursively call for nested objects or arrays
        replaceValueRecursively(obj[key], oldValue, newValue, keys)
      } else if ((!keys || keys.includes(key)) && obj[key] === oldValue) {
        // Replace the value if it matches oldValue
        obj[key] = newValue
      }
    }
  } else if (Array.isArray(obj)) {
    // Iterate through array elements
    obj.forEach((item, index) => {
      if (typeof item === "object" && item !== null) {
        replaceValueRecursively(item, oldValue, newValue, keys)
      } else if (item === oldValue) {
        obj[index] = newValue
      }
    })
  }
}

export function containsValue(obj: any, value: any): boolean {
  if (typeof obj === "object" && obj !== null) {
    for (const key in obj) {
      if (typeof obj[key] === "object" && obj[key] !== null) {
        if (containsValue(obj[key], value)) {
          return true
        }
      } else if (obj[key] === value) {
        return true
      }
    }
  } else if (Array.isArray(obj)) {
    for (const item of obj) {
      if (typeof item === "object" && item !== null) {
        if (containsValue(item, value)) {
          return true
        }
      } else if (item === value) {
        return true
      }
    }
  }
  return false
}
