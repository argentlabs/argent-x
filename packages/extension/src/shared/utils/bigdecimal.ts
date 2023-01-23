type BigNumberish = number | string | bigint

// Write a BigDecimal class that can handle arbitrary precision decimals
class BigDecimal {
  private _value: string

  constructor(value: BigNumberish) {
    if (typeof value === "bigint" || typeof value === "number") {
      this._value = value.toString()
    } else {
      this._value = value
    }
  }

  toString() {
    return this._value
  }

  toFormat(decimalPlaces: number): string {
    // Format the value to the specified number of decimal places

    // If the value is less than 1, we need to pad the value with leading zeros
    // to ensure that the decimal places are correct
    if (this._value.length < decimalPlaces) {
      // Pad the value with leading zeros
      const padding = "0".repeat(decimalPlaces - this._value.length)
      return `0.${padding}${this._value}`
    }

    // If the value is greater than 1, we need to insert a decimal point
    // at the correct position
    if (this._value.length > decimalPlaces) {
      // Insert a decimal point at the correct position
      return `${this._value.slice(0, -decimalPlaces)}.${this._value.slice(
        -decimalPlaces,
      )}`
    }

    // If the value is equal to 1, we can just insert a decimal point
    return `0.${this._value}`
  }
}
