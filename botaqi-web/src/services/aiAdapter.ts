// AI Difficulty Adaptation Service for Gulfara
// Uses OpenAI GPT-5 nano/mini for cost-optimized difficulty adjustment
import { costOptimizer } from './costOptimizer';

interface UserPerformance {
  userId: string;
  lastResult: boolean;
  avgScore: number;
  targetDifficulty: number;
  recentAnswers: Array<{
    correct: boolean;
    timeSpent: number;
    difficulty: number;
  }>;
}

interface DifficultyAdjustment {
  nextDifficulty: number;
  confidence: number;
  reasoning: string;
}

class AIAdapter {
  private apiKey: string;
  private baseUrl: string = 'https://api.openai.com/v1/chat/completions';

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  }

  /**
   * Adjust difficulty based on user performance using GPT-5 nano (cost-optimized)
   */
  async adjustDifficulty(performance: UserPerformance): Promise<DifficultyAdjustment> {
    try {
      // Check cost limits before making request
      const estimatedTokens = 100; // Estimated tokens for difficulty adjustment
      if (!costOptimizer.canMakeRequest(performance.userId, estimatedTokens)) {
        console.log('Cost limit reached, using fallback adjustment');
        return this.fallbackAdjustment(performance);
      }

      const prompt = costOptimizer.getDifficultyPrompt(performance);
      const model = costOptimizer.getOptimalModel(performance.userId, 'difficulty');
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: 'Gulf Arabic tutor. Analyze performance, suggest difficulty 1-5. JSON: {"nextDifficulty":n,"confidence":n,"reasoning":"text"}'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 80, // Reduced for cost optimization
          temperature: 0.3
        })
      });

      if (!response.ok) {
        throw new Error('OpenAI API request failed');
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      const tokensUsed = data.usage?.total_tokens || estimatedTokens;
      
      // Record usage for cost tracking
      costOptimizer.recordUsage(performance.userId, tokensUsed, 'difficultyAdjustment');
      
      try {
        const result = JSON.parse(content);
        return {
          nextDifficulty: Math.max(1, Math.min(5, result.nextDifficulty)),
          confidence: Math.max(0, Math.min(1, result.confidence)),
          reasoning: result.reasoning || 'AI analysis completed'
        };
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        return this.fallbackAdjustment(performance);
      }
    } catch (error) {
      console.error('AI adaptation error:', error);
      return this.fallbackAdjustment(performance);
    }
  }

  /**
   * Create optimized prompt for difficulty adjustment
   */

  /**
   * Fallback rule-based difficulty adjustment
   */
  private fallbackAdjustment(performance: UserPerformance): DifficultyAdjustment {
    const { lastResult, targetDifficulty, recentAnswers } = performance;
    
    let adjustment = 0;
    let reasoning = '';

    // Analyze recent performance
    const recentCorrect = recentAnswers.filter(a => a.correct).length;
    const recentTotal = recentAnswers.length;
    const recentAccuracy = recentTotal > 0 ? recentCorrect / recentTotal : 0.5;

    // Difficulty adjustment logic
    if (lastResult && recentAccuracy > 0.8) {
      // User is doing well, increase difficulty
      adjustment = 0.2;
      reasoning = 'Strong performance detected, increasing difficulty';
    } else if (!lastResult && recentAccuracy < 0.4) {
      // User is struggling, decrease difficulty
      adjustment = -0.3;
      reasoning = 'Struggling detected, decreasing difficulty';
    } else if (recentAccuracy >= 0.4 && recentAccuracy <= 0.8) {
      // Good balance, slight adjustment based on trend
      const trend = this.calculateTrend(recentAnswers);
      adjustment = trend * 0.1;
      reasoning = `Balanced performance, ${trend > 0 ? 'slight increase' : 'slight decrease'} based on trend`;
    }

    const nextDifficulty = Math.max(1, Math.min(5, targetDifficulty + adjustment));
    const confidence = this.calculateConfidence(recentAnswers);

    return {
      nextDifficulty,
      confidence,
      reasoning
    };
  }

  /**
   * Calculate performance trend from recent answers
   */
  private calculateTrend(answers: Array<{ correct: boolean; timeSpent: number }>): number {
    if (answers.length < 3) return 0;

    const recent = answers.slice(-3);
    const older = answers.slice(-6, -3);

    if (older.length === 0) return 0;

    const recentAccuracy = recent.filter(a => a.correct).length / recent.length;
    const olderAccuracy = older.filter(a => a.correct).length / older.length;

    return recentAccuracy - olderAccuracy;
  }

  /**
   * Calculate confidence in the adjustment
   */
  private calculateConfidence(answers: Array<{ correct: boolean }>): number {
    if (answers.length < 5) return 0.5;

    const correct = answers.filter(a => a.correct).length;
    const total = answers.length;
    const accuracy = correct / total;

    // Higher confidence with more data and clearer patterns
    const dataConfidence = Math.min(1, answers.length / 10);
    const patternConfidence = Math.abs(accuracy - 0.5) * 2; // Higher confidence when accuracy is clearly above/below 50%

    return (dataConfidence + patternConfidence) / 2;
  }

  /**
   * Generate personalized learning recommendations using GPT-5 mini (higher quality)
   */
  async generateRecommendations(userId: string, performance: UserPerformance): Promise<string[]> {
    try {
      // Check cost limits before making request
      const estimatedTokens = 150; // Estimated tokens for recommendations
      if (!costOptimizer.canMakeRequest(userId, estimatedTokens)) {
        console.log('Cost limit reached, using default recommendations');
        return this.getDefaultRecommendations(performance);
      }

      const prompt = costOptimizer.getRecommendationPrompt(performance);
      const model = costOptimizer.getOptimalModel(userId, 'recommendations');
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: 'Arabic tutor. Give 3 Gulf Arabic learning tips. JSON array: ["tip1","tip2","tip3"]'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 120, // Reduced for cost optimization
          temperature: 0.4
        })
      });

      if (!response.ok) {
        throw new Error('OpenAI API request failed');
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      const tokensUsed = data.usage?.total_tokens || estimatedTokens;
      
      // Record usage for cost tracking
      costOptimizer.recordUsage(userId, tokensUsed, 'recommendations');
      
      try {
        const recommendations = JSON.parse(content);
        return Array.isArray(recommendations) ? recommendations.slice(0, 3) : this.getDefaultRecommendations(performance);
      } catch (parseError) {
        console.error('Failed to parse AI recommendations:', parseError);
        return this.getDefaultRecommendations(performance);
      }
    } catch (error) {
      console.error('Recommendation generation error:', error);
      return this.getDefaultRecommendations(performance);
    }
  }

  /**
   * Create optimized prompt for recommendations
   */

  /**
   * Default recommendations based on performance
   */
  private getDefaultRecommendations(performance: UserPerformance): string[] {
    const recommendations: string[] = [];
    const { avgScore, recentAnswers } = performance;

    if (avgScore < 0.6) {
      recommendations.push('Focus on basic vocabulary and common phrases');
      recommendations.push('Practice pronunciation with audio examples');
    }

    if (recentAnswers.length > 0) {
      const avgTime = recentAnswers.reduce((sum, a) => sum + a.timeSpent, 0) / recentAnswers.length;
      if (avgTime > 30000) { // 30 seconds
        recommendations.push('Take your time to think through each answer');
        recommendations.push('Review the material before attempting');
      }
    }

    if (avgScore > 0.8) {
      recommendations.push('Try more challenging scenarios');
      recommendations.push('Focus on conversational fluency');
    }

    return recommendations;
  }
}

export const aiAdapter = new AIAdapter();
export type { UserPerformance, DifficultyAdjustment };
