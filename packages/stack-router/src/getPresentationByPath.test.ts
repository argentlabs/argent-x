import { describe, expect, test } from "vitest"

import { getPresentationByPath } from "./getPresentationByPath"
import { variantForPresentation } from "./presentationVariants"
import { PresentationDirection } from "./types"

describe("getPresentationByPath", () => {
  describe("when pushing default", () => {
    test("screen presentation should be default", () => {
      const presentationByPathname = getPresentationByPath({
        presentationDirection: PresentationDirection.Forwards,
        poppedScreens: [],
        screens: [
          {
            path: "/",
            pathname: "/",
            key: "1",
            presentation: "default",
          },
        ],
      })
      expect(presentationByPathname["/"].presentation).toEqual("default")
      expect(presentationByPathname["/"].variant).toEqual(
        variantForPresentation("default"),
      )
    })
  })
  describe("when pushing modalSheet", () => {
    test("screen presentation should be stacked and modalSheet", () => {
      const presentationByPathname = getPresentationByPath({
        presentationDirection: PresentationDirection.Forwards,
        poppedScreens: [],
        screens: [
          {
            path: "/",
            pathname: "/",
            key: "1",
            presentation: "default",
          },
          {
            path: "/modal-sheet",
            pathname: "/modal-sheet",
            key: "2",
            presentation: "modalSheet",
          },
        ],
      })
      expect(presentationByPathname["/"].presentation).toEqual("stacked")
      expect(presentationByPathname["/"].variant).toEqual(
        variantForPresentation("stacked"),
      )
      expect(presentationByPathname["/modal-sheet"].presentation).toEqual(
        "modalSheet",
      )
      expect(presentationByPathname["/modal-sheet"].variant).toEqual(
        variantForPresentation("modalSheet"),
      )
    })
  })
  describe("when pushing default on modalSheet", () => {
    test("screen presentation should be defaultModalSheet", () => {
      const presentationByPathname = getPresentationByPath({
        presentationDirection: PresentationDirection.Forwards,
        poppedScreens: [],
        screens: [
          {
            path: "/",
            pathname: "/",
            key: "1",
            presentation: "default",
          },
          {
            path: "/modal-sheet",
            pathname: "/modal-sheet",
            key: "2",
            presentation: "modalSheet",
          },
          {
            path: "/modal-sheet/detail",
            pathname: "/modal-sheet/detail",
            key: "3",
            presentation: "default",
          },
        ],
      })
      expect(presentationByPathname["/"].presentation).toEqual("stacked")
      expect(presentationByPathname["/"].variant).toEqual(
        variantForPresentation("stacked"),
      )
      expect(presentationByPathname["/modal-sheet"].presentation).toEqual(
        "defaultModalSheet",
      )
      expect(presentationByPathname["/modal-sheet"].variant).toEqual(
        variantForPresentation("defaultModalSheet"),
      )
      expect(
        presentationByPathname["/modal-sheet/detail"].presentation,
      ).toEqual("defaultModalSheet")
      expect(presentationByPathname["/modal-sheet/detail"].variant).toEqual(
        variantForPresentation("defaultModalSheet"),
      )
    })
  })
  describe("when pushing existing path from modalSheet", () => {
    test("screen presentations should be inverse defaultModalSheet", () => {
      const presentationByPathname = getPresentationByPath({
        presentationDirection: PresentationDirection.Backwards,
        poppedScreens: [
          {
            path: "/modal-sheet",
            pathname: "/modal-sheet",
            key: "2",
            presentation: "modalSheet",
          },
          {
            path: "/modal-sheet/detail",
            pathname: "/modal-sheet/detail",
            key: "3",
            presentation: "default",
          },
        ],
        screens: [
          {
            path: "/",
            pathname: "/",
            key: "1",
            presentation: "default",
          },
        ],
      })
      expect(presentationByPathname["/"].presentation).toEqual("default")
      expect(presentationByPathname["/"].variant).toEqual(
        variantForPresentation("default", true),
      )
      expect(
        presentationByPathname["/modal-sheet/detail"].presentation,
      ).toEqual("modalSheet")
      expect(presentationByPathname["/modal-sheet/detail"].variant).toEqual(
        variantForPresentation("modalSheet", true),
      )
    })
  })
})
