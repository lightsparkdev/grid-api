import { test, expect } from '@playwright/test'

// These tests drive the full React UI against the running Kotlin backend + Grid sandbox API.
// Prerequisites: `cd samples/kotlin && ./gradlew run` must be running on port 8080.

test.describe('Payout Flow', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toHaveText('Grid API Sample')
  })

  test('page loads with step 1 active', async ({ page }) => {
    const step1 = page.locator('h3', { hasText: '1. Create Customer' })
    await expect(step1).toBeVisible()

    // Create Customer button should be enabled
    await expect(page.getByRole('button', { name: 'Create Customer' })).toBeEnabled()
  })

  test('create customer advances to step 2', async ({ page }) => {
    await page.getByRole('button', { name: 'Create Customer' }).click()

    // Wait for step 2 to become active
    await expect(page.getByRole('button', { name: 'Create External Account' })).toBeEnabled({ timeout: 15_000 })

    // Step 1 should show a green checkmark summary with ID
    const step1Summary = page.locator('span.text-green-400.font-mono')
    await expect(step1Summary.first()).toContainText('ID:')

    // Country dropdown should be visible
    await expect(page.locator('#destination-country')).toBeVisible()
  })

  test('country dropdown changes the JSON body', async ({ page }) => {
    await page.getByRole('button', { name: 'Create Customer' }).click()
    await expect(page.getByRole('button', { name: 'Create External Account' })).toBeEnabled({ timeout: 15_000 })

    // Default country (IN) should populate the textarea
    const textarea = page.locator('textarea').nth(1)

    // Switch to India
    await page.locator('#destination-country').selectOption('IN')
    await expect(textarea).toHaveValue(/INR_ACCOUNT/, { timeout: 3_000 })
    await expect(textarea).toHaveValue(/vpa/)

    // Switch to Brazil
    await page.locator('#destination-country').selectOption('BR')
    await expect(textarea).toHaveValue(/BRL_ACCOUNT/, { timeout: 3_000 })
    await expect(textarea).toHaveValue(/pixKey/)
  })

  test('full flow: customer → external account → quote', async ({ page }) => {
    // Step 1: Create Customer
    await page.getByRole('button', { name: 'Create Customer' }).click()
    await expect(page.getByRole('button', { name: 'Create External Account' })).toBeEnabled({ timeout: 15_000 })

    // Step 2: Create External Account (default country)
    await page.getByRole('button', { name: 'Create External Account' }).click()
    await expect(page.getByRole('button', { name: 'Create Quote' })).toBeEnabled({ timeout: 15_000 })

    // Step 2 summary should show ID
    const summaries = page.locator('span.text-green-400.font-mono')
    await expect(summaries.nth(1)).toContainText('ID:')

    // Step 3: Source currency dropdown should be visible
    await expect(page.locator('#source-currency')).toBeVisible()

    // Verify quote JSON body has the right structure
    const quoteTextarea = page.locator('textarea').last()
    await expect(quoteTextarea).toHaveValue(/REALTIME_FUNDING/)
    await expect(quoteTextarea).toHaveValue(/"currency": "USD"/)

    // Create Quote
    await page.getByRole('button', { name: 'Create Quote' }).click()
    await expect(page.getByRole('button', { name: 'Send Sandbox Funds' })).toBeEnabled({ timeout: 15_000 })
  })

  test('full flow with India INR', async ({ page }) => {
    // Step 1: Create Customer
    await page.getByRole('button', { name: 'Create Customer' }).click()
    await expect(page.getByRole('button', { name: 'Create External Account' })).toBeEnabled({ timeout: 15_000 })

    // Step 2: Switch to India and create account
    await page.locator('#destination-country').selectOption('IN')
    await expect(page.locator('textarea').nth(1)).toHaveValue(/INR_ACCOUNT/, { timeout: 3_000 })
    await page.getByRole('button', { name: 'Create External Account' }).click()
    await expect(page.getByRole('button', { name: 'Create Quote' })).toBeEnabled({ timeout: 15_000 })

    // Step 3: Create Quote
    await page.getByRole('button', { name: 'Create Quote' }).click()
    await expect(page.getByRole('button', { name: 'Send Sandbox Funds' })).toBeEnabled({ timeout: 15_000 })
  })

  test('source currency dropdown updates quote body', async ({ page }) => {
    // Step 1 + 2: Get to quote step
    await page.getByRole('button', { name: 'Create Customer' }).click()
    await expect(page.getByRole('button', { name: 'Create External Account' })).toBeEnabled({ timeout: 15_000 })
    await page.getByRole('button', { name: 'Create External Account' }).click()
    await expect(page.getByRole('button', { name: 'Create Quote' })).toBeEnabled({ timeout: 15_000 })

    // Default should be USD
    const quoteTextarea = page.locator('textarea').last()
    await expect(quoteTextarea).toHaveValue(/"currency": "USD"/)

    // Switch to USDC
    await page.locator('#source-currency').selectOption('USDC')
    await expect(quoteTextarea).toHaveValue(/"currency": "USDC"/, { timeout: 3_000 })

    // Description text should update
    await expect(page.getByText('USDC →')).toBeVisible()
  })

  test('Start New Payment resets to step 2', async ({ page }) => {
    // Step 1: Create Customer
    await page.getByRole('button', { name: 'Create Customer' }).click()
    await expect(page.getByRole('button', { name: 'Create External Account' })).toBeEnabled({ timeout: 15_000 })

    // Step 2: Create External Account
    await page.getByRole('button', { name: 'Create External Account' }).click()
    await expect(page.getByRole('button', { name: 'Create Quote' })).toBeEnabled({ timeout: 15_000 })

    // Click Start New Payment
    await page.getByRole('button', { name: 'Start New Payment' }).click()

    // Should be back at step 2 with external account button enabled
    await expect(page.getByRole('button', { name: 'Create External Account' })).toBeEnabled()

    // Step 3 should be future (dimmed), quote button should not be visible
    await expect(page.getByRole('button', { name: 'Create Quote' })).not.toBeVisible()
  })

  test('full payout flow including sandbox funding', async ({ page }) => {
    // Step 1: Create Customer
    await page.getByRole('button', { name: 'Create Customer' }).click()
    await expect(page.getByRole('button', { name: 'Create External Account' })).toBeEnabled({ timeout: 15_000 })

    // Step 2: Create External Account (default country)
    await page.getByRole('button', { name: 'Create External Account' }).click()
    await expect(page.getByRole('button', { name: 'Create Quote' })).toBeEnabled({ timeout: 15_000 })

    // Step 3: Create Quote
    await page.getByRole('button', { name: 'Create Quote' }).click()
    await expect(page.getByRole('button', { name: 'Send Sandbox Funds' })).toBeEnabled({ timeout: 15_000 })

    // Step 4: Send Sandbox Funds
    await page.getByRole('button', { name: 'Send Sandbox Funds' }).click()

    // After funding, all 4 steps should be completed (4 green checkmarks)
    const checkmarks = page.locator('text=✓')
    await expect(checkmarks).toHaveCount(4, { timeout: 15_000 })
  })
})
