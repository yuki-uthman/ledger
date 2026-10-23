import { test, expect, type Page } from '@playwright/test'
import {
  ORIGIN,
  buildBundle,
  serveDist,
  startLocalStack,
  type ServedOrigin,
  type Stack,
} from '../support/local-stack.js'
import { createAccount, seedHistory, type Account } from '../support/accounts.js'

// Refined board value 8: layout and install hold AFTER the entrances.
//
// Judged only through the declared public port: the built bundle as Chrome loads it
// over the served origin -- the document and its computed layout at several viewport
// widths, the stable data attributes the board fixes (data-box, data-action,
// data-form, data-person-chip, data-pill, data-motion), the same-origin stylesheet
// as it is served, the manifest and the icon bytes, and the service worker
// registration. Nothing here reaches into src/.
//
// Every measurement is taken at REST. The entrances move cards and form rows while
// data-motion is present, and the currency pill slides between the halves of the
// switch, so a screen is measured only once no element carries data-motion, the
// pressed currency pill has arrived over its own half, and the layout has stopped
// changing. Only invariants are judged (nothing scrolls sideways, nothing is cut off,
// the bottom buttons stay on screen); how the board looks is judged on the phone.

const PASSWORD_FIELD = 'input[type="password"]'

// Three Android phone widths and a wide screen.
const WIDTHS = [
  { width: 360, height: 780 },
  { width: 390, height: 844 },
  { width: 412, height: 915 },
  { width: 800, height: 900 },
] as const

const LAYOUT_ACCOUNT = {
  email: 'owner-layout@abbaas.test',
  password: 'layout-password-8',
} as const

// A person and a few sends and payments, so Home shows a filled box, day labels and
// cards on both halves of the centre line -- the widest Home the board draws.
const SEEDED_PEOPLE = ['Ahmed Shifaz', 'Mariyam Nisha'] as const

let stack: Stack
let served: ServedOrigin
let account: Account

test.describe.configure({ mode: 'serial' })

test.beforeAll(async () => {
  stack = startLocalStack()
  buildBundle(stack)
  served = await serveDist()
  account = await createAccount(stack, LAYOUT_ACCOUNT)
  await seedHistory(
    stack,
    account,
    SEEDED_PEOPLE,
    [
      {
        kind: 'send',
        currency: 'USD',
        amountMinor: 74000,
        rate: null,
        usdCents: 74000,
        entryDate: '2026-10-05',
        savedAt: '2026-10-05T09:00:00Z',
        personName: 'Mariyam Nisha',
      },
      {
        kind: 'send',
        currency: 'MVR',
        amountMinor: 1540000,
        rate: '15.4000',
        usdCents: 100000,
        entryDate: '2026-10-02',
        savedAt: '2026-10-02T09:00:00Z',
        personName: 'Ahmed Shifaz',
      },
      {
        kind: 'receive',
        currency: 'USD',
        amountMinor: 10000,
        rate: null,
        usdCents: 10000,
        entryDate: '2026-10-08',
        savedAt: '2026-10-08T09:00:00Z',
      },
    ],
  )
})

test.afterAll(async () => {
  await served?.close()
})

const signIn = async (page: Page): Promise<void> => {
  await page.goto(ORIGIN)
  await expect(page.locator(PASSWORD_FIELD)).toBeVisible()
  await page.getByLabel('Email').fill(account.email)
  await page.getByLabel('Password').fill(account.password)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page.locator(PASSWORD_FIELD)).toHaveCount(0)
}

type Rect = { x: number; y: number; width: number; height: number }

const rectOf = async (page: Page, selector: string): Promise<Rect> => {
  const locator = page.locator(selector)
  await expect(locator).toBeVisible()
  const rect = await locator.boundingBox()
  if (!rect) throw new Error(`${selector} has no layout box`)
  return rect
}

/** The page never scrolls sideways, and no visible element escapes the viewport. */
const expectNoHorizontalOverflow = async (page: Page, label: string): Promise<void> => {
  const overflow = await page.evaluate(() => {
    const root = document.documentElement
    const limit = root.clientWidth
    const escapes: string[] = []
    // The view the owner is not reading rests off the side of the phone, on a track
    // twice the viewport's width that carries both views: that is where it belongs, not
    // an escape anyone can see. So the pane that is not shown is passed over, and so is
    // the one track that holds the panes as its own children -- and nothing else. The
    // shell around that track stays in the scan, where a sideways escape of the shell
    // itself is exactly what the owner would see. On a product that has no panes yet
    // nothing is passed over and this reads exactly as it did.
    const shown = document.querySelector('[data-shown]')?.getAttribute('data-shown') ?? null
    for (const element of Array.from(document.body.querySelectorAll('*'))) {
      const pane = element.closest('[data-pane]')
      if (pane !== null && shown !== null && pane.getAttribute('data-pane') !== shown) continue
      if (element.querySelector(':scope > [data-pane]') !== null) continue
      const rect = element.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) continue
      const style = window.getComputedStyle(element)
      if (style.visibility === 'hidden' || style.display === 'none') continue
      if (rect.right > limit + 1 || rect.left < -1) {
        escapes.push(`${element.tagName.toLowerCase()} ${Math.round(rect.left)}..${Math.round(rect.right)}`)
      }
    }
    return { scrollWidth: root.scrollWidth, clientWidth: limit, escapes: escapes.slice(0, 5) }
  })

  expect(overflow.escapes, `${label}: elements escaping the viewport`).toEqual([])
  expect(overflow.scrollWidth, `${label}: horizontal scrolling`).toBeLessThanOrEqual(overflow.clientWidth)
}

/** The Send and Receive buttons are never cut off by the bottom of the screen. */
const expectBottomClearance = async (page: Page, label: string): Promise<void> => {
  const viewport = page.viewportSize()
  if (!viewport) throw new Error('no viewport')
  for (const action of ['send', 'receive'] as const) {
    const rect = await rectOf(page, `[data-action="${action}"]`)
    expect(rect.y, `${label}: ${action} button starts on screen`).toBeGreaterThanOrEqual(0)
    expect(
      rect.y + rect.height,
      `${label}: ${action} button ends on screen`,
    ).toBeLessThanOrEqual(viewport.height)
  }
}

/**
 * A fingerprint of everything this oracle measures, so "at rest" can be decided from
 * the page itself: the document's scrollable width, and the box of every element the
 * checks look at. Two identical samples a few frames apart mean nothing is moving.
 */
const layoutSignature = (page: Page): Promise<string> =>
  page.evaluate(() => {
    const root = document.documentElement
    const parts = [`${root.scrollWidth}/${root.clientWidth}`]
    const selector =
      '[data-box], [data-action], [data-form], [data-entry], [data-after], [data-row], [data-pill], button, a'
    for (const element of Array.from(document.querySelectorAll(selector))) {
      const rect = element.getBoundingClientRect()
      parts.push(
        `${rect.left.toFixed(1)},${rect.top.toFixed(1)},${rect.width.toFixed(1)},${rect.height.toFixed(1)}`,
      )
    }
    return parts.join('|')
  })

/** Whether the sliding currency pill has arrived over the pressed currency button. */
const pillState = (page: Page, formKind: string): Promise<string> =>
  page.evaluate((kind) => {
    const form = document.querySelector(`[data-form="${kind}"]`)
    if (!form) return 'no form'
    const pill = form.querySelector('[data-pill]')
    if (!pill) return 'no pill'
    const currency = Array.from(form.querySelectorAll('button[aria-pressed]')).filter((button) =>
      ['USD', 'MVR'].includes((button.textContent ?? '').trim()),
    )
    const pressed = currency.filter((button) => button.getAttribute('aria-pressed') === 'true')
    if (pressed.length !== 1) return `pressed currencies: ${pressed.length}`
    const pillBox = pill.getBoundingClientRect()
    const pressedBox = pressed[0]!.getBoundingClientRect()
    const pillCentre = pillBox.left + pillBox.width / 2
    const pressedCentre = pressedBox.left + pressedBox.width / 2
    return Math.abs(pillCentre - pressedCentre) <= 6 ? 'over the pressed half' : 'still sliding'
  }, formKind)

/**
 * Waits until the screen is at rest: no element carries data-motion (value 7's
 * entrances and value 6's save motion are over), the currency pill of a form has
 * reached its pressed half, and the layout has stopped changing between samples.
 */
const settle = async (page: Page, label: string, formKind?: string): Promise<void> => {
  await expect
    .poll(() => page.locator('[data-motion]').count(), {
      timeout: 5_000,
      message: `${label}: every entrance has finished (no data-motion)`,
    })
    .toBe(0)

  if (formKind) {
    await expect
      .poll(() => pillState(page, formKind), {
        timeout: 5_000,
        message: `${label}: the currency pill has reached the pressed half`,
      })
      .toBe('over the pressed half')
  }

  let previous = await layoutSignature(page)
  await expect
    .poll(
      async () => {
        await page.waitForTimeout(120)
        const current = await layoutSignature(page)
        const steady = current === previous
        previous = current
        return steady
      },
      { timeout: 5_000, message: `${label}: the layout has stopped moving` },
    )
    .toBe(true)
}

/**
 * Walks the refined board's screens -- Home, the send form in USD and in MVR, and the
 * receive form -- letting each come to rest before the checks run.
 */
const forEachScreen = async (
  page: Page,
  label: string,
  check: (screen: string) => Promise<void>,
): Promise<void> => {
  await expect(page.locator('[data-box="abbaas"]')).toBeVisible()
  await settle(page, `${label} Home`)
  await check(`${label} Home`)

  await page.locator('[data-action="send"]').click()
  await expect(page.locator('[data-form="send"]')).toBeVisible()
  await settle(page, `${label} send form USD`, 'send')
  await check(`${label} send form USD`)

  // The MVR state opens the rate row, which is the tallest the form gets.
  await page.locator('[data-form="send"]').getByRole('button', { name: 'MVR', exact: true }).click()
  await settle(page, `${label} send form MVR`, 'send')
  await check(`${label} send form MVR`)

  await page.getByRole('button', { name: 'Close' }).click()
  await expect(page.locator('[data-form="send"]')).toHaveCount(0)

  // Closing a form without saving replays Home's entrance, so Home settles again.
  await expect(page.locator('[data-box="abbaas"]')).toBeVisible()
  await settle(page, `${label} Home after Close`)

  await page.locator('[data-action="receive"]').click()
  await expect(page.locator('[data-form="receive"]')).toBeVisible()
  await settle(page, `${label} receive form`, 'receive')
  await check(`${label} receive form`)

  await page.getByRole('button', { name: 'Close' }).click()
  await expect(page.locator('[data-form="receive"]')).toHaveCount(0)
  await expect(page.locator('[data-box="abbaas"]')).toBeVisible()
  await settle(page, `${label} Home after Close`)
}

test('at rest, no screen scrolls sideways or cuts anything off, and the bottom buttons stay on screen', async ({
  page,
}) => {
  await page.setViewportSize({ width: WIDTHS[0].width, height: WIDTHS[0].height })
  await signIn(page)

  for (const viewport of WIDTHS) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    const label = `${viewport.width}x${viewport.height}`

    await forEachScreen(page, label, async (screen) => {
      await expectNoHorizontalOverflow(page, screen)
    })

    // ----- The bottom buttons, measured on Home at rest. -----
    await settle(page, `${label} Home column`)
    await expectBottomClearance(page, `${label} Home`)
  }

  // ===== The bottom controls are offset by the gesture-bar inset. =====
  // Headless Chromium reports every safe-area inset as 0, so the inset is judged on
  // the stylesheet the origin actually serves, which is the shipped artefact.
  const cssHrefs = await page
    .locator('link[rel="stylesheet"]')
    .evaluateAll((links) =>
      links.map((link) => (link as HTMLLinkElement).href).filter((href) => href.startsWith(window.location.origin)),
    )
  expect(cssHrefs.length, 'the bundle serves its own stylesheet').toBeGreaterThan(0)

  const stylesheets = await Promise.all(
    cssHrefs.map(async (href) => {
      const response = await page.request.get(href)
      expect(response.status(), `${href} status`).toBe(200)
      return response.text()
    }),
  )
  expect(stylesheets.some((css) => css.includes('env(safe-area-inset-bottom)'))).toBe(true)
})

// The page paints a background of its own under every screen. Which colour is a design
// choice judged on the phone, not here.
test('the page still paints a background under every screen', async ({ page }) => {
  await page.setViewportSize({ width: WIDTHS[0].width, height: WIDTHS[0].height })
  await signIn(page)
  await settle(page, 'Home palette')

  expect(await page.evaluate(() => window.getComputedStyle(document.body).backgroundColor)).not.toBe(
    'rgba(0, 0, 0, 0)',
  )
})

test('Chrome can add the app to the home screen: manifest, icons, theme colour and a service worker', async ({
  page,
}) => {
  await page.goto(ORIGIN)

  // ----- The document declares the install surface. -----
  const manifestHref = await page
    .locator('link[rel="manifest"]')
    .first()
    .evaluate((link) => (link as HTMLLinkElement).href)
  expect(manifestHref).toContain('manifest.webmanifest')

  const themeColor = await page.locator('meta[name="theme-color"]').getAttribute('content')
  expect(themeColor, 'the document declares a theme colour').toBeTruthy()
  const appleIcon = await page
    .locator('link[rel="apple-touch-icon"]')
    .first()
    .evaluate((link) => (link as HTMLLinkElement).href)
  expect(appleIcon).toContain('icons/icon-192.png')

  // ----- The manifest, as the origin serves it. -----
  const manifestResponse = await page.request.get(manifestHref)
  expect(manifestResponse.status()).toBe(200)
  const manifest = JSON.parse(await manifestResponse.text()) as {
    name?: string
    short_name?: string
    display?: string
    start_url?: string
    scope?: string
    background_color?: string
    theme_color?: string
    icons?: ReadonlyArray<{ src?: string; sizes?: string; type?: string; purpose?: string }>
  }

  expect(manifest.name).toBe('Abbaas Ledger')
  expect(manifest.short_name).toBe('Ledger')
  // Standalone is what drops the browser bar on the home-screen launch.
  expect(manifest.display).toBe('standalone')
  // Relative, so the app installs from the GitHub Pages sub-path too.
  expect(manifest.start_url).toBe('.')
  expect(manifest.scope).toBe('.')
  expect(manifest.background_color, 'the manifest declares a background colour').toBeTruthy()
  // The manifest and the document agree on the theme colour.
  expect(manifest.theme_color).toBe(themeColor)

  const icons = manifest.icons ?? []
  const sizes = icons.map((icon) => icon.sizes)
  // Chrome's install criteria ask for an icon of at least 192 px and one of 512 px.
  expect(sizes).toContain('192x192')
  expect(sizes).toContain('512x512')
  expect(
    icons.some((icon) => (icon.purpose ?? '').split(/\s+/).includes('maskable')),
    'one icon is maskable, so Android may shape it',
  ).toBe(true)

  // ----- Every declared icon really answers with a PNG of its declared size. -----
  for (const icon of icons) {
    expect(icon.src, 'every icon names a source').toBeTruthy()
    expect(icon.type).toBe('image/png')
    const iconUrl = new URL(icon.src!, manifestHref).toString()
    const response = await page.request.get(iconUrl)
    expect(response.status(), `${icon.src} status`).toBe(200)
    expect(response.headers()['content-type'], `${icon.src} type`).toContain('image/png')

    // The PNG header carries the pixel size, so a placeholder of the wrong size or
    // the single-page HTML fallback cannot pass as an icon.
    const bytes = await response.body()
    expect(
      Array.from(bytes.subarray(0, 8)),
      `${icon.src} is a PNG`,
    ).toEqual([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    const pixelWidth = bytes.readUInt32BE(16)
    const pixelHeight = bytes.readUInt32BE(20)
    expect(`${pixelWidth}x${pixelHeight}`, `${icon.src} pixels`).toBe(icon.sizes)
  }

  // ----- A service worker is registered, which is what makes Chrome offer install. -----
  await expect
    .poll(
      () =>
        page.evaluate(async () => {
          if (!('serviceWorker' in navigator)) return 'unsupported'
          const registration = await navigator.serviceWorker.getRegistration()
          return registration ? 'registered' : 'none'
        }),
      { timeout: 15_000, message: 'a service worker registration after load' },
    )
    .toBe('registered')

  // The page still works as an ordinary web page: registration never breaks sign-in.
  await expect(page.locator(PASSWORD_FIELD)).toBeVisible()
})
