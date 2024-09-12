import { describe, expect, test } from "vitest"

import {
  areSiblingPaths,
  depthOfPath,
  getParentPath,
  isDirectChildOfParentPath,
  normalizePath,
} from "./path"

describe("path", () => {
  describe("normalizePath", () => {
    test("normalizePath", () => {
      expect(normalizePath("")).toEqual("/")
      expect(normalizePath("///")).toEqual("/")
      expect(normalizePath("users/")).toEqual("/users")
      expect(normalizePath("/users/123/")).toEqual("/users/123")
      expect(normalizePath("/users/123?foo=bar")).toEqual("/users/123?foo=bar")
    })
  })

  describe("depthOfPath", () => {
    test("depthOfPath", () => {
      expect(depthOfPath("")).toEqual(0)
      expect(depthOfPath("/")).toEqual(0)
      expect(depthOfPath("/users")).toEqual(1)
      expect(depthOfPath("/users/123")).toEqual(2)
      expect(depthOfPath("/users/123?foo=bar")).toEqual(2)
    })
  })

  describe("getParentPath", () => {
    test("getParentPath", () => {
      expect(getParentPath("/users")).toEqual("/")
      expect(getParentPath("/users/123")).toEqual("/users")
      expect(getParentPath("/users/123?foo=bar")).toEqual("/users")
    })
  })

  describe("areSiblingPaths", () => {
    test("areSiblingPaths", () => {
      expect(areSiblingPaths("/", "/users")).toBeFalsy()
      expect(areSiblingPaths("/about", "/users")).toBeTruthy()
      expect(areSiblingPaths("/users", "/users/123")).toBeFalsy()
    })
  })

  describe("isDirectChildOfParentPath", () => {
    test("isDirectChildOfParentPath", () => {
      expect(isDirectChildOfParentPath("/", "/users")).toBeTruthy()
      expect(isDirectChildOfParentPath("/about", "/users")).toBeFalsy()
      expect(isDirectChildOfParentPath("/users", "/users/:id")).toBeTruthy()
      expect(isDirectChildOfParentPath("/users", "/users/:id/foo")).toBeFalsy()
      expect(
        isDirectChildOfParentPath("/users/:id", "/users/:id/foo"),
      ).toBeTruthy()
    })
  })
})
