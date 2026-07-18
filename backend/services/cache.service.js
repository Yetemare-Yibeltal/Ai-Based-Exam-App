const logger = require("../utils/logger");

const store = new Map();

const CACHE_TTL = {
  SHORT: 60,
  MEDIUM: 300,
  LONG: 600,
  VERY_LONG: 900,
  HOUR: 3600,
};

const CACHE_KEYS = {
  LEADERBOARD: "leaderboard",
  QUESTIONS: "questions",
  SUBJECT_STATS: "subject_stats",
  PLATFORM_STATS: "platform_stats",
  ADMIN_STATS: "admin_stats",
  PROFILE: "profile",
  ANALYTICS: "analytics",
};

const createEntry = (data, ttl) => ({
  data,
  expiresAt: Date.now() + ttl * 1000,
  createdAt: Date.now(),
  hits: 0,
});

const isExpired = (entry) => Date.now() > entry.expiresAt;

const set = (key, data, ttl = CACHE_TTL.MEDIUM) => {
  store.set(key, createEntry(data, ttl));
  logger.debug(`Cache SET — Key: ${key} — TTL: ${ttl}s`);
  return true;
};

const get = (key) => {
  const entry = store.get(key);

  if (!entry) return null;

  if (isExpired(entry)) {
    store.delete(key);
    logger.debug(`Cache EXPIRED — Key: ${key}`);
    return null;
  }

  entry.hits++;
  logger.debug(`Cache HIT — Key: ${key} — Hits: ${entry.hits}`);
  return entry.data;
};

const del = (key) => {
  const deleted = store.delete(key);
  if (deleted) logger.debug(`Cache DELETE — Key: ${key}`);
  return deleted;
};

const deleteByPattern = (pattern) => {
  let count = 0;
  for (const key of store.keys()) {
    if (key.includes(pattern)) {
      store.delete(key);
      count++;
    }
  }
  if (count > 0)
    logger.debug(
      `Cache DELETE PATTERN — Pattern: ${pattern} — Count: ${count}`,
    );
  return count;
};

const deleteByPrefix = (prefix) => {
  let count = 0;
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) {
      store.delete(key);
      count++;
    }
  }
  if (count > 0)
    logger.debug(`Cache DELETE PREFIX — Prefix: ${prefix} — Count: ${count}`);
  return count;
};

const clear = () => {
  const size = store.size;
  store.clear();
  logger.info(`Cache CLEARED — Removed: ${size} entries`);
  return size;
};

const has = (key) => {
  const entry = store.get(key);
  if (!entry) return false;
  if (isExpired(entry)) {
    store.delete(key);
    return false;
  }
  return true;
};

const getOrSet = async (key, fetchFn, ttl = CACHE_TTL.MEDIUM) => {
  const cached = get(key);
  if (cached !== null) return cached;

  const data = await fetchFn();
  set(key, data, ttl);
  return data;
};

const getStats = () => {
  let active = 0;
  let expired = 0;
  let totalHits = 0;

  for (const [key, entry] of store.entries()) {
    if (isExpired(entry)) {
      expired++;
    } else {
      active++;
      totalHits += entry.hits;
    }
  }

  return {
    total: store.size,
    active,
    expired,
    totalHits,
    keys: Array.from(store.keys()),
  };
};

const cleanup = () => {
  let count = 0;
  for (const [key, entry] of store.entries()) {
    if (isExpired(entry)) {
      store.delete(key);
      count++;
    }
  }
  if (count > 0)
    logger.debug(`Cache CLEANUP — Removed: ${count} expired entries`);
  return count;
};

setInterval(cleanup, 10 * 60 * 1000);

const buildKey = (...parts) => parts.filter(Boolean).join(":");

const invalidateLeaderboard = () => deleteByPattern(CACHE_KEYS.LEADERBOARD);
const invalidateQuestions = () => deleteByPattern(CACHE_KEYS.QUESTIONS);
const invalidateSubjectStats = () => deleteByPattern(CACHE_KEYS.SUBJECT_STATS);
const invalidatePlatformStats = () =>
  deleteByPattern(CACHE_KEYS.PLATFORM_STATS);
const invalidateAdminStats = () => deleteByPattern(CACHE_KEYS.ADMIN_STATS);
const invalidateUserProfile = (userId) => deleteByPattern(`profile:${userId}`);
const invalidateAnalytics = () => deleteByPattern(CACHE_KEYS.ANALYTICS);

const cacheMiddleware = (ttl = CACHE_TTL.MEDIUM, keyPrefix = "") => {
  return (req, res, next) => {
    if (req.method !== "GET") return next();

    const userId = req.userId || "guest";
    const role = req.role || "guest";
    const key = buildKey(keyPrefix, role, userId, req.method, req.originalUrl);

    const cached = get(key);
    if (cached) {
      return res.status(200).json({ ...cached, fromCache: true });
    }

    const originalJson = res.json.bind(res);
    res.json = (data) => {
      if (res.statusCode === 200 && data?.success) {
        set(key, data, ttl);
      }
      return originalJson(data);
    };

    next();
  };
};

const cacheLeaderboard = cacheMiddleware(
  CACHE_TTL.MEDIUM,
  CACHE_KEYS.LEADERBOARD,
);
const cacheQuestions = cacheMiddleware(CACHE_TTL.LONG, CACHE_KEYS.QUESTIONS);
const cacheSubjectStats = cacheMiddleware(
  CACHE_TTL.LONG,
  CACHE_KEYS.SUBJECT_STATS,
);
const cacheProfile = cacheMiddleware(CACHE_TTL.SHORT, CACHE_KEYS.PROFILE);
const cacheAnalytics = cacheMiddleware(
  CACHE_TTL.VERY_LONG,
  CACHE_KEYS.ANALYTICS,
);
const cacheAdminStats = cacheMiddleware(
  CACHE_TTL.MEDIUM,
  CACHE_KEYS.ADMIN_STATS,
);

module.exports = {
  set,
  get,
  del,
  has,
  clear,
  deleteByPattern,
  deleteByPrefix,
  getOrSet,
  getStats,
  cleanup,
  buildKey,
  CACHE_TTL,
  CACHE_KEYS,
  invalidateLeaderboard,
  invalidateQuestions,
  invalidateSubjectStats,
  invalidatePlatformStats,
  invalidateAdminStats,
  invalidateUserProfile,
  invalidateAnalytics,
  cacheMiddleware,
  cacheLeaderboard,
  cacheQuestions,
  cacheSubjectStats,
  cacheProfile,
  cacheAnalytics,
  cacheAdminStats,
};
