// Snakes and Ladders Game Controller using Playwright
const { chromium, devices } = require('playwright');
const path = require('path');

const GAME_URL = 'https://d2drhksbtcqozo.cloudfront.net/casino/apex/layer/?gameid=bigstacknutcrack&partnerid=1&channel=web&moneymode=fun&jurisdiction=MT&lang=en_GB&currency=EUR&apex=1&gameurl=https%3A%2F%2Fd2drhksbtcqozo.cloudfront.net%2Fcasino%2Flauncher.html';
const API_PATTERN = /stag-casino-client\.api\.relax/;

// Game configuration
const SCATTER_SYMBOL = 'WI';
const SCATTERS_NEEDED = 1; // Lowered to 1 for easier testing

// Snake and Ladder positions
const SNAKES = {
    18: 7,
    29: 22,
    38: 34
};

const LADDERS = {
    8: 16,
    25: 32
};

const FINISH_POSITION = 40;

async function startGame() {
    console.log('🎲 Starting Snakes and Ladders Game...\n');

    const browser = await chromium.launch({
        headless: false,
        args: ['--disable-web-security']
    });

    // Emulate iPhone 13 Pro
    const context = await browser.newContext({
        ...devices['iPhone 13 Pro'],
        locale: 'en-GB',
        timezoneId: 'Europe/London',
    });

    const page = await context.newPage();

    // Load the overlay HTML
    const overlayPath = 'file://' + path.resolve(__dirname, 'overlay.html');
    await page.goto(overlayPath);

    console.log('📱 Loading game overlay...');

    // Wait for overlay to be ready
    await page.waitForSelector('#game-board');

    // Set up game state in the page
    await page.evaluate((gameUrl) => {
        window.GAME_URL = gameUrl;
        window.gameState = {
            position: 1,
            isPlaying: false,
            hasWon: false
        };
    }, GAME_URL);

    // Load the slot game in the iframe
    await page.evaluate(() => {
        const iframe = document.getElementById('slot-game');
        iframe.src = window.GAME_URL;
    });

    console.log('🎰 Slot game loading...\n');

    // Intercept game API responses
    page.on('response', async (response) => {
        const url = response.url();

        if (API_PATTERN.test(url) && url.includes('/play')) {
            try {
                const data = await response.json();

                if (data.symbols && Array.isArray(data.symbols)) {
                    // Count scatter symbols
                    const flatSymbols = data.symbols.flat();
                    const scatterCount = flatSymbols.filter(s => s === SCATTER_SYMBOL).length;

                    console.log(`🎰 Spin detected: ${flatSymbols.join(', ')}`);
                    console.log(`   Scatters (${SCATTER_SYMBOL}): ${scatterCount}`);

                    // If we have enough scatters, roll the dice
                    if (scatterCount >= SCATTERS_NEEDED) {
                        console.log(`   ✨ ${scatterCount} scatters landed! Waiting for reels to stop...\n`);

                        // Wait for slot reels to finish spinning (3 seconds)
                        await new Promise(resolve => setTimeout(resolve, 3000));

                        console.log(`   🎲 Rolling dice...\n`);

                        // Roll dice (1-6)
                        const diceRoll = Math.floor(Math.random() * 6) + 1;

                        // Get current position
                        const currentPosition = await page.evaluate(() => window.gameState.position);
                        const hasWon = await page.evaluate(() => window.gameState.hasWon);

                        if (hasWon) {
                            console.log('   🏆 Game already won! Reset to play again.\n');
                            return;
                        }

                        console.log(`   🎲 Dice roll: ${diceRoll}`);

                        // Calculate new position
                        let newPosition = currentPosition + diceRoll;

                        // Check if exceeded finish
                        if (newPosition > FINISH_POSITION) {
                            newPosition = FINISH_POSITION - (newPosition - FINISH_POSITION);
                            console.log(`   ⚠️  Overshot! Bouncing back to ${newPosition}`);
                        }

                        console.log(`   📍 Moving from ${currentPosition} to ${newPosition}`);

                        // Check for snakes or ladders
                        let finalPosition = newPosition;
                        if (SNAKES[newPosition]) {
                            finalPosition = SNAKES[newPosition];
                            console.log(`   🐍 Snake! Sliding down to ${finalPosition}`);
                        } else if (LADDERS[newPosition]) {
                            finalPosition = LADDERS[newPosition];
                            console.log(`   🪜 Ladder! Climbing up to ${finalPosition}`);
                        }

                        // Check for win
                        const won = finalPosition >= FINISH_POSITION;
                        if (won) {
                            console.log(`   🏆 YOU WON! Reached FINISH!\n`);
                        } else {
                            console.log(`   ✅ New position: ${finalPosition}\n`);
                        }

                        // Update the UI
                        try {
                            await page.evaluate(({ roll, newPos, finalPos, won }) => {
                                console.log('🔍 DEBUG: Calling handleDiceRoll with:', { roll, newPos, finalPos, won });
                                if (window.handleDiceRoll) {
                                    console.log('✅ handleDiceRoll function exists, calling it...');
                                    window.handleDiceRoll(roll, newPos, finalPos, won);
                                } else {
                                    console.error('❌ window.handleDiceRoll is not defined!');
                                }
                            }, { roll: diceRoll, newPos: newPosition, finalPos: finalPosition, won: won });
                            console.log('   📺 UI update sent to browser\n');
                        } catch (uiError) {
                            console.error('   ❌ Error updating UI:', uiError.message);
                        }
                    }
                }
            } catch (e) {
                console.error('   ⚠️  Error parsing response:', e.message);
            }
        }
    });

    console.log('✅ Game ready! Play the slot game and land 2+ scatters to roll the dice.\n');
    console.log('Press Ctrl+C to exit.\n');

    // Keep running
    await new Promise(() => {});
}

// Handle Ctrl+C
process.on('SIGINT', () => {
    console.log('\n\n👋 Thanks for playing!\n');
    process.exit(0);
});

// Start the game
startGame().catch(console.error);
