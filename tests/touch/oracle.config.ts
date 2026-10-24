import { defineConfig, devices } from '@playwright/test'

// Acceptance support: the witness configuration this value's own vector reads.
//
// WHY it exists. The swipe is driven by real touch, and the project that offers
// touch lives in the gate's own configuration - which is a craft target. At the
// Request's baseline that configuration scans the acceptance directory alone, so
// the touch spec is not collected at all and a run of it can report nothing but
// a setup failure: no assertion of the product would ever be reached, and a red
// oracle and a broken environment would look alike. This configuration holds the
// one project the batch names, so the spec can be collected and run against the
// unchanged source, and the vector's one observation line then counts failed
// ASSERTIONS. The acceptance vector's own bytes are untouched: it already reads
// the configuration it is pointed at from its environment, and the other oracles
// of this Request are recorded against those same bytes.
//
// WHY it says the device twice, and what falsifies a drift. This file and the
// project the craft adds to the gate's configuration describe the same phone.
// Keeping the two the same is this value's own obligation, and it is falsified by
// the spec itself rather than by a comment: the same spec runs here, in this
// value's vector, and there, in the one serialised acceptance run over both
// projects, so a device that had drifted would answer differently in the two
// runs. It is inside the type-check project that covers the whole test tree, so
// the build refuses it the moment it stops compiling.
//
// It declares no server. The spec owns bringing the local stack up, building the
// bundle and serving it over the real loopback origin, exactly as every other
// spec of this repository does.
export default defineConfig({
  // This file sits in the touch directory, which is the only directory scanned,
  // and only the touch specs are collected - so the configuration is never
  // collected as a spec of its own.
  testDir: '.',
  testMatch: '**/*.touch.spec.ts',
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [['list']],
  // Bringing up Docker, resetting the database and running a production build all
  // happen inside the run, so the budget is generous.
  timeout: 300_000,
  expect: { timeout: 15_000 },
  projects: [
    {
      name: 'phone-touch',
      use: {
        ...devices['Desktop Chrome'],
        // The same phone the rest of the batch is read on, with a finger.
        viewport: { width: 360, height: 780 },
        isMobile: false,
        hasTouch: true,
        trace: 'retain-on-failure',
      },
    },
  ],
})
