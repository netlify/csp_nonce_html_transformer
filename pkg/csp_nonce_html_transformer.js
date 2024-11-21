const cachedTextDecoder = typeof TextDecoder !== "undefined"
  ? new TextDecoder("utf-8", { ignoreBOM: true, fatal: true })
  : {
    decode: () => {
      throw Error("TextDecoder not available");
    },
  };

if (typeof TextDecoder !== "undefined") cachedTextDecoder.decode();

let cachedUint8ArrayMemory0 = null;

function getUint8ArrayMemory0() {
  if (
    cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0
  ) {
    cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
  }
  return cachedUint8ArrayMemory0;
}

function getStringFromWasm0(ptr, len) {
  ptr = ptr >>> 0;
  return cachedTextDecoder.decode(
    getUint8ArrayMemory0().subarray(ptr, ptr + len),
  );
}

function debugString(val) {
  // primitive types
  const type = typeof val;
  if (type == "number" || type == "boolean" || val == null) {
    return `${val}`;
  }
  if (type == "string") {
    return `"${val}"`;
  }
  if (type == "symbol") {
    const description = val.description;
    if (description == null) {
      return "Symbol";
    } else {
      return `Symbol(${description})`;
    }
  }
  if (type == "function") {
    const name = val.name;
    if (typeof name == "string" && name.length > 0) {
      return `Function(${name})`;
    } else {
      return "Function";
    }
  }
  // objects
  if (Array.isArray(val)) {
    const length = val.length;
    let debug = "[";
    if (length > 0) {
      debug += debugString(val[0]);
    }
    for (let i = 1; i < length; i++) {
      debug += ", " + debugString(val[i]);
    }
    debug += "]";
    return debug;
  }
  // Test for built-in
  const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
  let className;
  if (builtInMatches.length > 1) {
    className = builtInMatches[1];
  } else {
    // Failed to match the standard '[object ClassName]'
    return toString.call(val);
  }
  if (className == "Object") {
    // we're a user defined class or Object
    // JSON.stringify avoids problems with cycles, and is generally much
    // easier than looping through ownProperties of `val`.
    try {
      return "Object(" + JSON.stringify(val) + ")";
    } catch (_) {
      return "Object";
    }
  }
  // errors
  if (val instanceof Error) {
    return `${val.name}: ${val.message}\n${val.stack}`;
  }
  // TODO we could test for more things here, like `Set`s and `Map`s.
  return className;
}

let WASM_VECTOR_LEN = 0;

const cachedTextEncoder = typeof TextEncoder !== "undefined"
  ? new TextEncoder("utf-8")
  : {
    encode: () => {
      throw Error("TextEncoder not available");
    },
  };

const encodeString = function (arg, view) {
  return cachedTextEncoder.encodeInto(arg, view);
};

function passStringToWasm0(arg, malloc, realloc) {
  if (typeof arg !== "string") {
    throw new Error(`expected a string argument, found ${typeof arg}`);
  }

  if (realloc === undefined) {
    const buf = cachedTextEncoder.encode(arg);
    const ptr = malloc(buf.length, 1) >>> 0;
    getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
    WASM_VECTOR_LEN = buf.length;
    return ptr;
  }

  let len = arg.length;
  let ptr = malloc(len, 1) >>> 0;

  const mem = getUint8ArrayMemory0();

  let offset = 0;

  for (; offset < len; offset++) {
    const code = arg.charCodeAt(offset);
    if (code > 0x7F) break;
    mem[ptr + offset] = code;
  }

  if (offset !== len) {
    if (offset !== 0) {
      arg = arg.slice(offset);
    }
    ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
    const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
    const ret = encodeString(arg, view);
    if (ret.read !== arg.length) throw new Error("failed to pass whole string");
    offset += ret.written;
    ptr = realloc(ptr, len, offset, 1) >>> 0;
  }

  WASM_VECTOR_LEN = offset;
  return ptr;
}

let cachedDataViewMemory0 = null;

function getDataViewMemory0() {
  if (
    cachedDataViewMemory0 === null ||
    cachedDataViewMemory0.buffer.detached === true ||
    (cachedDataViewMemory0.buffer.detached === undefined &&
      cachedDataViewMemory0.buffer !== wasm.memory.buffer)
  ) {
    cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
  }
  return cachedDataViewMemory0;
}

function isLikeNone(x) {
  return x === undefined || x === null;
}

function _assertBoolean(n) {
  if (typeof n !== "boolean") {
    throw new Error(`expected a boolean argument, found ${typeof n}`);
  }
}

function logError(f, args) {
  try {
    return f.apply(this, args);
  } catch (e) {
    let error = function () {
      try {
        return e instanceof Error
          ? `${e.message}\n\nStack:\n${e.stack}`
          : e.toString();
      } catch (_) {
        return "<failed to stringify thrown value>";
      }
    }();
    console.error(
      "wasm-bindgen: imported JS function that was not marked as `catch` threw an error:",
      error,
    );
    throw e;
  }
}

function addToExternrefTable0(obj) {
  const idx = wasm.__externref_table_alloc();
  wasm.__wbindgen_export_2.set(idx, obj);
  return idx;
}

function _assertNum(n) {
  if (typeof n !== "number") {
    throw new Error(`expected a number argument, found ${typeof n}`);
  }
}

function takeFromExternrefTable0(idx) {
  const value = wasm.__wbindgen_export_2.get(idx);
  wasm.__externref_table_dealloc(idx);
  return value;
}

function passArray8ToWasm0(arg, malloc) {
  const ptr = malloc(arg.length * 1, 1) >>> 0;
  getUint8ArrayMemory0().set(arg, ptr / 1);
  WASM_VECTOR_LEN = arg.length;
  return ptr;
}

function handleError(f, args) {
  try {
    return f.apply(this, args);
  } catch (e) {
    const idx = addToExternrefTable0(e);
    wasm.__wbindgen_exn_store(idx);
  }
}

const CommentFinalization = (typeof FinalizationRegistry === "undefined")
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry((ptr) => wasm.__wbg_comment_free(ptr >>> 0, 1));

export class Comment {
  constructor() {
    throw new Error("cannot invoke `new` directly");
  }

  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(Comment.prototype);
    obj.__wbg_ptr = ptr;
    CommentFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    CommentFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_comment_free(ptr, 0);
  }
  /**
   * @param {string} content
   * @param {any | undefined} [content_type]
   */
  before(content, content_type) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ptr0 = passStringToWasm0(
      content,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.comment_before(
      this.__wbg_ptr,
      ptr0,
      len0,
      isLikeNone(content_type) ? 0 : addToExternrefTable0(content_type),
    );
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0]);
    }
  }
  /**
   * @param {string} content
   * @param {any | undefined} [content_type]
   */
  after(content, content_type) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ptr0 = passStringToWasm0(
      content,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.comment_after(
      this.__wbg_ptr,
      ptr0,
      len0,
      isLikeNone(content_type) ? 0 : addToExternrefTable0(content_type),
    );
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0]);
    }
  }
  /**
   * @param {string} content
   * @param {any | undefined} [content_type]
   */
  replace(content, content_type) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ptr0 = passStringToWasm0(
      content,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.comment_replace(
      this.__wbg_ptr,
      ptr0,
      len0,
      isLikeNone(content_type) ? 0 : addToExternrefTable0(content_type),
    );
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0]);
    }
  }
  remove() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.comment_remove(this.__wbg_ptr);
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0]);
    }
  }
  /**
   * @returns {boolean}
   */
  get removed() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.comment_removed(this.__wbg_ptr);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0] !== 0;
  }
  /**
   * @returns {string}
   */
  get text() {
    let deferred2_0;
    let deferred2_1;
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      _assertNum(this.__wbg_ptr);
      const ret = wasm.comment_text(this.__wbg_ptr);
      var ptr1 = ret[0];
      var len1 = ret[1];
      if (ret[3]) {
        ptr1 = 0;
        len1 = 0;
        throw takeFromExternrefTable0(ret[2]);
      }
      deferred2_0 = ptr1;
      deferred2_1 = len1;
      return getStringFromWasm0(ptr1, len1);
    } finally {
      wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
  }
  /**
   * @param {string} text
   */
  set text(text) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ptr0 = passStringToWasm0(
      text,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.comment_set_text(this.__wbg_ptr, ptr0, len0);
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0]);
    }
  }
}

const DoctypeFinalization = (typeof FinalizationRegistry === "undefined")
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry((ptr) => wasm.__wbg_doctype_free(ptr >>> 0, 1));

export class Doctype {
  constructor() {
    throw new Error("cannot invoke `new` directly");
  }

  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(Doctype.prototype);
    obj.__wbg_ptr = ptr;
    DoctypeFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    DoctypeFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_doctype_free(ptr, 0);
  }
  /**
   * @returns {any}
   */
  get name() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.doctype_name(this.__wbg_ptr);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * @returns {any}
   */
  get publicId() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.doctype_public_id(this.__wbg_ptr);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * @returns {any}
   */
  get systemId() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.doctype_system_id(this.__wbg_ptr);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
}

const DocumentEndFinalization = (typeof FinalizationRegistry === "undefined")
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry((ptr) =>
    wasm.__wbg_documentend_free(ptr >>> 0, 1)
  );

export class DocumentEnd {
  constructor() {
    throw new Error("cannot invoke `new` directly");
  }

  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(DocumentEnd.prototype);
    obj.__wbg_ptr = ptr;
    DocumentEndFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    DocumentEndFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_documentend_free(ptr, 0);
  }
  /**
   * @param {string} content
   * @param {any | undefined} [content_type]
   */
  append(content, content_type) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ptr0 = passStringToWasm0(
      content,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.documentend_append(
      this.__wbg_ptr,
      ptr0,
      len0,
      isLikeNone(content_type) ? 0 : addToExternrefTable0(content_type),
    );
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0]);
    }
  }
}

const ElementFinalization = (typeof FinalizationRegistry === "undefined")
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry((ptr) => wasm.__wbg_element_free(ptr >>> 0, 1));

export class Element {
  constructor() {
    throw new Error("cannot invoke `new` directly");
  }

  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(Element.prototype);
    obj.__wbg_ptr = ptr;
    ElementFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    ElementFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_element_free(ptr, 0);
  }
  /**
   * @param {string} content
   * @param {any | undefined} [content_type]
   */
  before(content, content_type) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ptr0 = passStringToWasm0(
      content,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.element_before(
      this.__wbg_ptr,
      ptr0,
      len0,
      isLikeNone(content_type) ? 0 : addToExternrefTable0(content_type),
    );
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0]);
    }
  }
  /**
   * @param {string} content
   * @param {any | undefined} [content_type]
   */
  after(content, content_type) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ptr0 = passStringToWasm0(
      content,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.element_after(
      this.__wbg_ptr,
      ptr0,
      len0,
      isLikeNone(content_type) ? 0 : addToExternrefTable0(content_type),
    );
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0]);
    }
  }
  /**
   * @param {string} content
   * @param {any | undefined} [content_type]
   */
  replace(content, content_type) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ptr0 = passStringToWasm0(
      content,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.element_replace(
      this.__wbg_ptr,
      ptr0,
      len0,
      isLikeNone(content_type) ? 0 : addToExternrefTable0(content_type),
    );
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0]);
    }
  }
  remove() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.element_remove(this.__wbg_ptr);
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0]);
    }
  }
  /**
   * @returns {boolean}
   */
  get removed() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.element_removed(this.__wbg_ptr);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0] !== 0;
  }
  /**
   * @returns {string}
   */
  get tagName() {
    let deferred2_0;
    let deferred2_1;
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      _assertNum(this.__wbg_ptr);
      const ret = wasm.element_tag_name(this.__wbg_ptr);
      var ptr1 = ret[0];
      var len1 = ret[1];
      if (ret[3]) {
        ptr1 = 0;
        len1 = 0;
        throw takeFromExternrefTable0(ret[2]);
      }
      deferred2_0 = ptr1;
      deferred2_1 = len1;
      return getStringFromWasm0(ptr1, len1);
    } finally {
      wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
  }
  /**
   * @param {string} name
   */
  set tagName(name) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ptr0 = passStringToWasm0(
      name,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.element_set_tag_name(this.__wbg_ptr, ptr0, len0);
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0]);
    }
  }
  /**
   * @returns {any}
   */
  get namespaceURI() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.element_namespace_uri(this.__wbg_ptr);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * @returns {any}
   */
  get attributes() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.element_attributes(this.__wbg_ptr);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * @param {string} name
   * @returns {any}
   */
  getAttribute(name) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ptr0 = passStringToWasm0(
      name,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.element_getAttribute(this.__wbg_ptr, ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * @param {string} name
   * @returns {boolean}
   */
  hasAttribute(name) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ptr0 = passStringToWasm0(
      name,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.element_hasAttribute(this.__wbg_ptr, ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0] !== 0;
  }
  /**
   * @param {string} name
   * @param {string} value
   */
  setAttribute(name, value) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ptr0 = passStringToWasm0(
      name,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(
      value,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.element_setAttribute(
      this.__wbg_ptr,
      ptr0,
      len0,
      ptr1,
      len1,
    );
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0]);
    }
  }
  /**
   * @param {string} name
   */
  removeAttribute(name) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ptr0 = passStringToWasm0(
      name,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.element_removeAttribute(this.__wbg_ptr, ptr0, len0);
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0]);
    }
  }
  /**
   * @param {string} content
   * @param {any | undefined} [content_type]
   */
  prepend(content, content_type) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ptr0 = passStringToWasm0(
      content,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.element_prepend(
      this.__wbg_ptr,
      ptr0,
      len0,
      isLikeNone(content_type) ? 0 : addToExternrefTable0(content_type),
    );
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0]);
    }
  }
  /**
   * @param {string} content
   * @param {any | undefined} [content_type]
   */
  append(content, content_type) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ptr0 = passStringToWasm0(
      content,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.element_append(
      this.__wbg_ptr,
      ptr0,
      len0,
      isLikeNone(content_type) ? 0 : addToExternrefTable0(content_type),
    );
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0]);
    }
  }
  /**
   * @param {string} content
   * @param {any | undefined} [content_type]
   */
  setInnerContent(content, content_type) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ptr0 = passStringToWasm0(
      content,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.element_setInnerContent(
      this.__wbg_ptr,
      ptr0,
      len0,
      isLikeNone(content_type) ? 0 : addToExternrefTable0(content_type),
    );
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0]);
    }
  }
  removeAndKeepContent() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.element_removeAndKeepContent(this.__wbg_ptr);
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0]);
    }
  }
}

const EndTagFinalization = (typeof FinalizationRegistry === "undefined")
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry((ptr) => wasm.__wbg_endtag_free(ptr >>> 0, 1));

export class EndTag {
  constructor() {
    throw new Error("cannot invoke `new` directly");
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    EndTagFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_endtag_free(ptr, 0);
  }
  /**
   * @returns {string}
   */
  get name() {
    let deferred2_0;
    let deferred2_1;
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      _assertNum(this.__wbg_ptr);
      const ret = wasm.endtag_name(this.__wbg_ptr);
      var ptr1 = ret[0];
      var len1 = ret[1];
      if (ret[3]) {
        ptr1 = 0;
        len1 = 0;
        throw takeFromExternrefTable0(ret[2]);
      }
      deferred2_0 = ptr1;
      deferred2_1 = len1;
      return getStringFromWasm0(ptr1, len1);
    } finally {
      wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
  }
  /**
   * @param {string} name
   */
  set name(name) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ptr0 = passStringToWasm0(
      name,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.endtag_set_name(this.__wbg_ptr, ptr0, len0);
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0]);
    }
  }
  /**
   * @param {string} content
   * @param {any | undefined} [content_type]
   */
  before(content, content_type) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ptr0 = passStringToWasm0(
      content,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.endtag_before(
      this.__wbg_ptr,
      ptr0,
      len0,
      isLikeNone(content_type) ? 0 : addToExternrefTable0(content_type),
    );
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0]);
    }
  }
  /**
   * @param {string} content
   * @param {any | undefined} [content_type]
   */
  after(content, content_type) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ptr0 = passStringToWasm0(
      content,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.endtag_after(
      this.__wbg_ptr,
      ptr0,
      len0,
      isLikeNone(content_type) ? 0 : addToExternrefTable0(content_type),
    );
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0]);
    }
  }
  remove() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.endtag_remove(this.__wbg_ptr);
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0]);
    }
  }
}

const HTMLRewriterFinalization = (typeof FinalizationRegistry === "undefined")
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry((ptr) =>
    wasm.__wbg_htmlrewriter_free(ptr >>> 0, 1)
  );

export class HTMLRewriter {
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    HTMLRewriterFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_htmlrewriter_free(ptr, 0);
  }
  /**
   * @param {Function} output_sink
   * @param {any | undefined} [options]
   */
  constructor(output_sink, options) {
    const ret = wasm.htmlrewriter_new(
      output_sink,
      isLikeNone(options) ? 0 : addToExternrefTable0(options),
    );
    this.__wbg_ptr = ret >>> 0;
    HTMLRewriterFinalization.register(this, this.__wbg_ptr, this);
    return this;
  }
  /**
   * @param {string} selector
   * @param {any} handlers
   */
  on(selector, handlers) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ptr0 = passStringToWasm0(
      selector,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.htmlrewriter_on(this.__wbg_ptr, ptr0, len0, handlers);
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0]);
    }
  }
  /**
   * @param {any} handlers
   */
  onDocument(handlers) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.htmlrewriter_onDocument(this.__wbg_ptr, handlers);
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0]);
    }
  }
  /**
   * @param {Uint8Array} chunk
   */
  write(chunk) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ptr0 = passArray8ToWasm0(chunk, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.htmlrewriter_write(this.__wbg_ptr, ptr0, len0);
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0]);
    }
  }
  end() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.htmlrewriter_end(this.__wbg_ptr);
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0]);
    }
  }
}

const TextChunkFinalization = (typeof FinalizationRegistry === "undefined")
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry((ptr) => wasm.__wbg_textchunk_free(ptr >>> 0, 1));

export class TextChunk {
  constructor() {
    throw new Error("cannot invoke `new` directly");
  }

  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(TextChunk.prototype);
    obj.__wbg_ptr = ptr;
    TextChunkFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    TextChunkFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_textchunk_free(ptr, 0);
  }
  /**
   * @param {string} content
   * @param {any | undefined} [content_type]
   */
  before(content, content_type) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ptr0 = passStringToWasm0(
      content,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.textchunk_before(
      this.__wbg_ptr,
      ptr0,
      len0,
      isLikeNone(content_type) ? 0 : addToExternrefTable0(content_type),
    );
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0]);
    }
  }
  /**
   * @param {string} content
   * @param {any | undefined} [content_type]
   */
  after(content, content_type) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ptr0 = passStringToWasm0(
      content,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.textchunk_after(
      this.__wbg_ptr,
      ptr0,
      len0,
      isLikeNone(content_type) ? 0 : addToExternrefTable0(content_type),
    );
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0]);
    }
  }
  /**
   * @param {string} content
   * @param {any | undefined} [content_type]
   */
  replace(content, content_type) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ptr0 = passStringToWasm0(
      content,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.textchunk_replace(
      this.__wbg_ptr,
      ptr0,
      len0,
      isLikeNone(content_type) ? 0 : addToExternrefTable0(content_type),
    );
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0]);
    }
  }
  remove() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.textchunk_remove(this.__wbg_ptr);
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0]);
    }
  }
  /**
   * @returns {boolean}
   */
  get removed() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.textchunk_removed(this.__wbg_ptr);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0] !== 0;
  }
  /**
   * @returns {string}
   */
  get text() {
    let deferred2_0;
    let deferred2_1;
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      _assertNum(this.__wbg_ptr);
      const ret = wasm.textchunk_text(this.__wbg_ptr);
      var ptr1 = ret[0];
      var len1 = ret[1];
      if (ret[3]) {
        ptr1 = 0;
        len1 = 0;
        throw takeFromExternrefTable0(ret[2]);
      }
      deferred2_0 = ptr1;
      deferred2_1 = len1;
      return getStringFromWasm0(ptr1, len1);
    } finally {
      wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
  }
  /**
   * @returns {boolean}
   */
  get lastInTextNode() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.textchunk_last_in_text_node(this.__wbg_ptr);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0] !== 0;
  }
}

const imports = {
  __wbindgen_placeholder__: {
    __wbg_enableEsiTags_f773d89434472a3e: function () {
      return logError(function (arg0) {
        const ret = arg0.enableEsiTags;
        if (!isLikeNone(ret)) {
          _assertBoolean(ret);
        }
        return isLikeNone(ret) ? 0xFFFFFF : ret ? 1 : 0;
      }, arguments);
    },
    __wbg_html_21c4d3ca6b14b151: function () {
      return logError(function (arg0) {
        const ret = arg0.html;
        if (!isLikeNone(ret)) {
          _assertBoolean(ret);
        }
        return isLikeNone(ret) ? 0xFFFFFF : ret ? 1 : 0;
      }, arguments);
    },
    __wbindgen_string_new: function (arg0, arg1) {
      const ret = getStringFromWasm0(arg0, arg1);
      return ret;
    },
    __wbg_comment_new: function () {
      return logError(function (arg0) {
        const ret = Comment.__wrap(arg0);
        return ret;
      }, arguments);
    },
    __wbg_doctype_new: function () {
      return logError(function (arg0) {
        const ret = Doctype.__wrap(arg0);
        return ret;
      }, arguments);
    },
    __wbg_documentend_new: function () {
      return logError(function (arg0) {
        const ret = DocumentEnd.__wrap(arg0);
        return ret;
      }, arguments);
    },
    __wbg_element_new: function () {
      return logError(function (arg0) {
        const ret = Element.__wrap(arg0);
        return ret;
      }, arguments);
    },
    __wbg_textchunk_new: function () {
      return logError(function (arg0) {
        const ret = TextChunk.__wrap(arg0);
        return ret;
      }, arguments);
    },
    __wbg_element_9f7a29ae173a1783: function () {
      return logError(function (arg0) {
        const ret = arg0.element;
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
      }, arguments);
    },
    __wbg_comments_d0f2588cfd8fb2ae: function () {
      return logError(function (arg0) {
        const ret = arg0.comments;
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
      }, arguments);
    },
    __wbg_text_4f51c2aff0e8dfa7: function () {
      return logError(function (arg0) {
        const ret = arg0.text;
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
      }, arguments);
    },
    __wbg_doctype_51e5196c1e758077: function () {
      return logError(function (arg0) {
        const ret = arg0.doctype;
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
      }, arguments);
    },
    __wbg_comments_78fee064e6b4bdd7: function () {
      return logError(function (arg0) {
        const ret = arg0.comments;
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
      }, arguments);
    },
    __wbg_text_b65dd2bb2bc16a12: function () {
      return logError(function (arg0) {
        const ret = arg0.text;
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
      }, arguments);
    },
    __wbg_end_c6c7e99b41918cc0: function () {
      return logError(function (arg0) {
        const ret = arg0.end;
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
      }, arguments);
    },
    __wbg_String_b9412f8799faab3e: function () {
      return logError(function (arg0, arg1) {
        const ret = String(arg1);
        const ptr1 = passStringToWasm0(
          ret,
          wasm.__wbindgen_malloc,
          wasm.__wbindgen_realloc,
        );
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
      }, arguments);
    },
    __wbg_new_034f913e7636e987: function () {
      return logError(function () {
        const ret = new Array();
        return ret;
      }, arguments);
    },
    __wbg_set_425e70f7c64ac962: function () {
      return logError(function (arg0, arg1, arg2) {
        arg0[arg1 >>> 0] = arg2;
      }, arguments);
    },
    __wbg_call_3bfa248576352471: function () {
      return handleError(function (arg0, arg1, arg2) {
        const ret = arg0.call(arg1, arg2);
        return ret;
      }, arguments);
    },
    __wbg_new_9a7e38dd635a4e93: function () {
      return logError(function (arg0, arg1) {
        const ret = new TypeError(getStringFromWasm0(arg0, arg1));
        return ret;
      }, arguments);
    },
    __wbg_new_fec2611eb9180f95: function () {
      return logError(function (arg0) {
        const ret = new Uint8Array(arg0);
        return ret;
      }, arguments);
    },
    __wbg_newwithbyteoffsetandlength_7e3eb787208af730: function () {
      return logError(function (arg0, arg1, arg2) {
        const ret = new Uint8Array(arg0, arg1 >>> 0, arg2 >>> 0);
        return ret;
      }, arguments);
    },
    __wbg_buffer_ccaed51a635d8a2d: function () {
      return logError(function (arg0) {
        const ret = arg0.buffer;
        return ret;
      }, arguments);
    },
    __wbindgen_debug_string: function (arg0, arg1) {
      const ret = debugString(arg1);
      const ptr1 = passStringToWasm0(
        ret,
        wasm.__wbindgen_malloc,
        wasm.__wbindgen_realloc,
      );
      const len1 = WASM_VECTOR_LEN;
      getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
      getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    },
    __wbindgen_throw: function (arg0, arg1) {
      throw new Error(getStringFromWasm0(arg0, arg1));
    },
    __wbindgen_memory: function () {
      const ret = wasm.memory;
      return ret;
    },
    __wbindgen_init_externref_table: function () {
      const table = wasm.__wbindgen_export_2;
      const offset = table.grow(4);
      table.set(0, undefined);
      table.set(offset + 0, undefined);
      table.set(offset + 1, null);
      table.set(offset + 2, true);
      table.set(offset + 3, false);
    },
  },
};

const wasm_url = new URL("csp_nonce_html_transformer_bg.wasm", import.meta.url);
let wasmCode = "";
switch (wasm_url.protocol) {
  case "file:":
    wasmCode = await Deno.readFile(wasm_url);
    break;
  case "https:":
  case "http:":
    wasmCode = await (await fetch(wasm_url)).arrayBuffer();
    break;
  default:
    throw new Error(`Unsupported protocol: ${wasm_url.protocol}`);
}

const wasmInstance =
  (await WebAssembly.instantiate(wasmCode, imports)).instance;
const wasm = wasmInstance.exports;
export const __wasm = wasm;

wasm.__wbindgen_start();
