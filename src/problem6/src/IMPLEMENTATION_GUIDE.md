# 🛠 Leaderboard Service - Backend Implementation Guide

This document provides technical specifications, deployment guidelines, and best practices for the `LeaderboardService`. It is intended for backend engineers responsible for integration, scaling, testing, and monitoring.

---

## 📋 Overview
The `LeaderboardService` is a Redis-backed leaderboard manager built for high-concurrency gaming environments. It guarantees:
- **Atomic score mutations** via embedded Lua scripts
- **Deterministic tie-breaking** using time-weighted decimal offsets
- **O(log N)** read/write complexity
- Strict **integer-only** score validation at the API boundary

---

## 📦 Prerequisites & Dependencies

| Component | Version / Requirement |
|-----------|----------------------|
| Node.js   | `>=18.0.0` |
| TypeScript | `>=5.0.0` |
| Redis     | `>=6.2.0` (sorted set commands are stable; `EVAL` supported since 2.6) |
| `redis` npm | `^4.0.0` (official client) |

> 💡 Ensure your Redis deployment supports Lua scripting and has `lua-time-limit` set to at least `5000` ms (default is usually sufficient given O(log N) operations).

---

## ⚙️ Redis Configuration & Setup

### Connection Initialization
```typescript
import { createClient } from 'redis';
import { LeaderboardService } from './services/LeaderboardService';

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 100, 3000),
  },
});

await redisClient.connect();
const leaderboard = new LeaderboardService(redisClient);
```

### Key Naming & Hash Tags (Redis Cluster)
If deploying on **Redis Cluster**, use hash tags to guarantee all leaderboard keys route to the same slot:
```typescript
private getKey(actionType: ActionType): string {
  return `leaderboard:{${actionType}}`;
}
```
Without hash tags, Lua scripts will throw `CROSSSLOT` errors during multi-key operations.

---

## 🔍 Core Implementation Details

### ⏱ Time-Weighted Tie-Breaking Formula
```lua
local timeWeight = (1 - now / 1e13) * 1e-6
```
- **Purpose:** Ensures earlier achievers rank higher when base scores match.
- **Precision Safety:** Safely supports integer base scores up to `~9×10⁹` without IEEE 754 precision loss.
- **Adjustment:** If your game exceeds `10^9` points, change `1e-6` to `1e-8` or `1e-10` in both Lua scripts.

### 🧮 Score Storage & Retrieval
- **Storage:** `baseScore + timeWeight` (e.g., `150.0000987`)
- **Read Path:** `Math.floor(parseFloat(rawScore))` strips the decimal offset before returning to the client.
- **Why not `Decimal128`?** Redis natively uses IEEE 754 doubles. The time-weight trick avoids custom serialization while maintaining deterministic ordering.

### 🔒 Atomicity Guarantees
- `increaseUserScore` → `INCREASE_SCRIPT`: Reads, modifies, and writes in a single Lua execution. No `WATCH`/`MULTI` needed.
- `updateUserScore` → `UPDATE_SCRIPT`: Implements compare-and-swap (CAS) logic. Rejects updates if `newBase ≤ currentBase`.

### 🔢 Ranking Logic
- Uses `ZREVRANK` → returns `0` for 1st place, `1` for 2nd, etc.
- Returns `null` if the user is absent from the sorted set.

---

## 🔄 Event Lifecycle & Key Management

| Strategy | When to Use | Implementation |
|----------|-------------|----------------|
| **TTL-based** | Fixed-duration events (e.g., weekly challenges) | `await redis.expire(key, secondsRemaining)` after first write |
| **Cron Cleanup** | Recurring or unpredictable events | Scheduled job runs `SCAN` + `DEL` for expired `eventId` keys |
| **Archive Pattern** | Historical leaderboards needed post-event | `RENAME key leaderboard:archive:${key}` before deletion |

> ⚠️ Never use `KEYS *` in production. Use `SCAN` with match patterns for safe iteration.

---

## 🧪 Testing Strategy

### Unit Testing (Mocked)
```typescript
const mockRedis = {
  zScore: jest.fn().mockResolvedValue('150.0000987'),
  zRevRank: jest.fn().mockResolvedValue(3),
  eval: jest.fn().mockResolvedValue(1),
  zRange: jest.fn().mockResolvedValue(['user1', 'user2']),
};
```

### Integration Testing
Use `@testcontainers/redis` or `redis-memory-server` for realistic Lua execution:
```typescript
import { RedisContainer } from '@testcontainers/redis';
const container = await new RedisContainer().start();
const client = createClient({ url: container.getConnectionUrl() });
await client.connect();
// Run concurrency tests with Promise.all() to verify atomicity
```

### Concurrency Validation
Spawn 100+ parallel `increaseUserScore` calls to the same user/key. Assert final score equals `sum(points)`. Race conditions will manifest immediately if atomicity is broken.

---

## 📈 Performance & Scaling Guidelines

| Metric | Target | Optimization |
|--------|--------|--------------|
| Latency (p95) | `< 5ms` | Keep Lua scripts lightweight; avoid blocking calls |
| Memory Usage | `< 50MB / 10k users` | Use `EXPIRE` aggressively; avoid storing large payloads in member names |
| Throughput | `> 10k ops/sec` | Enable Redis pipelining for bulk reads; use `EVALSHA` (auto-handled by client) |

### Bulk Reads
For dashboards or batch APIs, replace `getUserScore` loops with:
```typescript
const pipeline = client.multi();
userIds.forEach(id => pipeline.zScore(key, id));
const results = await pipeline.exec();
```

---

## 📊 Monitoring & Observability

Track the following metrics via Prometheus/Grafana or APM:

| Metric | Type | Alert Threshold |
|--------|------|-----------------|
| `leaderboard.ops.duration` | Histogram | p99 > 20ms |
| `leaderboard.errors.total` | Counter | > 1/min |
| `leaderboard.keys.expired` | Counter | Track cleanup job health |
| `redis.memory.used` | Gauge | > 80% maxmemory |
| `lua.script.cache.hits` | Counter | Verify scripts are cached |

Add tracing context:
```typescript
const span = tracer.startSpan('leaderboard.increaseUserScore');
span.setTag('action_type', actionType);
// ... execute ...
span.finish();
```

---

## 🛟 Troubleshooting & FAQ

| Issue | Root Cause | Resolution |
|-------|------------|------------|
| `WRONGTYPE` error | Key exists as non-sorted-set type | Delete conflicting key or change prefix |
| `CROSSSLOT` in Cluster | Keys hash to different slots | Use `{hash-tag}` in key names |
| Rank jumps unexpectedly | Time-weight precision collision | Adjust `1e-6` multiplier or scale base scores |
| High memory on expired events | Missing TTL/cleanup | Implement `EXPIRE` or scheduled `SCAN+DEL` |
| `point` accepts decimals | Validation bypassed | Ensure `Number.isInteger()` check runs before Redis call |

---

## 📎 Appendix: Quick Reference

| Method | Redis Command | Complexity | Return |
|--------|---------------|------------|--------|
| `getUserScore` | `ZSCORE` | O(log N) | `number` |
| `getUserRank` | `ZREVRANK` | O(log N) | `number \| null` |
| `increaseUserScore` | `EVAL` (Lua) | O(log N) | `void` |
| `updateUserScore` | `EVAL` (Lua) | O(log N) | `void` |
| `getTopPlayerIds` | `ZRANGE ... REV` | O(log N + M) | `string[]` |

> 📝 **Maintainers:** Keep Lua scripts version-controlled. Any change requires cache invalidation (`SCRIPT FLUSH` in dev, or rely on Redis automatic eviction in prod).

---
*Document Version: 1.0 | Last Updated: 2026-04-22*