import type CopyPlugin from "copy-webpack-plugin"

import { getReleaseTrack } from "./getReleaseTrack"
import { HOT_RELOAD_PORT } from "../src/shared/utils/dev"
import { isDev, useManifestV2, useReactDevTools } from "./config"

const releaseTrack = getReleaseTrack()

/** adds release track to manifest icon title tooltip */
export const transformManifestJson: CopyPlugin.Transform = (
  content,
  _absoluteFrom,
) => {
  const contentString = content.toString()
  const json = JSON.parse(contentString)
  const defaultTitle = useManifestV2
    ? json.browser_action.default_title
    : json.action.default_title
  const releaseTrackTitle = [defaultTitle, releaseTrack.toUpperCase()].join(" ")
  if (useManifestV2) {
    if (releaseTrack !== "default") {
      json.browser_action.default_title = releaseTrackTitle
    }
    if (isDev) {
      if (useReactDevTools) {
        json.content_security_policy = injectCSPParameter(
          json.content_security_policy,
          "http://localhost:8097",
        )
      }
      json.permissions = json.permissions.concat(
        `http://localhost:${HOT_RELOAD_PORT}`,
      )
    }
  } else {
    if (releaseTrack !== "default") {
      json.action.default_title = releaseTrackTitle
    }
    if (isDev) {
      if (useReactDevTools) {
        json.content_security_policy.extension_pages = injectCSPParameter(
          json.content_security_policy.extension_pages,
          "http://localhost:8097",
        )
      }
      json.host_permissions = json.host_permissions.concat(
        `http://localhost:${HOT_RELOAD_PORT}`,
      )
    }
  }
  return Buffer.from(JSON.stringify(json, null, 2))
}

function injectCSPParameter(csp: string, newParameter: string): string {
  // Split the CSP string into directives
  const directives = csp.split(";").map((directive) => directive.trim())

  // Find the script-src directive
  const scriptSrcIndex = directives.findIndex((directive) =>
    directive.startsWith("script-src"),
  )

  if (scriptSrcIndex !== -1) {
    // Inject the new parameter
    directives[scriptSrcIndex] += ` ${newParameter}`
  }

  // Join the directives back into a single string
  return directives.join("; ")
}
