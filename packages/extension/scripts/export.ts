import fs from "fs-extra"
import { minimatch } from "minimatch"
import path from "path"
import dotenv from "dotenv"
import childProcess from "child_process"

const readme = `> This repo has been exported and configured to allow building from source without access to the main git repo

Install \`pnpm\` - see https://pnpm.io/installation

\`\`\`bash
pnpm run setup  # setup dependencies
pnpm build  # run build process for all packages
\`\`\`
`

const manifestVersion = getManifestVersion()

const source = path.resolve(__dirname, "../../..")
const destination = path.resolve(
  source,
  `../argent-x-exported-v${manifestVersion}`,
)

const dotenvSource = path.resolve(__dirname, "../.env")
const dotenvDestination = path.resolve(destination, "packages/extension/.env")

const readmeDestination = path.resolve(destination, "Readme.md")

const exclude = [
  ".git**",
  "**/.next",
  "**/.env",
  "**/dist**",
  "**/.eslintcache",
  "**.log**",
  "**/node_modules**",
  "packages/dapp**",
  "packages/get-starknet**",
  "packages/starknet-react-webwallet-connector**",
  "packages/web**",
]

function getCommitHash() {
  const hash = childProcess.execSync("git rev-parse HEAD")
  return hash.toString().trim()
}

function getManifestVersion() {
  const pkgRaw = fs.readFileSync(
    path.resolve(__dirname, "../manifest/v2.json"),
    "utf8",
  )
  const pkg = JSON.parse(pkgRaw)
  return pkg.version
}

async function preflightCheck() {
  console.log("🚨 CHECK: is the source .env file configured for production?")
  console.log(`   ${dotenvSource}\n`)
  const dotEnvRaw = await fs.readFile(dotenvSource, "utf-8")
  const dotEnvParsed = dotenv.parse(dotEnvRaw)
  if (dotEnvParsed.ARGENT_X_ENVIRONMENT !== "prod") {
    console.log(
      `.env error - expected ARGENT_X_ENVIRONMENT to be "prod" but got "${dotEnvParsed.ARGENT_X_ENVIRONMENT}"`,
    )
    process.exit(1)
  }
}

async function exportFiles() {
  await fs.emptyDir(destination)
  await fs.copy(source, destination, {
    filter: (path) => {
      const repoPath = path.substring(source.length + 1)
      if (!repoPath.length) {
        return true
      }
      const match = exclude.some((pattern) => minimatch(repoPath, pattern))
      return !match
    },
  })
}

async function exportEnv() {
  const dotEnvRaw = await fs.readFile(dotenvSource, "utf-8")
  const filteredComments = dotEnvRaw.replace(/^#.*\n?/gm, "")
  const filteredEmpty = filteredComments.replace(/\n+/gm, "\n")
  const commitHash = getCommitHash()
  const withCommitHash = `${filteredEmpty}\nCOMMIT_HASH_OVERRIDE=${commitHash}\n`
  await fs.writeFile(dotenvDestination, withCommitHash)
  console.log("👀 CHECK: Exported .env:\n")
  console.log(withCommitHash)
}

async function exportReadme() {
  await fs.writeFile(readmeDestination, readme)
}

async function exportForEndUserBuild() {
  await preflightCheck()
  await exportFiles()
  await exportReadme()
  await exportEnv()
  console.log("✅ Buildable source and Readme exported to", destination)
}

;(async () => {
  await exportForEndUserBuild()
})()
