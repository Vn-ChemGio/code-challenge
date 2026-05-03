import type { RedisClientType } from 'redis';

export enum EventType {
  TOTAL_SCORE = 'TOTAL_SCORE',
  WEEKLY_CHALLENGE = 'WEEKLY_CHALLENGE',
  // Add other event types as needed
}

export type ActionType = EventType | `${EventType}:${string}`;

/**
 * High-performance Leaderboard Service using Redis Sorted Sets.
 *
 * Features:
 * - Atomic operations via embedded Lua scripts to prevent race conditions
 * - Deterministic tie-breaking: earlier achievers rank higher (lower rank number)
 * - Integer-only point validation
 * - O(log N) complexity for all read/write operations
 *
 * @requires redis@^4.0.0
 */
export class LeaderboardService {
  private readonly client: RedisClientType;
  private readonly KEY_PREFIX = 'leaderboard:';

  /**
   * Lua script for atomic score increment/decrement.
   * Strips existing time-weight, adds points, reapplies fresh time-weight.
   */
  private readonly INCREASE_SCRIPT = `
    local key = KEYS[1]
    local userId = ARGV[1]
    local points = tonumber(ARGV[2])
    local now = tonumber(ARGV[3])
    local timeWeight = (1 - now / 1e13) * 1e-6
    local current = redis.call('ZSCORE', key, userId)
    if current then
      local base = math.floor(tonumber(current))
      local newBase = base + points
      redis.call('ZADD', key, newBase + timeWeight, userId)
    else
      redis.call('ZADD', key, points + timeWeight, userId)
    end
    return 1
  `;

  /**
   * Lua script for atomic conditional update (only if new score is strictly higher).
   * Prevents downgrades and maintains atomicity during concurrent submissions.
   */
  private readonly UPDATE_SCRIPT = `
    local key = KEYS[1]
    local userId = ARGV[1]
    local newBase = tonumber(ARGV[2])
    local now = tonumber(ARGV[3])
    local current = redis.call('ZSCORE', key, userId)
    if current then
      local oldBase = math.floor(tonumber(current))
      if newBase > oldBase then
        local timeWeight = (1 - now / 1e13) * 1e-6
        redis.call('ZADD', key, newBase + timeWeight, userId)
      end
    else
      local timeWeight = (1 - now / 1e13) * 1e-6
      redis.call('ZADD', key, newBase + timeWeight, userId)
    end
    return 1
  `;

  constructor(client: RedisClientType) {
    this.client = client;
  }

  /**
   * Resolves the Redis key for a given ActionType.
   */
  private getKey(actionType: ActionType): string {
    return `${this.KEY_PREFIX}${actionType}`;
  }

  /**
   * Retrieves the current base score of a user in the specified leaderboard.
   *
   * @param actionType - The scope/context of the leaderboard (e.g., EventType or EventType:eventId)
   * @param userId - The unique identifier of the user
   * @returns The current integer score. Returns 0 if the user is not found.
   */
  async getUserScore(actionType: ActionType, userId: string): Promise<number> {
    const key = this.getKey(actionType);
    const rawScore = await this.client.zScore(key, userId);
    if (rawScore === null) return 0;
    // Strips the internal time-weighted decimal to return the logical base score
    return Math.floor(parseFloat(rawScore));
  }

  /**
   * Retrieves the current rank of a user in the specified leaderboard.
   *
   * @param actionType - The scope/context of the leaderboard
   * @param userId - The unique identifier of the user
   * @returns 0-indexed rank where 0 = 1st place. Returns null if the user is not found.
   */
  async getUserRank(actionType: ActionType, userId: string): Promise<number | null> {
    const key = this.getKey(actionType);
    return await this.client.zRevRank(key, userId);
  }

  /**
   * Atomically increments or decrements a user's score.
   * Automatically creates a new record if the user does not exist.
   *
   * @param actionType - The scope/context of the leaderboard
   * @param userId - The unique identifier of the user
   * @param point - Integer value to add (positive) or subtract (negative)
   * @throws TypeError if point is not an integer
   */
  async increaseUserScore(actionType: ActionType, userId: string, point: number): Promise<void> {
    if (!Number.isInteger(point)) {
      throw new TypeError('point must be an integer');
    }

    const key = this.getKey(actionType);
    await this.client.eval(this.INCREASE_SCRIPT, {
      keys: [key],
      arguments: [userId, String(point), String(Date.now())],
    });
  }

  /**
   * Conditionally overwrites a user's score only if the new value is strictly higher.
   * Automatically creates a new record if the user does not exist.
   * Ideal for "best score" tracking.
   *
   * @param actionType - The scope/context of the leaderboard
   * @param userId - The unique identifier of the user
   * @param point - The absolute integer score to set
   * @throws TypeError if point is not an integer
   */
  async updateUserScore(actionType: ActionType, userId: string, point: number): Promise<void> {
    if (!Number.isInteger(point)) {
      throw new TypeError('point must be an integer');
    }

    const key = this.getKey(actionType);
    await this.client.eval(this.UPDATE_SCRIPT, {
      keys: [key],
      arguments: [userId, String(point), String(Date.now())],
    });
  }

  /**
   * Retrieves an ordered list of user IDs from the top of the leaderboard.
   *
   * @param actionType - The scope/context of the leaderboard
   * @param numberOfTop - Maximum number of top players to retrieve
   * @returns Array of user IDs sorted from 1st to Nth place. Length <= numberOfTop.
   */
  async getTopPlayerIds(actionType: ActionType, numberOfTop: number): Promise<string[]> {
    if (numberOfTop <= 0) return [];

    const key = this.getKey(actionType);
    // ZRANGE with REV=true returns members from highest to lowest score
    return await this.client.zRange(key, 0, numberOfTop - 1, { REV: true });
  }
}