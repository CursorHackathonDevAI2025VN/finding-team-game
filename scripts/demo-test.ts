import puppeteer from 'puppeteer'

const APP_URL = process.env.APP_URL || 'http://localhost:5173'
const DELAY = 800 // ms between actions for visibility

interface SlotConfig {
  position: 'frontend' | 'backend' | 'design'
  skills: string[]
}

const SLOTS_TO_CREATE: SlotConfig[] = [
  { position: 'frontend', skills: ['React', 'TypeScript'] },
  { position: 'backend', skills: ['Node.js', 'PostgreSQL'] },
  { position: 'design', skills: ['Figma', 'UI/UX'] }
]

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function runDemo() {
  console.log('🚀 Starting UI Demo Test...\n')

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1280, height: 800 },
    args: ['--start-maximized']
  })

  const page = await browser.newPage()

  try {
    // Step 1: Navigate to login page
    console.log('📍 Navigating to login page...')
    await page.goto(`${APP_URL}/login`, { waitUntil: 'networkidle0' })
    await delay(DELAY)

    // Step 2: Login as leader
    console.log('🔐 Logging in as Demo Leader...')
    await page.type('input[type="email"]', 'leader@demo.com', { delay: 50 })
    await delay(300)
    await page.type('input[type="password"]', 'demo123', { delay: 50 })
    await delay(DELAY)

    // Click sign in button
    await page.click('button[type="submit"]')
    await page.waitForNavigation({ waitUntil: 'networkidle0' })
    console.log('✅ Logged in successfully!\n')
    await delay(DELAY)

    // Step 3: Create team (if no team exists)
    console.log('👥 Checking for existing team...')
    const createTeamButton = await page.$('button:has-text("Create Team")')
    if (createTeamButton) {
      console.log('🎮 Creating new team...')
      await createTeamButton.click()
      await delay(DELAY * 2)
      console.log('✅ Team created!\n')
    } else {
      console.log('✅ Team already exists\n')
    }
    await delay(DELAY)

    // Step 4: Add slot cards for each position
    for (let i = 0; i < SLOTS_TO_CREATE.length; i++) {
      const slot = SLOTS_TO_CREATE[i]
      console.log(`🃏 Creating slot ${i + 1}: ${slot.position}...`)

      // Click "Add Slot Card" button
      const addSlotButton = await page.waitForSelector('button:has-text("Add Slot Card")', { timeout: 5000 })
      await addSlotButton?.click()
      await delay(DELAY)

      // Find the last card slot (newly created)
      const cardSlots = await page.$$('[style*="backgroundColor: rgb(42, 42, 74)"]')
      const currentSlot = cardSlots[cardSlots.length - 1]

      if (currentSlot) {
        // Select position from dropdown
        const positionSelect = await currentSlot.$('select')
        if (positionSelect) {
          await positionSelect.select(slot.position)
          console.log(`  📌 Position set: ${slot.position}`)
          await delay(DELAY)
        }

        // Add skills
        const skillInput = await currentSlot.$('input[type="text"]')
        if (skillInput) {
          for (const skill of slot.skills) {
            await skillInput.click()
            await skillInput.type(skill, { delay: 30 })
            await delay(300)
            await page.keyboard.press('Enter')
            console.log(`  🏷️  Skill added: ${skill}`)
            await delay(400)
          }
        }

        // Click Find Match button
        const findMatchButton = await currentSlot.$('button:has-text("Find Match")')
        if (findMatchButton) {
          await delay(DELAY)
          await findMatchButton.click()
          console.log('  🔍 Finding matches...')
          await delay(DELAY * 2)

          // Check for suggestions
          const suggestions = await currentSlot.$$('[style*="backgroundColor: rgb(26, 26, 46)"]')
          if (suggestions.length > 0) {
            console.log(`  ✨ Found ${suggestions.length} suggestion(s)!`)
            
            // Click first suggestion
            await delay(DELAY)
            await suggestions[0].click()
            console.log('  👆 Selected first suggestion')
            await delay(DELAY)
            
            // Handle alert
            page.once('dialog', async dialog => {
              console.log(`  📢 Alert: ${dialog.message()}`)
              await dialog.accept()
            })
            await delay(DELAY)
          } else {
            console.log('  ⚠️  No suggestions found')
          }
        }
      }

      console.log('')
      await delay(DELAY)
    }

    // Step 5: Navigate to profile
    console.log('👤 Navigating to profile...')
    const profileLink = await page.$('a[href="/profile"]')
    if (profileLink) {
      await profileLink.click()
      await page.waitForNavigation({ waitUntil: 'networkidle0' })
      console.log('✅ Profile page loaded')
      await delay(DELAY * 2)
    }

    // Step 6: Navigate back home
    console.log('🏠 Navigating back to home...')
    await page.goto(APP_URL, { waitUntil: 'networkidle0' })
    await delay(DELAY * 2)

    // Final pause for viewing
    console.log('\n🎬 Demo complete! Browser will close in 5 seconds...')
    await delay(5000)

  } catch (error) {
    console.error('❌ Error during demo:', error)
    await delay(3000)
  } finally {
    await browser.close()
    console.log('👋 Browser closed')
  }
}

runDemo().catch(console.error)

