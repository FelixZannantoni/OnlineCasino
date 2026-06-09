import { Game } from "./game";
import { RoulettePlayer, rouletteField } from "./roulettePlayer";
import { userService } from "../app";
import { DEFAULT_CHIPS, getChipsForGame } from "../config";

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
    private remainingTime: number = 0;
    private chipOptions: any[] = DEFAULT_CHIPS;

    constructor(gameId: string, gameName: string = "") {
        super(gameId, gameName);
        this.chipOptions = getChipsForGame(this.getGameName());
    }

    public setChipOptions(options: any[]) {
        this.chipOptions = options;
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
            // If no one bet, we still "spin" to keep the game alive
            // but we can skip the wait if we want. For now, let's just spin.
        }

        this.currentPhase = RoulettePhase.SPINNING;
        this.lastWinningNumber = Math.floor(Math.random() * 37);
        this.emit("gameState", this.getGameState());

        // Wait for frontend animation
        await new Promise(resolve => setTimeout(resolve, 5000));

        await this.handOutWin(this.lastWinningNumber);
        this.currentPhase = RoulettePhase.FINISHED;
        this.emit("gameState", this.getGameState());
    }

    private async waitForBets() {
        this.remainingTime = 15;
        this.emit("gameState", this.getGameState());

        await new Promise<void>((resolve) => {
            let interval: NodeJS.Timeout | null = null;
            let timerStarted = false;

            const startTimer = () => {
                if (timerStarted) return;
                timerStarted = true;
                interval = setInterval(() => {
                    this.remainingTime--;
                    this.emit("gameState", this.getGameState());
                    if (this.remainingTime <= 0) {
                        cleanup();
                        resolve();
                    }
                }, 1000);
            };

            const handleReady = () => {
                const allReady = this.players.length > 0 && this.players.every(p => p.getIsReady());
                if (allReady) {
                    cleanup();
                    resolve();
                }
            };

            const handleBet = () => {
                startTimer();
                this.emit("gameState", this.getGameState());
            };

            const cleanup = () => {
                if (interval) clearInterval(interval);
                this.removeListener("playerBet", handleBet);
                this.removeListener("playerReady", handleReady);
            };

            this.on("playerBet", handleBet);
            this.on("playerReady", handleReady);

            // If a player is already betting (e.g. they joined right as we reset)
            if (this.players.some(p => p.getBet() > 0)) {
                startTimer();
            }
        });
    }

    public async handlePlayerMove(playerId: string, action: string, amount?: number, field?: string) {
        const player = this.players.find(p => p.getPlayerId() === playerId);
        if (!player) return { success: false, message: "Player not found" };

        if (action === "bet") {
            if (this.currentPhase !== RoulettePhase.BETTING) {
                return { success: false, message: "Not in betting phase" };
            }
            if (player.getIsReady()) {
                return { success: false, message: "Cannot change bets while ready. Unready first." };
            }
            if (amount === undefined || amount <= 0 || !field) {
                return { success: false, message: "Invalid bet" };
            }
            try {
                player.placeBet(field as rouletteField, amount);
                await userService.updateUserBalance(playerId, player.getBalance());
                this.emit("playerBet", { playerId });
                return { success: true, message: "Bet placed" };
            } catch (e) {
                return { success: false, message: "Not enough balance" };
            }
        }

        if (action === "ready") {
            if (this.currentPhase !== RoulettePhase.BETTING) {
                return { success: false, message: "Cannot be ready now" };
            }
            // If amount is provided, use it as the new ready status, otherwise toggle
            const newReadyStatus = amount !== undefined ? !!amount : !player.getIsReady();
            player.setReady(newReadyStatus);
            this.emit("gameState", this.getGameState());
            this.emit("playerReady", { playerId });
            return { success: true, message: `Player ${newReadyStatus ? "ready" : "unready"}` };
        }

        if (action === "clear") {
            if (this.currentPhase !== RoulettePhase.BETTING) {
                return { success: false, message: "Cannot clear bets now" };
            }
            if (player.getIsReady()) {
                return { success: false, message: "Cannot clear bets while ready. Unready first." };
            }
            player.clearBets();
            await userService.updateUserBalance(playerId, player.getBalance());
            this.emit("playerBet", { playerId });
            return { success: true, message: "Bets cleared" };
        }

        return { success: false, message: "Invalid action" };
    }

    private resetBets() {
        this.players.forEach(p => {
            p.clearBets();
            p.resetReady();
        });
        this.lastWinningNumber = null;
        this.remainingTime = 0;
    }

    private async handOutWin(winningNumber: number) {
        const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
        const isRed = redNumbers.includes(winningNumber);
        const isBlack = winningNumber !== 0 && !isRed;
        const isEven = winningNumber !== 0 && winningNumber % 2 === 0;
        const isOdd = winningNumber !== 0 && winningNumber % 2 !== 0;

        for (const player of this.players) {
            let totalWin = 0;
            player.getPlayerBets().forEach(bet => {
                let multiplier = 0;
                const field = bet.field;

                if (field === winningNumber.toString()) multiplier = 36;
                else if (field === "00" && winningNumber === -1) multiplier = 36; // Support 00 if we ever add it to Math.random
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
                    totalWin += bet.amount * multiplier;
                }
            });

            if (totalWin > 0) {
                player.winMoney(totalWin);
                await userService.updateUserBalance(player.getPlayerId(), player.getBalance());
            }
        }
    }

    public handlePlayerDisconnect(playerId: string) {
        this.emit("playerReady", { playerId });
    }

    public getGameState() {
        return {
            gameId: this.getGameId(),
            isRunning: this.isRunning,
            phase: this.currentPhase,
            lastWinningNumber: this.lastWinningNumber,
            remainingTime: this.remainingTime,
            chipOptions: this.chipOptions,
            players: this.players.map(p => ({
                id: p.getPlayerId(),
                username: p.getUsername(),
                displayname: p.getDisplayname(),
                balance: p.getBalance(),
                bet: p.getBet(),
                bets: p.getPlayerBets(),
                isReady: p.getIsReady()
            }))
        };
    }
}