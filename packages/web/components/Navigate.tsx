import { UrlObject } from "url"

import { useRouter } from "next/router"
import { FC, useEffect } from "react"

interface NavigateProps {
  to: UrlObject | string
  as?: UrlObject | string
  replace?: boolean
}

export const Navigate: FC<NavigateProps> = ({ to, as, replace }) => {
  const navigate = useRouter()

  useEffect(() => {
    if (replace) {
      navigate.replace(to, as)
    } else {
      navigate.push(to, as)
    }
  }, [to, as, replace, navigate])

  return null
}
