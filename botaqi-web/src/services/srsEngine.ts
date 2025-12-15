// Spaced Repetition System (SM-2 Algorithm) for Gulfara
// Implements the SuperMemo SM-2 algorithm for optimal learning intervals

interface SRSData {
  cardId: string;
  userId: string;
  ease: number; // Ease factor (default: 2.5)
  interval: number; // Days until next review
  repetitions: number; // Number of successful repetitions
  lastReview: Date;
  nextReview: Date;
  quality: number; // Last answer quality (0-5)
}

interface ReviewResult {
  cardId: string;
  quality: number;
  timeSpent: number;
  correct: boolean;
}

class SRSEngine {
  private readonly MIN_EASE = 1.3;
  private readonly MAX_EASE = 5.0;

  /**
   * Calculate next review date using SM-2 algorithm
   */
  calculateNextReview(srsData: SRSData, quality: number): SRSData {
    const { ease, interval, repetitions } = srsData;
    let newEase = ease;
    let newInterval = interval;
    let newRepetitions = repetitions;

    // Update ease factor based on quality
    if (quality >= 3) {
      // Correct answer
      newEase = Math.max(this.MIN_EASE, ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
      
      if (repetitions === 0) {
        newInterval = 1;
      } else if (repetitions === 1) {
        newInterval = 6;
      } else {
        newInterval = Math.round(interval * newEase);
      }
      
      newRepetitions = repetitions + 1;
    } else {
      // Incorrect answer - reset
      newEase = Math.max(this.MIN_EASE, ease - 0.2);
      newInterval = 1;
      newRepetitions = 0;
    }

    // Calculate next review date
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + newInterval);

    return {
      ...srsData,
      ease: newEase,
      interval: newInterval,
      repetitions: newRepetitions,
      lastReview: new Date(),
      nextReview,
      quality
    };
  }

  /**
   * Get cards due for review
   */
  getDueCards(allCards: SRSData[]): SRSData[] {
    const now = new Date();
    return allCards.filter(card => {
      const nextReview = new Date(card.nextReview);
      return nextReview <= now;
    });
  }

  /**
   * Get new cards for learning
   */
  getNewCards(allCards: SRSData[], limit: number = 5): SRSData[] {
    return allCards
      .filter(card => card.repetitions === 0)
      .slice(0, limit);
  }

  /**
   * Calculate card difficulty based on SRS data
   */
  calculateDifficulty(srsData: SRSData): number {
    const { ease, repetitions, interval } = srsData;
    
    // Base difficulty from ease factor
    let difficulty = 5 - (ease - this.MIN_EASE) / (this.MAX_EASE - this.MIN_EASE) * 4;
    
    // Adjust based on repetitions
    if (repetitions === 0) {
      difficulty = 2; // New cards start easy
    } else if (repetitions < 3) {
      difficulty = Math.max(1, difficulty - 0.5); // Learning cards slightly easier
    }
    
    // Adjust based on interval
    if (interval > 30) {
      difficulty = Math.min(5, difficulty + 0.5); // Long intervals = harder
    }
    
    return Math.max(1, Math.min(5, Math.round(difficulty * 10) / 10));
  }

  /**
   * Calculate mastery level (0-100)
   */
  calculateMastery(srsData: SRSData): number {
    const { ease, repetitions, interval } = srsData;
    
    // Mastery based on ease factor and repetitions
    let mastery = 0;
    
    if (repetitions >= 5 && ease >= 2.5) {
      mastery = 90 + (ease - 2.5) * 4; // 90-100% for well-mastered cards
    } else if (repetitions >= 3) {
      mastery = 60 + (ease - 1.3) * 20; // 60-90% for learning cards
    } else if (repetitions >= 1) {
      mastery = 30 + repetitions * 15; // 30-60% for new cards
    } else {
      mastery = 0; // Completely new
    }
    
    // Bonus for long intervals (well-retained)
    if (interval > 7) {
      mastery = Math.min(100, mastery + 10);
    }
    
    return Math.max(0, Math.min(100, Math.round(mastery)));
  }

  /**
   * Get study session recommendations
   */
  getSessionRecommendations(srsData: SRSData[]): {
    newCards: number;
    reviewCards: number;
    estimatedTime: number;
  } {
    const dueCards = this.getDueCards(srsData);
    const newCards = this.getNewCards(srsData, 5);
    
    // Estimate time based on card difficulty
    const avgDifficulty = srsData.length > 0 
      ? srsData.reduce((sum, card) => sum + this.calculateDifficulty(card), 0) / srsData.length
      : 3;
    
    const timePerCard = 15 + (avgDifficulty - 1) * 5; // 15-35 seconds per card
    const estimatedTime = (dueCards.length + newCards.length) * timePerCard;
    
    return {
      newCards: newCards.length,
      reviewCards: dueCards.length,
      estimatedTime: Math.round(estimatedTime / 60) // minutes
    };
  }

  /**
   * Process review result and update SRS data
   */
  processReview(srsData: SRSData, result: ReviewResult): SRSData {
    const quality = this.mapResultToQuality(result);
    return this.calculateNextReview(srsData, quality);
  }

  /**
   * Map review result to SM-2 quality scale (0-5)
   */
  private mapResultToQuality(result: ReviewResult): number {
    const { correct, timeSpent } = result;
    
    if (!correct) return 0; // Complete failure
    
    // Map time spent to quality (faster = better)
    const timeScore = Math.max(0, 5 - (timeSpent / 10000)); // 10 seconds = 4, 20 seconds = 3, etc.
    
    return Math.round(Math.max(1, Math.min(5, timeScore)));
  }

  /**
   * Get learning statistics
   */
  getLearningStats(srsData: SRSData[]): {
    totalCards: number;
    masteredCards: number;
    learningCards: number;
    newCards: number;
    averageEase: number;
    averageInterval: number;
    retentionRate: number;
  } {
    const totalCards = srsData.length;
    const masteredCards = srsData.filter(card => 
      card.repetitions >= 5 && card.ease >= 2.5
    ).length;
    const learningCards = srsData.filter(card => 
      card.repetitions > 0 && card.repetitions < 5
    ).length;
    const newCards = srsData.filter(card => card.repetitions === 0).length;
    
    const averageEase = srsData.length > 0 
      ? srsData.reduce((sum, card) => sum + card.ease, 0) / srsData.length
      : 0;
    
    const averageInterval = srsData.length > 0
      ? srsData.reduce((sum, card) => sum + card.interval, 0) / srsData.length
      : 0;
    
    // Calculate retention rate from recent reviews
    const recentReviews = srsData.filter(card => {
      const daysSinceReview = (Date.now() - new Date(card.lastReview).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceReview <= 7; // Last week
    });
    
    const retentionRate = recentReviews.length > 0
      ? recentReviews.filter(card => card.quality >= 3).length / recentReviews.length
      : 0;
    
    return {
      totalCards,
      masteredCards,
      learningCards,
      newCards,
      averageEase: Math.round(averageEase * 100) / 100,
      averageInterval: Math.round(averageInterval * 10) / 10,
      retentionRate: Math.round(retentionRate * 100)
    };
  }
}

export const srsEngine = new SRSEngine();
export type { SRSData, ReviewResult };
