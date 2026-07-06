const logger = require("../utils/logger");

// In-memory cache store
const cache = new Map();

// Cache entry structure
const createCacheEntry = (data, ttl) => ({
  data,
  expiresAt: Date.now() + ttl * 1000,
  createdAt: Date.now(),
});

// Check if cache entry is expired
const isExpired = (entry) => {
  return Date.now() > entry.expiresAt;
};

// Generate cache key from request
const generateCacheKey = (req) => {
  const userId = req.userId || "guest";
  const role = req.role || "guest";
  return `${role}:${userId}:${req.method}:${req.originalUrl}`;
};

// Set cache entry
const setCache = (key, data, ttl = 300) => {
  cache.set(key, createCacheEntry(data, ttl));
  logger.debug(`Cache SET — Key: ${key} — TTL: ${ttl}s`);
};

// Get cache entry
const getCache = (key) => {
  const entry = cache.get(key);

  if (!entry) return null;

  if (isExpired(entry)) {
    cache.delete(key);
    logger.debug(`Cache EXPIRED — Key: ${key}`);
    return null;
  }

  logger.debug(`Cache HIT — Key: ${key}`);
  return entry.data;
};

// Delete cache entry
const deleteCache = (key) => {
  cache.delete(key);
  logger.debug(`Cache DELETE — Key: ${key}`);
};

// Delete all cache entries matching a pattern
const deleteCacheByPattern = (pattern) => {
  let count = 0;
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
      count++;
    }
  }
  logger.debug(
    `Cache DELETE PATTERN — Pattern: ${pattern} — Deleted: ${count} entries`,
  );
  return count;
};

// Clear all cache
const clearCache = () => {
  const size = cache.size;
  cache.clear();
  logger.info(`Cache CLEARED — Removed: ${size} entries`);
};

// Get cache stats
const getCacheStats = () => {
  let expired = 0;
  let active = 0;

  for (const [key, entry] of cache.entries()) {
    if (isExpired(entry)) {
      expired++;
    } else {
      active++;
    }
  }

  return {
    total: cache.size,
    active,
    expired,
    keys: Array.from(cache.keys()),
  };
};

// Clean expired entries from cache
const cleanExpiredCache = () => {
  let count = 0;
  for (const [key, entry] of cache.entries()) {
    if (isExpired(entry)) {
      cache.delete(key);
      count++;
    }
  }
  if (count > 0) {
    logger.debug(`Cache CLEANUP — Removed: ${count} expired entries`);
  }
  return count;
};

// Auto clean expired entries every 10 minutes
setInterval(cleanExpiredCache, 10 * 60 * 1000);

// Cache middleware factory — caches response for given TTL in seconds
const cacheMiddleware = (ttl = 300) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== "GET") {
      return next();
    }

    const key = generateCacheKey(req);
    const cachedData = getCache(key);

    if (cachedData) {
      return res.status(200).json({
        ...cachedData,
        fromCache: true,
      });
    }

    // Override res.json to cache the response
    const originalJson = res.json.bind(res);

    res.json = (data) => {
      // Only cache successful responses
      if (res.statusCode === 200 && data.success) {
        setCache(key, data, ttl);
      }
      return originalJson(data);
    };

    next();
  };
};

// Cache for leaderboard — 5 minutes
const cacheLeaderboard = cacheMiddleware(300);

// Cache for questions list — 10 minutes
const cacheQuestions = cacheMiddleware(600);

// Cache for user profile — 2 minutes
const cacheProfile = cacheMiddleware(120);

// Cache for analytics — 15 minutes
const cacheAnalytics = cacheMiddleware(900);

// Cache for subject stats — 10 minutes
const cacheSubjectStats = cacheMiddleware(600);

// Cache for admin dashboard stats — 5 minutes
const cacheAdminStats = cacheMiddleware(300);

// Invalidate user cache when data changes
const invalidateUserCache = (userId, role = "student") => {
  deleteCacheByPattern(`${role}:${userId}`);
};

// Invalidate questions cache when questions change
const invalidateQuestionsCache = () => {
  deleteCacheByPattern(":GET:/api/questions");
  deleteCacheByPattern(":GET:/api/student/quiz");
};

// Invalidate leaderboard cache when scores change
const invalidateLeaderboardCache = () => {
  deleteCacheByPattern(":GET:/api/leaderboard");
  deleteCacheByPattern(":GET:/api/student/leaderboard");
};

// Invalidate admin cache when data changes
const invalidateAdminCache = () => {
  deleteCacheByPattern("admin:");
};

module.exports = {
  cacheMiddleware,
  cacheLeaderboard,
  cacheQuestions,
  cacheProfile,
  cacheAnalytics,
  cacheSubjectStats,
  cacheAdminStats,
  setCache,
  getCache,
  deleteCache,
  deleteCacheByPattern,
  clearCache,
  getCacheStats,
  cleanExpiredCache,
  invalidateUserCache,
  invalidateQuestionsCache,
  invalidateLeaderboardCache,
  invalidateAdminCache,
};
