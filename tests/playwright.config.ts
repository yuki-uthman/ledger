import { defineConfig, devices } from '@playwright/test'

// Every acceptance byte lives under tests/. The run judges the BUILT bundle served
// over a real loopback origin, so the spec owns starting the stack, building and
// serving; there is no webServer entry and no dev server.
export default defineConfig({
  testDir: './acceptance',
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
      name: 'phone-chromium',
      use: {
        ...devices['Desktop Chrome'],
        // A phone, as the brief describes the only client.
        viewport: { width: 360, height: 780 },
        isMobile: false,
        trace: 'retain-on-failure',
      },
    },
    // The same phone, with a finger. The swipe is a touch gesture, so the only
    // honest way to read it is to put a real touch point on the served page. The
    // touch specs live in a directory of their own, which this project names
    // itself, so one run collects every spec exactly once and the project above
    // keeps scanning the acceptance directory alone - every mouse-driven reading
    // there means exactly what it meant before the gesture existed.
    {
      name: 'phone-touch',
      testDir: './touch',
      testMatch: '**/*.touch.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 360, height: 780 },
        isMobile: false,
        hasTouch: true,
        trace: 'retain-on-failure',
      },
    },
  ],
})
