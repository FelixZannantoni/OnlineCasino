import * as readline from 'readline';
import { Slotmachine } from './slotmachine';
import { SlotmachinePlayer } from './slotmachinePlayer';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
}); 

function displaySlots(slots: number[][]) {
    console.log('\n--- SLOTS ---');
    for (const row of slots) {
        console.log(row.join(' | '));
    }
    console.log('-------------\n');
}

function ask(query: string): Promise<string> {
    return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
    console.log('Slot Machine Console');
    const player = new SlotmachinePlayer('1', 'Player', 'Player', 1000);
    const game = new Slotmachine('game1', player);

    while (true) {
        console.log(`Balance: ${player.getBalance()}`);
        const input = await ask('Enter bet amount (or "q" to quit): ');

        if (input.toLowerCase() === 'q') break;

        const bet = parseInt(input);
        if (isNaN(bet) || bet <= 0 || bet > player.getBalance()) {
            console.log('Invalid bet.');
            continue;
        }

        player.setDesiredBet(bet);
        player.userPressedSpin();
        game.startGame();

        displaySlots(game.getSlots() as number[][]);

        const win = game.getLastWin();
        if (win > 0) {
            console.log(`WIN: ${win}!`);
        } else {
            console.log('No win.');
        }
    }

    console.log('Bye!');
    rl.close();
}

main();
