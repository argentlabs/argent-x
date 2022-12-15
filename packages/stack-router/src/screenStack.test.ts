import { Action as NavigationType } from "history"
import { describe, expect, test } from "vitest"

import { updateScreenStack } from "./screenStack"
import { DeclaredPresentationByPath } from "./types"

const declaredPresentationByPath: DeclaredPresentationByPath = {
  "/settings": "modalSheet",
  "/accounts": "modal",
}

const paths = ["/", "/settings", "/account/:id", "accounts"]

describe("screenStack", () => {
  describe("when pushing default", () => {
    test("screen presentation should be default", () => {
      const screenStack = updateScreenStack({
        navigationType: NavigationType.Pop,
        currentLocation: {
          pathname: "/",
          key: "1",
          search: "",
          hash: "",
          state: null,
        },
        screens: [],
        declaredPresentationByPath,
        paths,
      })
      expect(screenStack.screens).toEqual([
        {
          key: "1",
          path: "/",
          pathname: "/",
          presentation: "default",
        },
      ])
    })
  })
  describe("when pushing existing screen", () => {
    test("should pop", () => {
      const screenStack = updateScreenStack({
        navigationType: NavigationType.Push,
        currentLocation: {
          pathname: "/",
          key: "3",
          search: "",
          hash: "",
          state: null,
        },
        screens: [
          {
            key: "1",
            path: "/",
            pathname: "/",
            presentation: "default",
          },
          {
            key: "2",
            path: "/settings",
            pathname: "/settings",
            presentation: "modalSheet",
          },
        ],
        declaredPresentationByPath,
        paths,
      })
      expect(screenStack.screens).toEqual([
        {
          key: "3",
          path: "/",
          pathname: "/",
          presentation: "default",
        },
      ])
      expect(screenStack.poppedScreens).toEqual([
        {
          key: "2",
          path: "/settings",
          pathname: "/settings",
          presentation: "modalSheet",
        },
      ])
    })
  })
  describe("when popping existing screen", () => {
    test("should pop", () => {
      const screenStack = updateScreenStack({
        navigationType: NavigationType.Pop,
        currentLocation: {
          pathname: "/",
          key: "3",
          search: "",
          hash: "",
          state: null,
        },
        screens: [
          {
            key: "1",
            path: "/",
            pathname: "/",
            presentation: "default",
          },
          {
            key: "2",
            path: "/settings",
            pathname: "/settings",
            presentation: "modalSheet",
          },
        ],
        declaredPresentationByPath,
        paths,
      })
      expect(screenStack.screens).toEqual([
        {
          key: "3",
          path: "/",
          pathname: "/",
          presentation: "default",
        },
      ])
      expect(screenStack.poppedScreens).toEqual([
        {
          key: "2",
          path: "/settings",
          pathname: "/settings",
          presentation: "modalSheet",
        },
      ])
    })
  })
  describe("when pushing screen with same path", () => {
    test("should pop", () => {
      const screenStack = updateScreenStack({
        navigationType: NavigationType.Push,
        currentLocation: {
          pathname: "/account/3",
          key: "3",
          search: "",
          hash: "",
          state: null,
        },
        screens: [
          {
            key: "1",
            path: "/account/:id",
            pathname: "/account/1",
            presentation: "default",
          },
          {
            key: "2",
            path: "/accounts",
            pathname: "/accounts",
            presentation: "modalSheet",
          },
        ],
        declaredPresentationByPath,
        paths,
      })
      expect(screenStack.screens).toEqual([
        {
          key: "3",
          path: "/account/:id",
          pathname: "/account/3",
          presentation: "default",
        },
      ])
      expect(screenStack.poppedScreens).toEqual([
        {
          key: "2",
          path: "/accounts",
          pathname: "/accounts",
          presentation: "modalSheet",
        },
      ])
    })
  })
})
