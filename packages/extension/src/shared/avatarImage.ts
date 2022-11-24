const getInitials = (name: string) => {
  let initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
  if (name.length === 1) {
    return name.toUpperCase()
  }
  if (initials.length < 2) {
    initials = name[0] + name[1]
  }
  if (initials.length > 2) {
    initials = initials.slice(0, 2)
  }
  return initials.toUpperCase()
}

const parseColor = (color: string) => {
  const hex = color.replace("#", "")
  if (!/^[0-9A-F]{6}$/i.test(hex)) {
    throw new Error(`Invalid color ${color}`)
  }
  return `#${hex}`
}

export const generateAvatarImage = (
  name: string,
  options: { background: string; color?: string },
) => {
  // validate background and color are hex colors
  const background = parseColor(options.background)
  const color = parseColor(options.color ?? "#ffffff")

  // get initials
  const initials = getInitials(name)

  // generate 64x64 svg with initials in the center (horizontal and vertical) with font color and background color and font family Helvetica (plus fallbacks)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
    <rect width="64" height="64" fill="${background}" />
    <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-size="28" font-family="Helvetica, Arial, sans-serif" fill="${color}">${initials}</text>
    </svg>`
  return `data:image/svg+xml;base64,${btoa(svg)}`
}
