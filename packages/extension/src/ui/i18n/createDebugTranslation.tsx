import type { TFunction } from "i18next"

// i18n type system is too complex to add correct typing here,
// we use 'any' and 'as' crutches since this is only used in debug anyway

export const createDebugTranslation = (t: TFunction) => {
  const DebugTranslation = (key: any, options: any) => {
    const translated = t(key, options)

    if (typeof translated !== "string") {
      return translated
    }

    return (
      <span title={key} style={{ backgroundColor: "magenta", color: "white" }}>
        {translated}
      </span>
    )
  }

  return DebugTranslation as TFunction
}
