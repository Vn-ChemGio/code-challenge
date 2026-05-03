# 🏆 Leaderboard Module

A high-performance, flexible leaderboard management module designed for gaming applications. It supports persistent global leaderboards as well as time-bound or recurring event-specific leaderboards.

## 📖 ActionType Definition

The `ActionType` parameter determines the scope and context of the leaderboard. It supports two formats:

| Format | Description | Example |
|--------|-------------|---------|
| `EventType` (Enum) | Global or persistent leaderboard | `TOTAL_SCORE`, `PVP_WINS` |
| `EventType:EventId` (String) | Time-bound, seasonal, or recurring event leaderboard | `WEEKLY_CHALLENGE:507f191e810c19729de860ea` |

> 💡 **TypeScript Definition:**
> ```ts
> export enum EventType {
>   TOTAL_SCORE = 'TOTAL_SCORE',
>   WEEKLY_CHALLENGE = 'WEEKLY_CHALLENGE',
>   // ... other event types
> }
> 
> export type ActionType = EventType | `${EventType}:${string}`;
> ```

## 📦 API Reference

### `getUserScore(actionType: ActionType, userId: string): Promise<number>`
Retrieves the current score of a user for a specific leaderboard.
- **Returns:** `number` (current effective score)
- **Fallback:** Returns `0` if the user is not found in the leaderboard.

### `getUserRank(actionType: ActionType, userId: string): Promise<number | null>`
Retrieves the current rank of a user for a specific leaderboard.
- **Returns:** `number` (0-indexed rank, where `0` = 1st place, `1` = 2nd place, etc.)
- **Fallback:** Returns `null` if the user is not found.

### `increaseUserScore(actionType: ActionType, userId: string, point: number): Promise<void>`
Increments or decrements a user's score by a specified integer value. Automatically creates a new record if the user does not exist.
- **Parameters:**
    - `point`: `number` **(integer only)** – Positive to add points, negative to subtract.
- **Behavior:** Atomic update. If the user doesn't exist, initializes their score to `point`.

### `updateUserScore(actionType: ActionType, userId: string, point: number): Promise<void>`
Conditionally overwrites a user's score. The operation only succeeds if the provided `point` is **strictly higher** than the user's current score. Automatically creates a new record if the user does not exist.
- **Parameters:**
    - `point`: `number` **(integer only)** – The absolute score to set (must be higher than current).
- **Behavior:** Safe overwrite for high-score scenarios. Ignores the update if `point ≤ currentScore`. Atomic operation.

### `getTopPlayerIds(actionType: ActionType, numberOfTop: number): Promise<string[]>`
Retrieves an ordered list of user IDs from the top of the leaderboard.
- **Returns:** `string[]` (array of user IDs sorted from 1st to Nth place)
- **Note:** The returned array length will be `≤ numberOfTop` depending on available data.


📌 **Notes for Implementation:**
- The `updateUserScore` function is designed to run atomically (e.g., via Redis Lua script) to avoid race conditions when checking `"new > current"`.
- The time-weighted tie-breaking logic is handled internally by the storage layer, so developers only pass integer `point` values via the API.

## ⚙️ Technical Considerations

| Aspect | Implementation Detail |
|--------|----------------------|
| **Integer-Only Input** | The `point` parameter strictly accepts integers. Non-integer values will be truncated or rejected by input validation. |
| **Deterministic Tie-Breaking (Time-Weighted)** | When multiple users share the same base score, ranking is resolved using an internal time-weighted decimal offset. The system appends a timestamp-derived fraction to the stored score, ensuring that **users who reach a score earlier receive a slightly higher effective value**. Consequently, earlier achievers will always rank higher (lower rank number) than later achievers with the same base score. |
| **Storage Engine** | Redis Sorted Sets (`ZINCRBY`, `ZREVRANK`, `ZRANGE`) are recommended for O(log N) operations. MongoDB with `{ actionType: 1, score: -1 }` compound indexes is a valid alternative. |
| **Concurrency & Atomicity** | All score mutations use atomic operations to prevent race conditions during simultaneous updates. |
| **Event Lifecycle Management** | For `EventType:EventId` leaderboards, implement cron jobs or TTL-based expiration to automatically archive or reset data when events conclude. |


## 💻 Usage Example


```ts
import {
  getUserScore,
  getUserRank,
  increaseUserScore,
  updateUserScore,
  getTopPlayerIds,
  EventType
} from './leaderboard';

const USER_ID = 'player_abc123';
const GLOBAL_ACTION = EventType.TOTAL_SCORE;
const EVENT_ACTION = `${EventType.WEEKLY_CHALLENGE}:507f191e810c19729de860ea`;

// 1. Increment points (creates record if it doesn't exist)
await increaseUserScore(GLOBAL_ACTION, USER_ID, 150);

// 2. Force update only if new score is higher
// If current score is 150, this will update to 200
await updateUserScore(GLOBAL_ACTION, USER_ID, 200);

// If current score is 200, this will be safely ignored
await updateUserScore(GLOBAL_ACTION, USER_ID, 180);

// 3. Fetch score and rank
const currentScore = await getUserScore(GLOBAL_ACTION, USER_ID); // 200.00043...
const currentRank  = await getUserRank(GLOBAL_ACTION, USER_ID);   // e.g., 4 (5th place)

// 4. Get Top 10 players for an event leaderboard
const top10Ids = await getTopPlayerIds(EVENT_ACTION, 10);
console.log('Top 10 Players:', top10Ids);
```

## 📄 License

MIT License

Copyright (c) [Year] [Your Name/Organization]

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.