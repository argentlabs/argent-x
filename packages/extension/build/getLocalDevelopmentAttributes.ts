import fs from "fs"
import path from "path"
import { z } from "zod"

/**
 * Look for linked local `@argent/...` package overrides in the provided package.json
 * - determine what peer dependencies should be installed, warn if missing
 * - and what package paths to load source maps for
 *
 * @example
 * ```json
 * "pnpm": {
 *   "overrides": {
 *     "@argent/x-shared": "link:../x-shared",
 *     "@argent/x-ui": "link:../x-ui"
 *   }
 * }
 * ```
 */

const packageWithPnpmOverridesSchema = z.object({
  pnpm: z.object({
    overrides: z.record(z.string(), z.string()),
  }),
})

type PackageWithPnpmOverrides = z.infer<typeof packageWithPnpmOverridesSchema>

function isPackageWithPnpmOverrides(
  pkg: unknown,
): pkg is PackageWithPnpmOverrides {
  return packageWithPnpmOverridesSchema.safeParse(pkg).success
}

export function getLocalDevelopmentAttributes(pkg: unknown) {
  if (!isPackageWithPnpmOverrides(pkg)) {
    return {
      hasLinkedPackageOverrides: false,
    }
  }
  const rootPackageOverrides = pkg.pnpm.overrides
  // only interested in root `@argent/...` packages with `link:...`
  const argentLinkedPackageOverrides = Object.entries(
    rootPackageOverrides,
  ).filter(([name, spec]) => {
    return name.startsWith("@argent") && spec.startsWith("link:")
  })
  if (!argentLinkedPackageOverrides.length) {
    return {
      hasLinkedPackageOverrides: false,
    }
  }
  console.log(
    "✅ Detected local packages using link: - prioritising local `node_modules`",
  )
  const sourcemapResourcePaths: string[] = []
  argentLinkedPackageOverrides.forEach(([name, spec]) => {
    const specPath = spec.substring(5)
    const packagePath = path.join(__dirname, "../../../", specPath)
    console.log(`✅ ${name} => ${packagePath}`)
    sourcemapResourcePaths.push(packagePath)
    const packageJsonRaw = fs.readFileSync(
      path.join(packagePath, "package.json"),
      "utf8",
    )
    const packageJson = JSON.parse(packageJsonRaw)
    const peerDependencies = packageJson.peerDependencies
    const peerDependencyNames = Object.keys(peerDependencies)
    peerDependencyNames.forEach((pkgName) => {
      const localPath = path.resolve(__dirname, `../node_modules/${pkgName}`)
      if (!fs.existsSync(localPath)) {
        console.error("❌ Missing local peer dependency", pkgName)
      }
    })
  })
  return {
    hasLinkedPackageOverrides: true,
    sourcemapResourcePaths,
  }
}
