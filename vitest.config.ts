import { defineConfig } from 'vitest/config'

// The unit runner's discovery, and nothing else. It is a file of its own rather
// than a section of the build configuration, so a test setting can never reach
// the bundle that is deployed.
//
// It is confined to the unit directory and the .test.ts name: every other test of
// this repository is an acceptance spec driven by Playwright over a built bundle
// and a live stack, and the unit runner must never collect one. An empty run
// passes, so this gate reads green from the first value of a batch rather than
// only once a unit test lands.
export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.ts'],
    passWithNoTests: true,
  },
})
