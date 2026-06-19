import { Database } from "better-sqlite3";
import { Poker } from "../gameLogic/poker";
import { PokerPlayer } from "../gameLogic/pokerPlayer";
import { DB } from "../data";

export class PokerService {
  static pokerGames: Poker[] = [];

  async fold(playerId: string, gameId: string): Promise<{ success: boolean; message: string }> {
    const { game } = this.getGameById(gameId);
    if (!game) return { success: false, message: `Game #${gameId} not found` };
    return game.handlePlayerMove(playerId, "fold");
  }

  async check(playerId: string, gameId: string): Promise<{ success: boolean; message: string }> {
    const { game } = this.getGameById(gameId);
    if (!game) return { success: false, message: `Game #${gameId} not found` };
    return game.handlePlayerMove(playerId, "check");
  }

  async bet(
    playerId: string,
    gameId: string,
    betAmount: number
  ): Promise<{ success: boolean; message: string }> {
    const { game } = this.getGameById(gameId);
    if (!game) return { success: false, message: `Game #${gameId} not found` };
    return game.handlePlayerMove(playerId, "bet", betAmount);
  }

  async call(playerId: string, gameId: string): Promise<{ success: boolean; message: string }> {
    const { game } = this.getGameById(gameId);
    if (!game) return { success: false, message: `Game #${gameId} not found` };
    return game.handlePlayerMove(playerId, "call");
  }

  async raise(
    playerId: string,
    gameId: string,
    raiseAmount: number
  ): Promise<{ success: boolean; message: string }> {
    const { game } = this.getGameById(gameId);
    if (!game) return { success: false, message: `Game #${gameId} not found` };
    return game.handlePlayerMove(playerId, "raise", raiseAmount);
  }

  async tipDealer(playerId: string, gameId: string): Promise<{ success: boolean; message: string }> {
    const { game } = this.getGameById(gameId);
    if (!game) return { success: false, message: `Game #${gameId} not found` };
    return game.tipDealer(playerId);
  }

  async addPlayer(
    playerId: string,
    username: string,
    displayname: string,
    balance: number,
    _hasDealerChip: boolean,
    _bet: number,
    gameId: string
  ): Promise<{ success: boolean; message: string }> {
    const gameResult = this.getGameById(gameId);
    if (!gameResult.game) {
      return { success: false, message: gameResult.message };
    }

    const newPlayer: PokerPlayer = new PokerPlayer(playerId, username, displayname, balance);
    try {
      gameResult.game.addPlayer(newPlayer);
    } catch (e: any) {
      return { success: false, message: e.message };
    }

    if (gameResult.game.getPlayers().length === 1) {
      gameResult.game.setDefaultDealerChip();
    }

    return {
      success: true,
      message: `Successfully added player ${playerId} to game ${gameId}`,
    };
  }

  async loadAllPokerGames(): Promise<void> {
    try {
      const connection: Database = await DB.createDBConnection();
      const type = "POKER";

      type GameRow = {
        gameId: string;
        name: string;
        type: string;
      };

      const result = connection
        .prepare<[string], GameRow>("SELECT * FROM games WHERE type = ?")
        .all(type);

      if (!result) {
        throw new Error("FAIL");
      }

      result.forEach((pokergameData) => {
        const poker = new Poker(pokergameData.gameId, pokergameData.name);
        PokerService.pokerGames.push(poker);
      });
    } catch (err) {
      console.error(`Something happened while trying to get all games from the db: ${err}`);
    }
  }

  getGameById(gameId: string): { game: Poker | null; message: string } {
    const game: Poker | undefined = PokerService.pokerGames.find(
      (g) => g.getGameId().toString() === gameId
    );

    if (!game) {
      return { game: null, message: `Game with the id ${gameId} was not found` };
    }

    return { game, message: "Game found" };
  }
}
