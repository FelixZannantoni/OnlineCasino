import { Database } from "better-sqlite3";
import { Poker } from "../gameLogic/poker";
import { PokerPlayer } from "../gameLogic/pokerPlayer";
import { DB } from "../data";

export class PokerService {
    static pokerGames: Poker[] =  [];


    fold(playerId: string, gameId: string): {success: boolean, message: string} {
        // get the game and player objects
        const gameResult = this.getGameById(gameId);
        
        if(!gameResult.game) return {
            success: false,
            message: gameResult.message
        };

        const player: PokerPlayer | undefined = gameResult.game.getPlayers().find(p => p.getPlayerId() === playerId);

        if(!player) {
            const msg = `Player with the id ${playerId} was not found in game ${gameId}`;
            console.error(msg);
            return {
                success: false,
                message: msg
            };
        }

        player.setPressedFold(true);
        gameResult.game.emit("playerMove", { playerId: playerId });
        return {
            success: true,
            message: 'Fold action received'
        };
    }

    check(playerId: string, gameId: string): {success: boolean, message: string} {
        // get the game and player objects
        const gameResult = this.getGameById(gameId);
        
        if(!gameResult.game) return {
            success: false,
            message: gameResult.message
        };

        const player: PokerPlayer | undefined = gameResult.game.getPlayers().find(p => p.getPlayerId() === playerId);

        if(!player) {
            const msg = `Player with the id ${playerId} was not found in game ${gameId}`;
            console.error(msg);
            return {
                success: false,
                message: msg
            };
        }

        player.setPressedCheck(true);
        gameResult.game.emit("playerMove", { playerId: playerId });
        return {
            success: true,
            message: 'Check action received'
        };
    }

    bet(playerId: string, gameId: string, betAmount: number): {success: boolean, message: string} {
        // get the game and player objects
        const gameResult = this.getGameById(gameId);
        
        if(!gameResult.game) return {
            success: false,
            message: gameResult.message
        };

        const player: PokerPlayer | undefined = gameResult.game.getPlayers().find(p => p.getPlayerId() === playerId);

        if(!player) {
            const msg = `Player with the id ${playerId} was not found in game ${gameId}`;
            console.error(msg);
            return {
                success: false,
                message: msg
            };
        }

        const success: boolean = player.setDesiredBet(betAmount);
        if (success) {
            player.setPressedBet(true);
            gameResult.game.emit("playerMove", { playerId: playerId });
            return {
                success: true,
                message: 'Bet action received'
            };
        }

        return {
            success: false,
            message: `Failed to set desired bet, ${betAmount} €, for player ${playerId} in game ${gameId}`
        };
    }

    call(playerId: string, gameId: string): {success: boolean, message: string} {
        // get the game and player objects
        const gameResult = this.getGameById(gameId);

        if(!gameResult.game) return {
            success: false,
            message: gameResult.message
        };

        const player: PokerPlayer | undefined = gameResult.game.getPlayers().find(p => p.getPlayerId() === playerId);

        if(!player) {
            const msg = `Player with the id ${playerId} was not found in game ${gameId}`;
            console.error(msg);
            return {
                success: false,
                message: msg
            };
        }

        player.setPressedCall(true);
        gameResult.game.emit("playerMove", { playerId: playerId });
        return {
            success: true,
            message: 'Call action received'
        };
    }

    raise(playerId: string, gameId: string, raiseAmount: number): {success: boolean, message: string} {
        // get the game and player
        const gameResult = this.getGameById(gameId);

        if(!gameResult.game) {
            return {
                success: false,
                message: gameResult.message
            };
        }

        const player: PokerPlayer | undefined = gameResult.game.getPlayers().find(p => p.getPlayerId() === playerId);

        if(!player) {
            const msg = `Player with the id ${playerId} was not found in game ${gameId}`;
            console.error(msg);
            return {
                success: false,
                message: msg
            };
        }

        player.setPressedRaise(true);
        const success: boolean = player.setDesiredBet(raiseAmount);

        if(success) {
            gameResult.game.emit("playerMove", { playerId: playerId });
            return {
                success: false,
                message: "Not Yet Implemented!"
            };
        }

        return {
            success: false,
            message: `Failed to raise desired bet to ${raiseAmount} € for player ${playerId} in game ${gameId}`
        };
    }

    /**
     * Add a player to a game of poker.
     * @param playerId 
     * @param username 
     * @param displayname 
     * @param balance 
     * @param hasDealerChip 
     * @param bet 
     * @param gameId 
     */
    addPlayer(playerId: string, username: string, displayname: string, balance: number, hasDealerChip: boolean, bet: number, gameId: string): 
        {success: boolean, message: string} {
        // get the game object
        const gameResult = this.getGameById(gameId);
        if(!gameResult.game) { 
            console.log(gameResult.message);
            return {
                success: false,
                message: gameResult.message
            };
        }

        const newPlayer: PokerPlayer = new PokerPlayer(playerId, username, displayname, balance);
        gameResult.game.addPlayer(newPlayer);
        return {
            success: true,
            message: `Successfully added player ${playerId} to game ${gameId}`
        }
    }

    async loadAllPokerGames(): Promise<void> {
        console.log("Loading games...");
        
        try {
            const connection: Database = await DB.createDBConnection();
            const type = "POKER";

            type GameRow = {
                gameId: string;
                type: string;
            };

            const result = connection.prepare<[string], GameRow>("SELECT * FROM games WHERE type = ?")
                .all(type);
        
            // await connection.close();

            if(!result) {
                throw new Error("FAIL");
            }

            result.forEach(pokergameData => {
                const poker = new Poker(pokergameData.gameId);
                PokerService.pokerGames.push(poker);
            });

            return;
        } catch(err) {
            console.error(`Something happened while trying to get all games from the db: ${err}`);
            return;
        }
    }

    getGameById(gameId: string): {game: Poker | null, message: string} {
        const game: Poker | undefined = PokerService.pokerGames.find(g => g.getGameId().toString() === gameId);
        console.log(`${typeof gameId} vs ${typeof PokerService.pokerGames[0].getGameId()}`);
        if(!game) {
            return {
                game: null,
                message: `Game with the id ${gameId} was not found`
            };
        } else {
            return {
                game,
                message: "Game found"
            };
        }
    }
}