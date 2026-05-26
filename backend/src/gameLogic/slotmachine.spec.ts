import assert from 'node:assert';
import { describe, beforeEach, it } from 'node:test';
import { Slotmachine, Symbols } from './slotmachine';
import { SlotmachinePlayer } from './slotmachinePlayer';

describe('Slotmachine', () => {
    let player: SlotmachinePlayer;
    let game: Slotmachine;

    beforeEach(() => {
        // Initialize player with 1000 balance
        player = new SlotmachinePlayer('user-1', 'testuser', 'Test User', 1000);
        game = new Slotmachine('game-1', player);
    });

    describe('Initialization', () => {
        it('should initialize with an empty grid', () => {
            const slots = game.getSlots();
            assert.deepStrictEqual(slots, [[], [], []]);
        });

        it('should have 10 winning lines defined', () => {
            assert.strictEqual(Slotmachine.WIN_LINES.length, 10);
        });
    });

    describe('Spin Logic', () => {
        it('should generate a 3x5 grid after playing a round', () => {
            player.setDesiredBet(10);
            game.playRound();
            const slots = game.getSlots();
            
            assert.strictEqual(slots.length, 3);
            slots.forEach(row => {
                assert.strictEqual(row.length, 5);
                row.forEach(symbol => {
                    assert.ok((Object.values(Symbols) as Array<string | Symbols>).includes(symbol));
                });
            });
        });
    });

    describe('Win Evaluation (checkSpin)', () => {
        it('should calculate a win for 3 matching symbols on a horizontal line', () => {
            // Force a winning state on Line 1 (Top Horizontal)
            // Line 1 coords: [0,0], [0,1], [0,2], [0,3], [0,4]
            (game as any).slots = [
                [Symbols.Seven, Symbols.Seven, Symbols.Seven, Symbols.Bar, Symbols.Bar],
                [Symbols.Bell, Symbols.Cherry, Symbols.Bell, Symbols.Cherry, Symbols.Bell],
                [Symbols.Bar, Symbols.Bar, Symbols.Bar, Symbols.Bar, Symbols.Bar]
            ];
            
            player.setDesiredBet(10);
            player.makeNewBet(10); // Set current bet to 10
            (game as any).checkSpin();

            // Seven (1000) * Match 3 (0.2) * Bet (10) = 2000
            assert.ok(game.getWinningLines().includes(1));
            assert.strictEqual(game.getLastWin(), 2000);
            assert.strictEqual(player.getBalance(), 1000 + 2000); // 1000 (after makeNewBet) + 2000 (win)
        });

        it('should treat Wild symbols as substitutes for other symbols', () => {
            // Force a winning state on Line 0 (Middle Horizontal) with a Wild
            // Line 0 coords: [1,0], [1,1], [1,2], [1,3], [1,4]
            (game as any).slots = [
                [Symbols.Bar, Symbols.Bar, Symbols.Bar, Symbols.Bar, Symbols.Bar],
                [Symbols.Wild, Symbols.Diamond, Symbols.Diamond, Symbols.Bar, Symbols.Bar],
                [Symbols.Bar, Symbols.Bar, Symbols.Bar, Symbols.Bar, Symbols.Bar]
            ];
            
            player.setDesiredBet(10);
            player.makeNewBet(10);
            (game as any).checkSpin();

            // Wild substitutes for Diamond (500) * Match 3 (0.2) * Bet (10) = 1000
            assert.ok(game.getWinningLines().includes(0));
            assert.strictEqual(game.getLastWin(), 1000);
        });

        it('should calculate win for a 5-symbol match (multiplier 1.0)', () => {
            (game as any).slots = [
                [Symbols.Bar, Symbols.Bar, Symbols.Bar, Symbols.Bar, Symbols.Bar],
                [Symbols.Cherry, Symbols.Cherry, Symbols.Cherry, Symbols.Cherry, Symbols.Cherry],
                [Symbols.Bar, Symbols.Bar, Symbols.Bar, Symbols.Bar, Symbols.Bar]
            ];
            
            player.setDesiredBet(10);
            player.makeNewBet(10);
            (game as any).checkSpin();

            // Cherry (10) * Match 5 (1.0) * Bet (10) = 100
            assert.ok(game.getWinningLines().includes(0));
            assert.strictEqual(game.getLastWin(), 100);
        });

        it('should pay out based on the Wild multiplier if the line starts with 3 Wilds', () => {
            (game as any).slots = [
                [Symbols.Wild, Symbols.Wild, Symbols.Wild, Symbols.Bar, Symbols.Bar],
                [Symbols.Bar, Symbols.Bar, Symbols.Bar, Symbols.Bar, Symbols.Bar],
                [Symbols.Bar, Symbols.Bar, Symbols.Bar, Symbols.Bar, Symbols.Bar]
            ];
            
            player.setDesiredBet(10);
            player.makeNewBet(10);
            (game as any).checkSpin();

            // Wild (100) * Match 3 (0.2) * Bet (10) = 200
            assert.ok(game.getWinningLines().includes(1));
            assert.strictEqual(game.getLastWin(), 200);
        });
    });
});
