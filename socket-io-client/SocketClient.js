/* eslint-disable no-console */
/* eslint-disable no-underscore-dangle */
import io from 'socket.io-client';

import ConnectionStatus from './SocketClientConnectionStatus';
import TransportMethod from './SocketClientTransportMethod';

export default class SocketClient {
  _currentHostIndex = 0

  _connectionStatus = ConnectionStatus.DISCONECTED

  _client = null

  _inMessageProcessors = []

  _outMessageProcessors = []

  _messageHandlers = []

  _connectionStatusChangeHandlers = []

  _connectionStateChangeHandlers = []

  constructor({
    hosts,
    path,
    transports = [TransportMethod.WEBSOCKET, TransportMethod.POLLING],
    timeout = 10000,
    forceNew = true,
    query = null,
    maintainConnection = false,
    // reconnectionAttemptsPerHost = 3,
    // reconnectionCycles = 2,
  }) {
    this._hosts = hosts;
    this._maintainConnection = maintainConnection;
    // this._reconnectionCycles = reconnectionCycles;
    this._options = {
      path,
      transports,
      timeout,
      forceNew,
      query,
      // reconnectionAttempts: reconnectionAttemptsPerHost,
      reconnection: false,
    };
  }

  get _currentHost() {
    return this._hosts[this._currentHostIndex];
  }

  get _isCurrentHostIsLastInPool() {
    return this._currentHostIndex === this._hosts.length - 1;
  }

  get _resolvedOptions() {
    return {
      ...this._options,
      query: Object.entries(this._options.query || {})
        .map(([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`).join('&'),
    };
  }

  get options() {
    return { ...this._options };
  }

  get connectionStatus() {
    return this._connectionStatus;
  }

  _setConnectionStatus(status) {
    this._connectionStatus = status;
    this._connectionStateChangeHandlers.forEach(e => e(status === ConnectionStatus.CONNECTED));
    this._connectionStatusChangeHandlers.forEach(e => e(status));
  }

  _onClientConnect() {
    // if (__DEV__) console.log('🌐✅ connected');

    this._setConnectionStatus(ConnectionStatus.CONNECTED);
  }

  _onClientDisconnect() {
    // if (__DEV__) console.log('🌐❌ disconnected');

    if (this._maintainConnection) {
      this._connect();
    } else {
      this._setConnectionStatus(ConnectionStatus.DISCONECTED);
    }
  }

  _onClientConnectError() {
    // if (__DEV__) console.log('🌐🚫 connect_error');

    const switchedToNext = this._switchToNextHost();

    this._client.close();

    if (switchedToNext || this._maintainConnection) {
      // if (__DEV__) console.log('🌐 go to new atempt');
      this._connect();
    } else {
      // if (__DEV__) console.log('🌐 end of trying');
      this._setConnectionStatus(ConnectionStatus.DISCONECTED);
    }
  }

  _inMessageHandler(type, callback, data) {
    const formattedData = this._inMessageProcessors.reduce((d, p) => p(d), data);

    callback(formattedData);
  }

  _switchToNextHost() {
    return !!(this._currentHostIndex = this._isCurrentHostIsLastInPool
      ? 0
      : this._currentHostIndex + 1);
  }

  _connect() {
    console.log(`🌐 try to connect with: ${this._currentHost}`);
    this._setConnectionStatus(ConnectionStatus.PENDING);
    const client = io(this._currentHost, this._resolvedOptions);

    this._messageHandlers
      .forEach(({ type, handler }) => client.on(type, this._inMessageHandler.bind(this, type, handler)));

    client.on('connect', this._onClientConnect.bind(this));
    client.on('disconnect', this._onClientDisconnect.bind(this));
    client.on('connect_error', this._onClientConnectError.bind(this));
    // client.on('connect_timeout', () => console.log('--> connect_timeout'));
    // client.on('reconnect_error', () => console.log('--> reconnect_error'));
    // client.on('reconnect_failed', () => console.log('--> reconnect_failed'));
    // client.on('reconnect_attempt', () => console.log('--> reconnect_attempt'));
    // client.on('reconnecting', () => console.log('--> reconnecting'));

    this._client = client;
  }

  connect() {
    if (this._connectionStatus === ConnectionStatus.CONNECTED
      || this._connectionStatus === ConnectionStatus.PENDING) return;

    this._currentHostIndex = 0;

    this._connect();
  }

  on(type, handler) {
    this._messageHandlers.push({ type, handler });
  }

  off(type, handler) {
    this._messageHandlers = this._messageHandlers
      .filter(({ type: stype, handler: shandler }) => !(stype === type && shandler === handler));
  }

  emit(type, ...params) {
    this._client.emit(type, ...params);
  }

  request() {}

  addInMessageProcessor(processor) {
    this._inMessageProcessors.push(processor);
  }

  addOutMessageProcessor(processor) {
    this._outMessageProcessors.push(processor);
  }

  // return ConnectionStatus
  onConnectionStatusChange(handler) {
    this._connectionStatusChangeHandlers.push(handler);
  }

  // returns true/false
  onConnectionStateChange(handler) {
    this._connectionStateChangeHandlers.push(handler);
  }

  setOptions(options) {
    this._options = { ...this._options, ...options };
  }
}
