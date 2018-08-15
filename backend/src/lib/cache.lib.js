var lru = require('lru-cache');

/**
 * 缓存
 */
var options = {
  max: 500, // 
  maxAge: 1000 * 60 * 60 * 24 // 60 min cache
};

module.exports = lru(options);