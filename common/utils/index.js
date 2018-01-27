export function isBrowser() {
  return !process.env._;
}

export function isNode() {
  return !!process.env._;
}

/// #if BROWSER
Object.assign(module.exports, require('./browser'));
/// #endif

/// #if NODE
Object.assign(module.exports, require('./node'));
/// #endif
