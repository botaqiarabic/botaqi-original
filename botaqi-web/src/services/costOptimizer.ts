// Cost Optimization Service for Gulfara AI Features
// Ensures maximum cost per user stays under $0.01

interface TokenUsage {
  difficultyAdjustment: number;
  recommendations: number;
  total: number;
}

interface CostLimits {
  maxTokensPerUser: number;
  maxCostPerUser: number;
  gpt5NanoCostPer1kTokens: number;
  gpt5MiniCostPer1kTokens: number;
}

class CostOptimizer {
  private limits: CostLimits;
  private userUsage: Map<string, TokenUsage> = new Map();

  constructor() {
    // GPT-5 pricing as of 2025 (estimated)
    this.limits = {
      maxTokensPerUser: 500, // Maximum tokens per user session
      maxCostPerUser: 0.01, // $0.01 maximum cost per user
      gpt5NanoCostPer1kTokens: 0.0005, // $0.0005 per 1k tokens
      gpt5MiniCostPer1kTokens: 0.002 // $0.002 per 1k tokens
    };
  }

  /**
   * Check if user can make AI request without exceeding cost limit
   */
  canMakeRequest(userId: string, estimatedTokens: number): boolean {
    const currentUsage = this.userUsage.get(userId) || {
      difficultyAdjustment: 0,
      recommendations: 0,
      total: 0
    };

    const newTotal = currentUsage.total + estimatedTokens;
    return newTotal <= this.limits.maxTokensPerUser;
  }

  /**
   * Record token usage for a user
   */
  recordUsage(userId: string, tokens: number, type: 'difficultyAdjustment' | 'recommendations'): void {
    const currentUsage = this.userUsage.get(userId) || {
      difficultyAdjustment: 0,
      recommendations: 0,
      total: 0
    };

    currentUsage[type] += tokens;
    currentUsage.total += tokens;
    
    this.userUsage.set(userId, currentUsage);
  }

  /**
   * Get optimized model selection based on usage
   */
  getOptimalModel(userId: string, requestType: 'difficulty' | 'recommendations'): 'gpt-5-nano' | 'gpt-5-mini' {
    const currentUsage = this.userUsage.get(userId) || { total: 0 };
    const remainingTokens = this.limits.maxTokensPerUser - currentUsage.total;

    // Use nano for difficulty adjustments (lower quality, lower cost)
    if (requestType === 'difficulty') {
      return 'gpt-5-nano';
    }

    // Use mini for recommendations only if user has enough tokens left
    if (requestType === 'recommendations' && remainingTokens >= 200) {
      return 'gpt-5-mini';
    }

    // Fallback to nano for cost control
    return 'gpt-5-nano';
  }

  /**
   * Calculate estimated cost for a request
   */
  calculateCost(tokens: number, model: 'gpt-5-nano' | 'gpt-5-mini'): number {
    const costPer1k = model === 'gpt-5-nano' 
      ? this.limits.gpt5NanoCostPer1kTokens 
      : this.limits.gpt5MiniCostPer1kTokens;
    
    return (tokens / 1000) * costPer1k;
  }

  /**
   * Get user's current cost
   */
  getUserCost(userId: string): number {
    const usage = this.userUsage.get(userId);
    if (!usage) return 0;

    const nanoCost = this.calculateCost(usage.difficultyAdjustment, 'gpt-5-nano');
    const miniCost = this.calculateCost(usage.recommendations, 'gpt-5-mini');
    
    return nanoCost + miniCost;
  }

  /**
   * Reset user usage (call at start of new session)
   */
  resetUserUsage(userId: string): void {
    this.userUsage.delete(userId);
  }

  /**
   * Get usage statistics
   */
  getUsageStats(userId: string): {
    totalTokens: number;
    totalCost: number;
    remainingTokens: number;
    canMakeRequest: boolean;
  } {
    const usage = this.userUsage.get(userId) || { total: 0 };
    const totalCost = this.getUserCost(userId);
    const remainingTokens = this.limits.maxTokensPerUser - usage.total;
    
    return {
      totalTokens: usage.total,
      totalCost,
      remainingTokens,
      canMakeRequest: remainingTokens > 50 // Minimum tokens for a request
    };
  }

  /**
   * Optimize prompt to reduce token usage
   */
  optimizePrompt(prompt: string, maxTokens: number): string {
    if (prompt.length <= maxTokens) return prompt;
    
    // Truncate and add context preservation
    const truncated = prompt.substring(0, maxTokens - 50);
    return truncated + '... [truncated for cost optimization]';
  }

  /**
   * Get cost-effective prompt for difficulty adjustment
   */
  getDifficultyPrompt(performance: any): string {
    const { lastResult, avgScore, targetDifficulty } = performance;
    return `Perf: ${lastResult ? 'correct' : 'wrong'}, avg:${avgScore.toFixed(1)}, target:${targetDifficulty}. Suggest difficulty 1-5 with confidence 0-1. JSON: {"nextDifficulty":n,"confidence":n,"reasoning":"text"}`;
  }

  /**
   * Get cost-effective prompt for recommendations
   */
  getRecommendationPrompt(performance: any): string {
    const { avgScore, recentAnswers } = performance;
    return `Score:${avgScore.toFixed(1)}, answers:${recentAnswers.length}. Give 3 Arabic learning tips. JSON array: ["tip1","tip2","tip3"]`;
  }
}

export const costOptimizer = new CostOptimizer();
export type { TokenUsage, CostLimits };
