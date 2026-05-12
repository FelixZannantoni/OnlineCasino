import { Slotmachine, Symbols } from "../gameLogic/slotmachine";
import { SlotmachinePlayer } from "../gameLogic/slotmachinePlayer";

export class SlotmachineService {
    private static games: Map<string, Slotmachine> = new Map();

    public async createGame(playerId: string, username: string, displayname: string, balance: number): Promise<string> {
        const gameId = `slot-${playerId}`;
        const player = new SlotmachinePlayer(playerId, username, displayname, balance);
        const game = new Slotmachine(gameId, player);
        SlotmachineService.games.set(gameId, game);
        return gameId;
    }

    public async spin(gameId: string, bet: number): Promise<{ slots: Symbols[][], win: number, balance: number } | null> {
        const game = SlotmachineService.games.get(gameId);
        if (!game) return null;

        const player = game.getPlayer();
        if (!player) return null;

        player.setBet(bet);
        player.userPressedSpin();
        
        try {
            game.startGame(); // This handles makeBet and playRound
            return {
                slots: game.getSlots(),
                win: game.getLastWin(),
                balance: player.getBalance()
            };
        } catch (e) {
            console.error("Spin failed:", e);
            return null;
        }
    }

    public async getGame(gameId: string): Promise<Slotmachine | null> {
        return SlotmachineService.games.get(gameId) || null;
    }
}
