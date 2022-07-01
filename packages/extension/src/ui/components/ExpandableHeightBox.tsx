import { FC, useCallback, useMemo, useState } from "react"
import Measure, { ContentRect } from "react-measure"
import styled from "styled-components"

const AnimatedHeight = styled.div`
  transition: height 0.2s;
`

export interface IExpandableHeightBox {
  expanded: boolean
  // ...rest
  [x: string]: any
}

export const ExpandableHeightBox: FC<IExpandableHeightBox> = ({
  expanded,
  ...rest
}) => {
  const [height, setHeight] = useState<number | undefined>()
  const onResize = useCallback((contentRect: ContentRect) => {
    setHeight(contentRect.bounds?.height || 0)
  }, [])
  const style = useMemo(
    () => ({
      height: height ? (expanded ? height : 0) : "auto",
    }),
    [height, expanded],
  )
  return (
    <AnimatedHeight style={style}>
      <Measure bounds onResize={onResize}>
        {({ measureRef }) => <div ref={measureRef} {...rest} />}
      </Measure>
    </AnimatedHeight>
  )
}
