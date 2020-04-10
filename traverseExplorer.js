function traverse(target, func, path = []) {
  Object.entries(target).forEach(([key, value]) => {
      func({ key, value, path });
      if (value && typeof (value) === 'object') traverseInternal(value, func, [...path, key]);
  });
}

export default (target, func) => traverse(target, func);
