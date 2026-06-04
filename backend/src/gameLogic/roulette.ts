import { Game } from "./game";
import { RoulettePlayer, rouletteField } from "./roulettePlayer";

export enum RoulettePhase {
    WAITING = "WAITING",
    BETTING = "BETTING",
    SPINNING = "SPINNING",
    FINISHED = "FINISHED"
}

export class Roulette extends Game<RoulettePlayer> {
    private isRunning: boolean = false;
    private currentPhase: RoulettePhase = RoulettePhase.WAITING;
    private lastWinningNumber: number | null = null;

    constructor(gameId: string) {
        super(gameId);
    }

    public async startGame() {
        if (this.isRunning) return;
        this.isRunning = true;

        while (this.isRunning) {
            if (this.players.length === 0) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                if (this.players.length === 0) break;
            }

            await this.playRound();
            this.currentPhase = RoulettePhase.FINISHED;
            this.emit("gameState", this.getGameState());
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
        this.isRunning = false;
        this.currentPhase = RoulettePhase.WAITING;
        this.emit("gameState", this.getGameState());
    }

    private async playRound() {
        this.resetBets();
        this.currentPhase = RoulettePhase.BETTING;
        await this.waitForBets();

        const activePlayers = this.players.filter(p => p.getBet() > 0);
        if (activePlayers.length === 0) {
            return;
        }

        this.currentPhase = RoulettePhase.SPINNING;
        this.lastWinningNumber = Math.floor(Math.random() * 37);
        this.emit("gameState", this.getGameState());

        // Wait for frontend animation
        await new Promise(resolve => setTimeout(resolve, 5000));

        this.handOutWin(this.lastWinningNumber);
        this.currentPhase = RoulettePhase.FINISHED;
        this.emit("gameState", this.getGameState());
    }

    private async waitForBets() {
        this.emit("gameState", this.getGameState());

        await new Promise<void>((resolve) => {
            const betTimeout = setTimeout(() => {
                cleanup();
                resolve();
            }, 20000); // 20 seconds for betting

            const handleBet = () => {
                this.emit("gameState", this.getGameState());
            };

            const handleSpin = () => {
                const anyPressedSpin = this.players.some(p => p.getPressedSpin());
                if (anyPressedSpin) {
                    cleanup();
                    resolve();
                }
            };

            const cleanup = () => {
                clearTimeout(betTimeout);
                this.removeListener("playerBet", handleBet);
                this.removeListener("playerSpin", handleSpin);
            };

            this.on("playerBet", handleBet);
            this.on("playerSpin", handleSpin);
        });
    }

    public handlePlayerMove(playerId: string, action: string, amount?: number, field?: string) {
        const player = this.players.find(p => p.getPlayerId() === playerId);
        if (!player) return { success: false, message: "Player not found" };

        if (action === "bet") {
            if (this.currentPhase !== RoulettePhase.BETTING) {
                return { success: false, message: "Not in betting phase" };
            }
            if (amount === undefined || amount <= 0 || !field) {
                return { success: false, message: "Invalid bet" };
            }
            try {
                player.placeBet(field as rouletteField, amount);
                this.emit("playerBet", { playerId });
                return { success: true, message: "Bet placed" };
            } catch (e) {
                return { success: false, message: "Not enough balance" };
            }
        }

        if (action === "spin") {
            if (this.currentPhase !== RoulettePhase.BETTING) {
                return { success: false, message: "Cannot spin now" };
            }
            player.userPressedSpin();
            this.emit("playerSpin", { playerId });
            return { success: true, message: "Spin request received" };
        }

        if (action === "clear") {
            if (this.currentPhase !== RoulettePhase.BETTING) {
                return { success: false, message: "Cannot clear bets now" };
            }
            player.clearBets();
            this.emit("playerBet", { playerId });
            return { success: true, message: "Bets cleared" };
        }

        return { success: false, message: "Invalid action" };
    }

    private resetBets() {
        this.players.forEach(p => {
            p.clearBets();
            p.resetSpin();
        });
        this.lastWinningNumber = null;
    }

    private handOutWin(winningNumber: number) {
        const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
        const isRed = redNumbers.includes(winningNumber);
        const isBlack = winningNumber !== 0 && !isRed;
        const isEven = winningNumber !== 0 && winningNumber % 2 === 0;
        const isOdd = winningNumber !== 0 && winningNumber % 2 !== 0;

        this.players.forEach(player => {
            player.getPlayerBets().forEach(bet => {
                let multiplier = 0;
                const field = bet.field;

                if (field === winningNumber.toString()) multiplier = 36;
                else if (field === "RED" && isRed) multiplier = 2;
                else if (field === "BLACK" && isBlack) multiplier = 2;
                else if (field === "EVEN" && isEven) multiplier = 2;
                else if (field === "ODD" && isOdd) multiplier = 2;
                else if (field === "1-18" && winningNumber >= 1 && winningNumber <= 18) multiplier = 2;
                else if (field === "19-36" && winningNumber >= 19 && winningNumber <= 36) multiplier = 2;
                else if (field === "1st Dozen" && winningNumber >= 1 && winningNumber <= 12) multiplier = 3;
                else if (field === "2nd Dozen" && winningNumber >= 13 && winningNumber <= 24) multiplier = 3;
                else if (field === "3rd Dozen" && winningNumber >= 25 && winningNumber <= 36) multiplier = 3;
                else if (field === "1st Col" && winningNumber % 3 === 1) multiplier = 3;
                else if (field === "2nd Col" && winningNumber % 3 === 2) multiplier = 3;
                else if (field === "3rd Col" && winningNumber !== 0 && winningNumber % 3 === 0) multiplier = 3;

                if (multiplier > 0) {
                    player.winMoney(bet.amount * multiplier);
                }
            });
        });
    }

    public getGameState() {
        return {
            gameId: this.getGameId(),
            isRunning: this.isRunning,
            phase: this.currentPhase,
            lastWinningNumber: this.lastWinningNumber,
            players: this.players.map(p => ({
                id: p.getPlayerId(),
                username: p.getUsername(),
                displayname: p.getDisplayname(),
                balance: p.getBalance(),
                bet: p.getBet(),
                bets: p.getPlayerBets()
            }))
        };
    }
}