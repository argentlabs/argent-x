export function getReleaseTrack() {
  if (process.env.RELEASE_TRACK === "alpha") {
    return "alpha"
  }
  if (process.env.RELEASE_TRACK === "beta") {
    return "beta"
  }
  return "default"
}
