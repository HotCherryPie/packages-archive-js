function traverse(target, func, path = [], depth = 0) {
  Object.entries(target).forEach(([key, value]) => {
      func({ key, value, path, depth });
      if (value && typeof (value) === 'object') traverse(value, func, [...path, key], depth + 1);
  });
}

export default (target, func) => traverse(target, func);
