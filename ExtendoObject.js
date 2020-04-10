function superExtendoObject(Reference, initialValue, extendMap) {
  const MAP = Symbol('sequential extension map');

  const targetSurrogate = new Reference();
  Object.defineProperty(targetSurrogate, MAP, {
      writable: true,
      value: initialValue,
  });

  let originProxy = null;
  let extensionProxy = null;

  const extensionProxyHooks = {
      get(target, name) {
          // eslint-disable-next-line no-param-reassign
          target[MAP] = extendMap(target[MAP], name);
          return extensionProxy;
      },
      apply(target, thisValue) {
          return target[MAP];
      },
  };

  const originProxyHooks = {
      get(target, name) {
          // eslint-disable-next-line no-param-reassign
          target[MAP] = extendMap(initialValue, name);
          extensionProxy = new Proxy(target, extensionProxyHooks);
          return extensionProxy;
      },
  };

  originProxy = new Proxy(targetSurrogate, originProxyHooks);

  return originProxy;
}

const God = superExtendoObject(Function, 'God', (map, property) => `${map} ${property}`);
God.i.love.proxy.objects();
