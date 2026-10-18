// Acceptance support: the verification vector of this Request's oracles.
//
// It runs the repository's own Playwright binary against tests/playwright.config.ts
// with the list and json reporters, sends the runner's own output to standard error,
// and prints on standard output exactly one line:
//
//   DES-ORACLE-OBSERVATION: {"version":1,"observed":N,"assertions_failed":N,"setup_failed":N}
//
// counted from the runner's own json report, so a reader learns WHAT was observed and
// never only an exit status: a run whose cases failed on their assertions is a red
// oracle, while a run whose cases failed before any assertion -- no stack, no build,
// no seeded account -- is a broken environment, and the two must never look alike.
// The wrapper exits with the runner's own status.
//
// Classifying a failed case. Measured against this repository's own runner (Playwright
// 1.63.0): an assertion carrying a failure message puts that message on the first line
// of the error and its matcher line below it, while a helper that throws puts its own
// words on the first line and may QUOTE an assertion in the code frame it prints. So a
// case is counted as an assertion failure when the error names a matcher -- a line
// beginning expect( or 'Timed out <n>ms waiting for expect(' -- outside the code frame
// and the stack, which are skipped. Every other failed case, and every report-level
// error, is counted as a setup failure.
import { spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const config = process.env.DES_ORACLE_CONFIG ?? 'tests/playwright.config.ts'
const specs = process.argv.slice(2)
const report = join(mkdtempSync(join(tmpdir(), 'des-oracle-')), 'report.json')

// The repository's own binary, never a globally installed one: the version the
// oracle is judged on is the version package.json pins.
const playwright = join(repoRoot, 'node_modules', '.bin', 'playwright')

/** The one line this vector prints on standard output. */
const observe = (counts) => {
  process.stdout.write(`DES-ORACLE-OBSERVATION: ${JSON.stringify({ version: 1, ...counts })}\n`)
}

// The vector is run in fresh checkouts of the repository that carry no installed
// dependencies, so it installs the pinned ones itself before it can run anything. An
// install that fails is a setup failure with its reason on standard error, never a red
// oracle: nothing about the product was observed.
if (!existsSync(playwright)) {
  process.stderr.write(
    'The runner is not installed in this checkout; installing the pinned dependencies from the lockfile.\n',
  )
  const install = spawnSync('npm', ['ci', '--no-audit', '--no-fund', '--loglevel', 'error'], {
    cwd: repoRoot,
    stdio: ['ignore', 2, 'inherit'],
  })
  if (install.error) {
    process.stderr.write(`Could not start the installer: ${install.error.message}\n`)
  }
  if (install.status !== 0 || !existsSync(playwright)) {
    process.stderr.write(
      `The pinned dependencies could not be installed (installer status ${install.status ?? 'none'}), so the runner is absent and no case was observed.\n`,
    )
    observe({ observed: 0, assertions_failed: 0, setup_failed: 1 })
    process.exit(install.status === 0 || install.status === null ? 1 : install.status)
  }
}

const run = spawnSync(
  playwright,
  ['test', '--config', config, '--reporter=list,json', ...specs],
  {
    cwd: repoRoot,
    // The runner's own list output goes to standard error, leaving standard output
    // for the one observation line.
    stdio: ['ignore', 2, 'inherit'],
    env: { ...process.env, PLAYWRIGHT_JSON_OUTPUT_NAME: report },
  },
)

if (run.error) {
  process.stderr.write(`Could not start the runner: ${run.error.message}\n`)
}

const plain = (text) => text.replace(/\u001b\[[0-9;]*m/g, '')
/** A code-frame line ('> 12 | await expect(...)') or a stack line ('    at /path:1:2'). */
const isQuotedSource = (line) => /^\s*>?\s*\d+\s*\|/.test(line) || /^\s*at\s/.test(line)
const namesAMatcher = (message) =>
  plain(message)
    .split('\n')
    .filter((line) => !isQuotedSource(line))
    .some((line) => /^(Timed out \d+ms waiting for )?expect[(.]/.test(line.replace(/^Error:\s*/, '')))

let observed = 0
let assertionsFailed = 0
let setupFailed = 0

if (!existsSync(report)) {
  // No report at all: the runner never reached its own cases.
  setupFailed = 1
} else {
  const results = JSON.parse(readFileSync(report, 'utf8'))
  const stats = results.stats ?? {}
  observed = (stats.expected ?? 0) + (stats.unexpected ?? 0) + (stats.flaky ?? 0)
  setupFailed += (results.errors ?? []).length

  const walk = (suites) => {
    for (const suite of suites ?? []) {
      for (const spec of suite.specs ?? []) {
        for (const singleCase of spec.tests ?? []) {
          const last = (singleCase.results ?? []).at(-1)
          if (!last) continue
          if (last.status === 'passed' || last.status === 'skipped') continue
          const errors = last.errors ?? []
          if (errors.some((error) => namesAMatcher(error.message ?? ''))) assertionsFailed += 1
          else setupFailed += 1
        }
      }
      walk(suite.suites)
    }
  }
  walk(results.suites)
}

observe({ observed, assertions_failed: assertionsFailed, setup_failed: setupFailed })
process.exit(run.status ?? 1)
