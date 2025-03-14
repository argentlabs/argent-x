import type { Decorator } from "@storybook/react"
import type { PropsWithChildren } from "react"
import { useEffect, type FC } from "react"

import i18n from "./i18n"

interface SetI18nLanguageProps extends PropsWithChildren {
  locale: string
}

const SetI18nLanguage: FC<SetI18nLanguageProps> = ({ locale, children }) => {
  useEffect(() => {
    void i18n.changeLanguage(locale)
  }, [locale])
  return children
}

export const storybookI18nDecorator: Decorator = (Story, context) => {
  const { locale } = context.globals
  return (
    <SetI18nLanguage locale={locale}>
      <Story />
    </SetI18nLanguage>
  )
}
