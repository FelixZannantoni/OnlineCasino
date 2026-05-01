import { Component, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

interface ChatMessage {
  type: 'user' | 'bot';
  text: string;
  timestamp: Date;
  time: string;
}

interface KnowledgeEntry {
  keywords: string[];
  title: string;
  content: string;
}

@Component({
  selector: 'app-ai-chat',
  standalone: true,
  imports: [MatIconModule, FormsModule],
  templateUrl: './ai-chat.html',
  styleUrls: ['./ai-chat.css']
})
export class AiChat implements AfterViewChecked {
  @ViewChild('chatMessages') private chatMessagesRef!: ElementRef;

  chatMessages: ChatMessage[] = [];
  userInput = '';
  isTyping = false;

  private knowledgeBase: KnowledgeEntry[] = [
    {
      keywords: ['texas hold', 'texas holdem', 'how to play poker'],
      title: 'Texas Hold\'em',
      content: `Texas Hold'em is the most popular variant of poker. Each player receives two private cards (hole cards), and five community cards are dealt face-up in three stages: the Flop (3 cards), Turn (1 card), and River (1 card). Players combine their hole cards with the community cards to make the best five-card hand. Betting occurs before the flop and after each subsequent deal. Players can check, call, raise, or fold during each betting round.`
    },
    {
      keywords: ['poker hand', 'hand ranking', 'royal flush', 'straight flush'],
      title: 'Poker Hand Rankings',
      content: `Poker hands ranked from highest to lowest: 1) Royal Flush (A-K-Q-J-10 same suit), 2) Straight Flush (five sequential cards same suit), 3) Four of a Kind, 4) Full House (three of a kind plus pair), 5) Flush (five cards same suit), 6) Straight (five sequential cards), 7) Three of a Kind, 8) Two Pair, 9) One Pair, 10) High Card. When multiple players have the same hand type, the highest cards determine the winner.`
    },
    {
      keywords: ['pot odds', 'odds', 'probability', 'chance'],
      title: 'Pot Odds & Probability',
      content: `Pot odds represent the ratio of the current pot size to the cost of a call. For example, if the pot is $100 and your opponent bets $50, you must call $50 to win $150, giving you 3:1 pot odds (25% equity needed). The "Rule of 4 and 2" helps calculate hand equity: multiply your outs by 4 on the flop or by 2 on the turn. Common probabilities: hitting a flush draw is approximately 35% (4.2:1), hitting an open-ended straight draw is about 31% (5.2:1).`
    },
    {
      keywords: ['bluff', 'bluffing', 'semi-bluff'],
      title: 'Bluffing Strategy',
      content: `Bluffing is betting or raising with a hand that is unlikely to be the best, with the goal of making opponents fold better hands. Key principles: bluff selectively rather than constantly, consider your table image and position, semi-bluff with drawing hands (hands that can improve), and only bluff against players capable of folding. Pure bluffs have no chance of winning if called, while semi-bluffs can still win by hitting a draw. Good bluffing requires reading opponents and understanding bet sizing.`
    },
    {
      keywords: ['blackjack', '21', 'blackjack rules'],
      title: 'Blackjack',
      content: `Blackjack (also called 21) is a casino card game where players compete against the dealer. Goal: get a hand value closer to 21 than the dealer without exceeding 21. Card values: number cards equal their face value, face cards equal 10, Aces equal 11 or 1. Players can Hit (take another card), Stand (keep current hand), Double Down (double bet, receive one card), Split (separate pairs into two hands), or Surrender. The dealer must hit on 16 or less and stand on 17 or higher. Blackjack (Ace + 10-value card) pays 3:2.`
    },
    {
      keywords: ['roulette', 'roulette rules'],
      title: 'Roulette',
      content: `Roulette is a casino game with a spinning wheel containing numbered pockets. European roulette has 37 pockets (0-36), American roulette has 38 (0, 00, 1-36). Players bet on where a ball will land. Inside bets: Straight up (single number, 35:1 payout), Split (two numbers, 17:1), Street (three numbers, 11:1), Corner (four numbers, 8:1). Outside bets: Red/Black, Odd/Even, High/Low (all 1:1), Dozens/Columns (2:1). House edge: European 2.7%, American 5.26%.`
    },
    {
      keywords: ['omaha', 'omaha poker', 'plo'],
      title: 'Omaha Hold\'em',
      content: `Omaha is similar to Texas Hold'em but each player receives four hole cards instead of two. The key difference: players must use exactly two of their hole cards combined with exactly three community cards to form their hand. This creates more possible hand combinations and bigger winning hands. Pot-Limit Omaha (PLO) is the most popular format, where the maximum bet equals the current pot size. Omaha typically has more action and larger pots than Hold'em.`
    },
    {
      keywords: ['position', 'button', 'late position', 'early position'],
      title: 'Position in Poker',
      content: `Position refers to where you sit relative to the dealer button and is crucial in poker. Acting last (late position) provides a significant advantage because you have more information about opponents' actions before deciding. Positions: Early Position (UTG, MP) - act first, play tight; Middle Position - moderate range; Late Position (Cutoff, Button) - act last, play wider range. The button is the best position. Blind positions must post forced bets. General rule: play tighter from early position, wider from late position.`
    },
    {
      keywords: ['bankroll', 'bankroll management', 'money management'],
      title: 'Bankroll Management',
      content: `Bankroll management is essential for long-term poker success. Guidelines: Cash games require 20-30 buy-ins minimum for your stake level; Tournaments require 50-100 buy-ins due to higher variance; Never play with money you cannot afford to lose; Set stop-loss limits for each session; Move down in stakes if you lose 20-30% of your bankroll; Move up only when you have sufficient buy-ins for the next level. Proper bankroll management protects against variance and keeps you in the game.`
    },
    {
      keywords: ['tournament', 'sng', 'sit and go', 'mtt'],
      title: 'Poker Tournaments',
      content: `Poker tournaments come in several formats: Multi-Table Tournaments (MTT) - large fields, prizes increase as players are eliminated, blinds increase at set intervals; Sit & Go (SNG) - starts when full (typically 6-10 players), fixed prize pool; Freerolls - no buy-in required, real prizes; Heads-Up - one-on-one format. Tournament strategy differs from cash games: play tight early with deep stacks, exploit medium stacks, understand ICM (Independent Chip Model) near the bubble, and adjust aggression based on stack sizes and position.`
    },
    {
      keywords: ['tilt', 'emotional', 'bad beat'],
      title: 'Tilt Management',
      content: `Tilt refers to emotional play after bad beats or losses, leading to poor decisions. Warning signs: playing too many hands, making oversized bets, chasing losses, feeling frustrated or angry. How to avoid tilt: take breaks after bad beats, set loss limits before playing, remember variance is normal in poker, don't chase losses, practice mindfulness and breathing exercises, maintain a long-term perspective. If you feel tilted: stop playing immediately, take a walk, and return only when calm. Tilt is one of the biggest bankroll killers in poker.`
    },
    {
      keywords: ['cash game', 'ring game'],
      title: 'Cash Games',
      content: `Cash games (also called ring games) differ from tournaments: real money is on the table (not tournament chips), players can leave anytime and cash out immediately, blinds remain constant, typical stack depth is 100+ big blinds, strategy is more straightforward with deeper stacks. You can rebuy instantly if you lose your stack. Cash games allow for more precise bankroll management and don't have the increasing blind pressure of tournaments. Common formats: No-Limit Hold'em, Pot-Limit Omaha, and mixed games.`
    },
    {
      keywords: ['poker', 'what is poker'],
      title: 'Poker Overview',
      content: `Poker is a family of card games combining gambling, strategy, and skill. All variants involve betting and individual hand rankings. Key elements: players bet on the value of their hand, bluffing is allowed (betting strongly on weak hands), the player with the best hand or the last remaining player wins the pot. Most popular variants: Texas Hold'em, Omaha, Seven-Card Stud, Five-Card Draw. Poker requires mathematical skills (pot odds, probability), psychological skills (reading opponents, bluffing), and disciplined bankroll management.`
    },
    {
      keywords: ['casino', 'gambling', 'house edge'],
      title: 'Casino Games',
      content: `Casino games are designed with a built-in mathematical advantage for the house (casino). House edge examples: Blackjack with basic strategy ~0.5%, European Roulette 2.7%, American Roulette 5.26%, Slots 2-15%, Craps (Pass Line) 1.41%. Key concepts: Return to Player (RTP) is the inverse of house edge, variance affects short-term results, no betting system can overcome the house edge long-term. Always gamble responsibly and within your means. The house always wins in the long run.`
    }
  ];

  constructor() {
    this.addMessage({
      type: 'bot',
      text: `<strong>AI Support Assistant</strong><br><br>I can help you with poker rules, casino games, strategy, and odds.<br><br>Try asking:<br>• "Texas Hold'em rules"<br>• "What are pot odds?"<br>• "How does bluffing work?"<br>• "Blackjack basics"`,
      timestamp: new Date(),
      time: this.getCurrentTime()
    });
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private scrollToBottom() {
    if (this.chatMessagesRef) {
      this.chatMessagesRef.nativeElement.scrollTop = this.chatMessagesRef.nativeElement.scrollHeight;
    }
  }

  getChatMessages() {
    return this.chatMessages;
  }

  private addMessage(message: ChatMessage) {
    this.chatMessages = [...this.chatMessages, message];
  }

  async sendMessage() {
    if (!this.userInput.trim() || this.isTyping) return;

    const userQuestion = this.userInput.trim();

    this.addMessage({
      type: 'user',
      text: userQuestion,
      timestamp: new Date(),
      time: this.getCurrentTime()
    });

    this.userInput = '';
    this.isTyping = true;

    await this.delay(300);

    const response = this.findResponse(userQuestion.toLowerCase());
    this.addBotMessage(response);
    this.isTyping = false;
  }

  private findResponse(question: string): string {
    let bestMatch: KnowledgeEntry | null = null;
    let bestScore = 0;

    for (const entry of this.knowledgeBase) {
      let score = 0;
      for (const keyword of entry.keywords) {
        if (question.includes(keyword.toLowerCase())) {
          score += keyword.length;
        }
      }
      if (score > bestScore) {
        bestScore = score;
        bestMatch = entry;
      }
    }

    if (bestMatch && bestScore > 3) {
      return `<strong>${bestMatch.title}</strong><br><br>${bestMatch.content}`;
    }

    return `I don't have specific information about that topic yet. Try asking about poker hands, Texas Hold'em, pot odds, bluffing, blackjack, roulette, or other casino games.`;
  }

  private addBotMessage(text: string) {
    this.addMessage({
      type: 'bot',
      text: text,
      timestamp: new Date(),
      time: this.getCurrentTime()
    });
  }

  private getCurrentTime(): string {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
