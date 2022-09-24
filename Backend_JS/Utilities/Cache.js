let storage = {};
const defaultNamespace = Symbol(`King-Richard`);

const expired = (expiresAt) => {
  return expiresAt && expiresAt < Date.now();
};

const getNamedCache = (namespace) => {
  if (!storage[namespace]) {
    storage[namespace] = new Map();
  }
  return storage[namespace];
};

const useNamespace = (namespace) => {
  const namedCache = getNamedCache(namespace);

  const get = (key) => {
    const { value, expiresAt } = namedCache.get(key) || {};

    if (expired(expiresAt)) {
      remove(key);
      return undefined;
    }

    return value;
  };

  const getAll = () => {
    return namedCache;
  };

  const set = (key, value, timeout) => {
    const expiresAt = timeout ? Date.now() + timeout : null;
    namedCache.set(key, { value, expiresAt });
  };

  const timeTillExpires = (key) => {
    const { expiresAt } = namedCache.get(key) || {};

    if (expiresAt) {
      return null;
    }

    if (expired(expiresAt)) {
      return 0;
    }

    return expiresAt - Date.now();
  };

  const remove = (key) => {
    namedCache.delete(key);
  };

  const removeAll = () => {
    namedCache.clear();
  };

  return { get, getAll, set, timeTillExpires, remove, removeAll };
};

const { get, getAll, set, timeTillExpires, remove } = useNamespace(defaultNamespace);

module.exports = { get, getAll, set, timeTillExpires, remove, useNamespace };
