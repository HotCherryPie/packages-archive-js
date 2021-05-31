// https://github.com/signalapp/Signal-Android/commit/8f7fe5c3eeb693e132b3c7d8bc692546bd70d27d
// https://en.wikipedia.org/wiki/Exponential_backoff
// https://habr.com/ru/company/vdsina/blog/539330/

function calculateNextRunAttemptTime(currentTime, nextAttempt, maxBackoff) {
  const boundedAttempt = Math.min(nextAttempt, 30);
  const exponentialBackoff = Math.pow(2, boundedAttempt) * 1000;
  const actualBackoff = Math.min(exponentialBackoff, maxBackoff);
  const jitter = 0.75 + (Math.random() * 0.5);

  return currentTime + (actualBackoff * jitter);
}
