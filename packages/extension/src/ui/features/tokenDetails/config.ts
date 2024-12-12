import type {
  DeepPartial,
  LineWidth,
  TimeChartOptions,
} from "lightweight-charts"
import {
  ColorType,
  LineStyle,
  LineType,
  TrackingModeExitMode,
} from "lightweight-charts"
import type { CSSProperties } from "react"

export const getChartOptions = (
  markerColor: string,
): DeepPartial<TimeChartOptions> => ({
  layout: {
    background: { type: ColorType.Solid, color: "transparent" },
    textColor: "black",
    attributionLogo: false,
  },
  handleScale: {
    mouseWheel: false,
    pinch: false,
    axisPressedMouseMove: false,
    axisDoubleClickReset: false,
  },
  handleScroll: {
    horzTouchDrag: false,
    mouseWheel: false,
    pressedMouseMove: false,
    vertTouchDrag: false,
  },
  trackingMode: {
    exitMode: TrackingModeExitMode.OnTouchEnd,
  },
  height: 114,
  timeScale: {
    visible: false,
  },
  rightPriceScale: {
    visible: false,
  },
  grid: {
    vertLines: {
      visible: false,
    },
    horzLines: {
      visible: false,
    },
  },
  crosshair: {
    vertLine: {
      style: LineStyle.SparseDotted,
      color: markerColor,
    },
    horzLine: {
      visible: false,
    },
  },
})

export const getSeriesConfig = (markerColor: string) => ({
  color: markerColor,
  lineType: LineType.Curved,
  lineWidth: 2 as LineWidth,
  priceLineVisible: false,
  crosshairMarkerRadius: 3,
  crosshairMarkerBackgroundColor: markerColor,
  crosshairMarkerBorderColor: markerColor,
  crosshairMarkerBorderWidth: 4,
})

export const TOOLTIP_STYLE: CSSProperties = {
  display: "block",
  position: "absolute",
  left: "0",
  top: "-16px",
}
