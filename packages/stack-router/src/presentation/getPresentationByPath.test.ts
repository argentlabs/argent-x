import { describe, expect, test } from "vitest"

import { PresentationDirection } from "../types"
import { getPresentationByPath } from "./getPresentationByPath"
import { variantForPresentation } from "./presentationVariants"

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
            presentation: "push",
          },
        ],
      })
      expect(presentationByPathname["/"].presentation).toEqual("push")
      expect(presentationByPathname["/"].variant).toEqual(
        variantForPresentation("push"),
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
            presentation: "push",
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
            presentation: "push",
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
            presentation: "push",
          },
        ],
      })
      expect(presentationByPathname["/"].presentation).toEqual("stacked")
      expect(presentationByPathname["/"].variant).toEqual(
        variantForPresentation("stacked"),
      )
      expect(presentationByPathname["/modal-sheet"].presentation).toEqual(
        "pushModalSheet",
      )
      expect(presentationByPathname["/modal-sheet"].variant).toEqual(
        variantForPresentation("pushModalSheet"),
      )
      expect(
        presentationByPathname["/modal-sheet/detail"].presentation,
      ).toEqual("pushModalSheet")
      expect(presentationByPathname["/modal-sheet/detail"].variant).toEqual(
        variantForPresentation("pushModalSheet"),
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
            presentation: "push",
          },
        ],
        screens: [
          {
            path: "/",
            pathname: "/",
            key: "1",
            presentation: "push",
          },
        ],
      })
      expect(presentationByPathname["/"].presentation).toEqual("push")
      expect(presentationByPathname["/"].variant).toEqual(
        variantForPresentation("push", true),
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
