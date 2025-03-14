import { describe, it, expect } from "vitest"
import { mergeTranslation } from "./extract-translation"

describe("mergeTranslation", () => {
  it("should merge new translations into empty existing translations", () => {
    const existing = {}
    const newTranslation = {
      "Home.welcome": "Welcome",
      "Home.greeting": "Hello",
    }

    const result = mergeTranslation(existing, newTranslation)

    expect(result).toEqual({
      home: {
        welcome: "Welcome",
        greeting: "Hello",
      },
    })
    // Verify original object wasn't modified
    expect(existing).toEqual({})
  })

  it("should merge new translations into existing translations", () => {
    const existing = {
      home: {
        welcome: "Welcome",
        greeting: "Hello",
      },
    }
    const newTranslation = {
      "Home.farewell": "Goodbye",
      "Settings.title": "Settings",
    }

    const result = mergeTranslation(existing, newTranslation)

    expect(result).toEqual({
      home: {
        welcome: "Welcome",
        greeting: "Hello",
        farewell: "Goodbye",
      },
      settings: {
        title: "Settings",
      },
    })
    // Verify original object wasn't modified
    expect(existing).toEqual({
      home: {
        welcome: "Welcome",
        greeting: "Hello",
      },
    })
  })

  it("should handle keys without dots", () => {
    const existing = {}
    const newTranslation = {
      SimpleKey: "Value",
    }

    const result = mergeTranslation(existing, newTranslation)

    expect(result).toEqual({})
  })

  it("should convert screen names and keys to camelCase", () => {
    const existing = {}
    const newTranslation = {
      "User Profile.first name": "First Name",
      "User Settings.dark mode": "Dark Mode",
    }

    const result = mergeTranslation(existing, newTranslation)

    expect(result).toEqual({
      userProfile: {
        firstName: "First Name",
      },
      userSettings: {
        darkMode: "Dark Mode",
      },
    })
  })

  it("should preserve existing translations when adding new ones", () => {
    const existing = {
      home: {
        title: "Original Title",
      },
    }
    const newTranslation = {
      "Home.welcome": "Welcome",
    }

    const result = mergeTranslation(existing, newTranslation)

    expect(result).toEqual({
      home: {
        title: "Original Title",
        welcome: "Welcome",
      },
    })
    // Verify deep cloning worked - modifying result shouldn't affect original
    result.home.title = "Modified"
    expect(existing.home.title).toBe("Original Title")
  })
})
