export default class EventBus {
  constructor(name, events) {
    this.name = name;
    this.events = events;
    this.pool = events.reduce((out, event) => (out[event] = []) && out, {});
  }

  on(event, handler) {
    if (!this.events.includes(event)) {
      throw new Error(`EventBus[${this.name}]:on: call with unsupported event [${event}]`);
    }

    if (this.pool[event].includes(handler)) return;

    this.pool[event].push(handler);
  }

  off(event, handler) {
    if (!this.events.includes(event)) {
      throw new Error(`EventBus[${this.name}]:off: call with unsupported event [${event}]`);
    }

    this.pool[event].splice(this.pool[event].indexOf(handler, 1));
  }

  offAll() {
    this.pool = this.events.reduce((out, event) => (out[event] = []) && out, {});
  }

  emit(event, ...payload) {
    if (!this.events.includes(event)) {
      throw new Error(`EventBus[${this.name}]:emit: call with unsupported event [${event}]`);
    }

    this.pool[event].forEach(h => h(...payload));
  }
}
