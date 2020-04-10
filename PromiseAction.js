/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-expressions */

const Exodus = {
  RELEASE: Symbol('PromiseActionExodus:RELEASE'),
  ABORT: Symbol('PromiseActionExodus:ABORT'),
  OBSOLESCENCE: Symbol('PromiseActionExodus:OBSOLESCENCE'),
  ERROR: Symbol('PromiseActionExodus:ERROR'),
};

class PromiseActionResult {
  constructor(exodus, value = undefined) {
    this.exodus = exodus;
    this.value = value;
  }
}

export default class PromiseAction {
  static Exodus = Exodus;

  constructor({ action, onCreate, onStart, onRelease, onAbort, onEnd, onCatch, onObsolescence }) {
    this.config = { action, onCreate, onStart, onRelease, onAbort, onEnd, onCatch, onObsolescence };
  }

  get isPending() {
    return this.promise !== null;
  }

  do(payload) {
    if (this.promise) {
      // consider existed promise as outdated
      // any other action lifecicly methods will
      // not be called with them
      this._resolveHandle(new PromiseActionResult(Exodus.OBSOLESCENCE));
      this.config.onObsolescence?.(this.promise, this.payload);
    }

    const promise = (new Promise((resolve, reject) => {
      this._resolveHandle = resolve;
      this.config.action(payload).then(resolve, reject);
    }))
      .then(e => this._handleThen(promise, e, payload))
      .catch(e => this._handleCatch(promise, e, payload))
      .finally(() => this._handleFinally(promise, payload));

    if (!this.promise) this.config.onStart?.(promise, payload);

    this.config?.onCreate?.(promise, payload);

    this.promise = promise;
    this.payload = payload;

    return promise;
  }

  abort() {
    if (!this.promise) return;

    this._resolveHandle(new PromiseActionResult(Exodus.ABORT));
    this.config.onAbort?.(this.promise, this.payload);
    // this.config.onEnd?.(this.promise, this.payload);

    this.promise = null;
    this.payload = null;
    this._resolveHandle = null;
  }

  _handleThen(owner, result, payload) {
    if (result instanceof PromiseActionResult) return result;

    if (this.promise !== owner) return;

    this.config.onRelease?.(result, payload);

    return new PromiseActionResult(Exodus.RELEASE, result);
  }

  _handleCatch(owner, error, payload) {
    if (this.promise !== owner) return;

    this.config.onCatch?.(error, payload);

    return new PromiseActionResult(Exodus.ERROR, error);
  }

  _handleFinally(owner, payload) {
    if (this.promise !== owner) return;

    this.promise = null;
    this.payload = null;
    this._resolveHandle = null;

    this.config.onEnd?.(owner, payload);
  }
}
