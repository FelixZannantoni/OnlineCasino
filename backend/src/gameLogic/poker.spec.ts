import { Poker } from "./poker";
import { PokerPlayer } from "./pokerPlayer";

function testPokerStart() {
    const poker = new Poker("1", "Test Poker");
    const p1 = new PokerPlayer("u1", "u1", "U1", 1000);
    const p2 = new PokerPlayer("u2", "u2", "U2", 1000);
    poker.addPlayer(p1);
    poker.addPlayer(p2);

    console.log("Players added:", poker.getPlayers().length);
    poker.startGameStartTimer();

    setTimeout(() => {
        const state = poker.getGameState();
        console.log("Game state phase:", state.phase);
        if (state.phase !== 'pre-flop') {
            console.error("Game did not start!");
        } else {
            console.log("Game started successfully!");
        }
    }, 12000);
}

testPokerStart();
