function noop() {
}
const identity = (x) => x;
function run(fn) {
  return fn();
}
function blank_object() {
  return Object.create(null);
}
function run_all(fns) {
  fns.forEach(run);
}
function is_function(thing) {
  return typeof thing === "function";
}
function safe_not_equal(a, b) {
  return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
}
let src_url_equal_anchor;
function src_url_equal(element_src, url) {
  if (!src_url_equal_anchor) {
    src_url_equal_anchor = document.createElement("a");
  }
  src_url_equal_anchor.href = url;
  return element_src === src_url_equal_anchor.href;
}
function is_empty(obj) {
  return Object.keys(obj).length === 0;
}
function action_destroyer(action_result) {
  return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
}
const is_client = typeof window !== "undefined";
let now = is_client ? () => window.performance.now() : () => Date.now();
let raf = is_client ? (cb) => requestAnimationFrame(cb) : noop;
const tasks = new Set();
function run_tasks(now2) {
  tasks.forEach((task) => {
    if (!task.c(now2)) {
      tasks.delete(task);
      task.f();
    }
  });
  if (tasks.size !== 0)
    raf(run_tasks);
}
function loop(callback) {
  let task;
  if (tasks.size === 0)
    raf(run_tasks);
  return {
    promise: new Promise((fulfill) => {
      tasks.add(task = { c: callback, f: fulfill });
    }),
    abort() {
      tasks.delete(task);
    }
  };
}
function append(target, node) {
  target.appendChild(node);
}
function get_root_for_style(node) {
  if (!node)
    return document;
  const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
  if (root && root.host) {
    return root;
  }
  return node.ownerDocument;
}
function append_empty_stylesheet(node) {
  const style_element = element("style");
  append_stylesheet(get_root_for_style(node), style_element);
  return style_element;
}
function append_stylesheet(node, style2) {
  append(node.head || node, style2);
}
function insert(target, node, anchor) {
  target.insertBefore(node, anchor || null);
}
function detach(node) {
  node.parentNode.removeChild(node);
}
function destroy_each(iterations, detaching) {
  for (let i = 0; i < iterations.length; i += 1) {
    if (iterations[i])
      iterations[i].d(detaching);
  }
}
function element(name) {
  return document.createElement(name);
}
function text(data) {
  return document.createTextNode(data);
}
function space() {
  return text(" ");
}
function empty() {
  return text("");
}
function listen(node, event, handler, options) {
  node.addEventListener(event, handler, options);
  return () => node.removeEventListener(event, handler, options);
}
function attr(node, attribute, value) {
  if (value == null)
    node.removeAttribute(attribute);
  else if (node.getAttribute(attribute) !== value)
    node.setAttribute(attribute, value);
}
function children(element2) {
  return Array.from(element2.childNodes);
}
function set_data(text2, data) {
  data = "" + data;
  if (text2.wholeText !== data)
    text2.data = data;
}
function set_style(node, key, value, important) {
  node.style.setProperty(key, value, important ? "important" : "");
}
function toggle_class(element2, name, toggle) {
  element2.classList[toggle ? "add" : "remove"](name);
}
function custom_event(type, detail, bubbles = false) {
  const e = document.createEvent("CustomEvent");
  e.initCustomEvent(type, bubbles, false, detail);
  return e;
}
function attribute_to_object(attributes) {
  const result = {};
  for (const attribute of attributes) {
    result[attribute.name] = attribute.value;
  }
  return result;
}
const active_docs = new Set();
let active = 0;
function hash(str) {
  let hash2 = 5381;
  let i = str.length;
  while (i--)
    hash2 = (hash2 << 5) - hash2 ^ str.charCodeAt(i);
  return hash2 >>> 0;
}
function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
  const step = 16.666 / duration;
  let keyframes = "{\n";
  for (let p = 0; p <= 1; p += step) {
    const t = a + (b - a) * ease(p);
    keyframes += p * 100 + `%{${fn(t, 1 - t)}}
`;
  }
  const rule = keyframes + `100% {${fn(b, 1 - b)}}
}`;
  const name = `__svelte_${hash(rule)}_${uid}`;
  const doc = get_root_for_style(node);
  active_docs.add(doc);
  const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = append_empty_stylesheet(node).sheet);
  const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
  if (!current_rules[name]) {
    current_rules[name] = true;
    stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
  }
  const animation = node.style.animation || "";
  node.style.animation = `${animation ? `${animation}, ` : ""}${name} ${duration}ms linear ${delay}ms 1 both`;
  active += 1;
  return name;
}
function delete_rule(node, name) {
  const previous = (node.style.animation || "").split(", ");
  const next = previous.filter(name ? (anim) => anim.indexOf(name) < 0 : (anim) => anim.indexOf("__svelte") === -1);
  const deleted = previous.length - next.length;
  if (deleted) {
    node.style.animation = next.join(", ");
    active -= deleted;
    if (!active)
      clear_rules();
  }
}
function clear_rules() {
  raf(() => {
    if (active)
      return;
    active_docs.forEach((doc) => {
      const stylesheet = doc.__svelte_stylesheet;
      let i = stylesheet.cssRules.length;
      while (i--)
        stylesheet.deleteRule(i);
      doc.__svelte_rules = {};
    });
    active_docs.clear();
  });
}
let current_component;
function set_current_component(component) {
  current_component = component;
}
const dirty_components = [];
const binding_callbacks = [];
const render_callbacks = [];
const flush_callbacks = [];
const resolved_promise = Promise.resolve();
let update_scheduled = false;
function schedule_update() {
  if (!update_scheduled) {
    update_scheduled = true;
    resolved_promise.then(flush);
  }
}
function tick() {
  schedule_update();
  return resolved_promise;
}
function add_render_callback(fn) {
  render_callbacks.push(fn);
}
let flushing = false;
const seen_callbacks = new Set();
function flush() {
  if (flushing)
    return;
  flushing = true;
  do {
    for (let i = 0; i < dirty_components.length; i += 1) {
      const component = dirty_components[i];
      set_current_component(component);
      update(component.$$);
    }
    set_current_component(null);
    dirty_components.length = 0;
    while (binding_callbacks.length)
      binding_callbacks.pop()();
    for (let i = 0; i < render_callbacks.length; i += 1) {
      const callback = render_callbacks[i];
      if (!seen_callbacks.has(callback)) {
        seen_callbacks.add(callback);
        callback();
      }
    }
    render_callbacks.length = 0;
  } while (dirty_components.length);
  while (flush_callbacks.length) {
    flush_callbacks.pop()();
  }
  update_scheduled = false;
  flushing = false;
  seen_callbacks.clear();
}
function update($$) {
  if ($$.fragment !== null) {
    $$.update();
    run_all($$.before_update);
    const dirty = $$.dirty;
    $$.dirty = [-1];
    $$.fragment && $$.fragment.p($$.ctx, dirty);
    $$.after_update.forEach(add_render_callback);
  }
}
let promise;
function wait() {
  if (!promise) {
    promise = Promise.resolve();
    promise.then(() => {
      promise = null;
    });
  }
  return promise;
}
function dispatch(node, direction, kind) {
  node.dispatchEvent(custom_event(`${direction ? "intro" : "outro"}${kind}`));
}
const outroing = new Set();
let outros;
function group_outros() {
  outros = {
    r: 0,
    c: [],
    p: outros
  };
}
function check_outros() {
  if (!outros.r) {
    run_all(outros.c);
  }
  outros = outros.p;
}
function transition_in(block, local) {
  if (block && block.i) {
    outroing.delete(block);
    block.i(local);
  }
}
function transition_out(block, local, detach2, callback) {
  if (block && block.o) {
    if (outroing.has(block))
      return;
    outroing.add(block);
    outros.c.push(() => {
      outroing.delete(block);
      if (callback) {
        if (detach2)
          block.d(1);
        callback();
      }
    });
    block.o(local);
  }
}
const null_transition = { duration: 0 };
function create_in_transition(node, fn, params) {
  let config = fn(node, params);
  let running = false;
  let animation_name;
  let task;
  let uid = 0;
  function cleanup() {
    if (animation_name)
      delete_rule(node, animation_name);
  }
  function go() {
    const { delay = 0, duration = 300, easing = identity, tick: tick2 = noop, css } = config || null_transition;
    if (css)
      animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
    tick2(0, 1);
    const start_time = now() + delay;
    const end_time = start_time + duration;
    if (task)
      task.abort();
    running = true;
    add_render_callback(() => dispatch(node, true, "start"));
    task = loop((now2) => {
      if (running) {
        if (now2 >= end_time) {
          tick2(1, 0);
          dispatch(node, true, "end");
          cleanup();
          return running = false;
        }
        if (now2 >= start_time) {
          const t = easing((now2 - start_time) / duration);
          tick2(t, 1 - t);
        }
      }
      return running;
    });
  }
  let started = false;
  return {
    start() {
      if (started)
        return;
      started = true;
      delete_rule(node);
      if (is_function(config)) {
        config = config();
        wait().then(go);
      } else {
        go();
      }
    },
    invalidate() {
      started = false;
    },
    end() {
      if (running) {
        cleanup();
        running = false;
      }
    }
  };
}
function create_out_transition(node, fn, params) {
  let config = fn(node, params);
  let running = true;
  let animation_name;
  const group = outros;
  group.r += 1;
  function go() {
    const { delay = 0, duration = 300, easing = identity, tick: tick2 = noop, css } = config || null_transition;
    if (css)
      animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
    const start_time = now() + delay;
    const end_time = start_time + duration;
    add_render_callback(() => dispatch(node, false, "start"));
    loop((now2) => {
      if (running) {
        if (now2 >= end_time) {
          tick2(0, 1);
          dispatch(node, false, "end");
          if (!--group.r) {
            run_all(group.c);
          }
          return false;
        }
        if (now2 >= start_time) {
          const t = easing((now2 - start_time) / duration);
          tick2(1 - t, t);
        }
      }
      return running;
    });
  }
  if (is_function(config)) {
    wait().then(() => {
      config = config();
      go();
    });
  } else {
    go();
  }
  return {
    end(reset) {
      if (reset && config.tick) {
        config.tick(1, 0);
      }
      if (running) {
        if (animation_name)
          delete_rule(node, animation_name);
        running = false;
      }
    }
  };
}
function mount_component(component, target, anchor, customElement) {
  const { fragment, on_mount, on_destroy, after_update } = component.$$;
  fragment && fragment.m(target, anchor);
  if (!customElement) {
    add_render_callback(() => {
      const new_on_destroy = on_mount.map(run).filter(is_function);
      if (on_destroy) {
        on_destroy.push(...new_on_destroy);
      } else {
        run_all(new_on_destroy);
      }
      component.$$.on_mount = [];
    });
  }
  after_update.forEach(add_render_callback);
}
function destroy_component(component, detaching) {
  const $$ = component.$$;
  if ($$.fragment !== null) {
    run_all($$.on_destroy);
    $$.fragment && $$.fragment.d(detaching);
    $$.on_destroy = $$.fragment = null;
    $$.ctx = [];
  }
}
function make_dirty(component, i) {
  if (component.$$.dirty[0] === -1) {
    dirty_components.push(component);
    schedule_update();
    component.$$.dirty.fill(0);
  }
  component.$$.dirty[i / 31 | 0] |= 1 << i % 31;
}
function init(component, options, instance2, create_fragment2, not_equal, props, append_styles, dirty = [-1]) {
  const parent_component = current_component;
  set_current_component(component);
  const $$ = component.$$ = {
    fragment: null,
    ctx: null,
    props,
    update: noop,
    not_equal,
    bound: blank_object(),
    on_mount: [],
    on_destroy: [],
    on_disconnect: [],
    before_update: [],
    after_update: [],
    context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
    callbacks: blank_object(),
    dirty,
    skip_bound: false,
    root: options.target || parent_component.$$.root
  };
  append_styles && append_styles($$.root);
  let ready = false;
  $$.ctx = instance2 ? instance2(component, options.props || {}, (i, ret, ...rest) => {
    const value = rest.length ? rest[0] : ret;
    if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
      if (!$$.skip_bound && $$.bound[i])
        $$.bound[i](value);
      if (ready)
        make_dirty(component, i);
    }
    return ret;
  }) : [];
  $$.update();
  ready = true;
  run_all($$.before_update);
  $$.fragment = create_fragment2 ? create_fragment2($$.ctx) : false;
  if (options.target) {
    if (options.hydrate) {
      const nodes = children(options.target);
      $$.fragment && $$.fragment.l(nodes);
      nodes.forEach(detach);
    } else {
      $$.fragment && $$.fragment.c();
    }
    if (options.intro)
      transition_in(component.$$.fragment);
    mount_component(component, options.target, options.anchor, options.customElement);
    flush();
  }
  set_current_component(parent_component);
}
let SvelteElement;
if (typeof HTMLElement === "function") {
  SvelteElement = class extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
    }
    connectedCallback() {
      const { on_mount } = this.$$;
      this.$$.on_disconnect = on_mount.map(run).filter(is_function);
      for (const key in this.$$.slotted) {
        this.appendChild(this.$$.slotted[key]);
      }
    }
    attributeChangedCallback(attr2, _oldValue, newValue) {
      this[attr2] = newValue;
    }
    disconnectedCallback() {
      run_all(this.$$.on_disconnect);
    }
    $destroy() {
      destroy_component(this, 1);
      this.$destroy = noop;
    }
    $on(type, callback) {
      const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
      callbacks.push(callback);
      return () => {
        const index = callbacks.indexOf(callback);
        if (index !== -1)
          callbacks.splice(index, 1);
      };
    }
    $set($$props) {
      if (this.$$set && !is_empty($$props)) {
        this.$$.skip_bound = true;
        this.$$set($$props);
        this.$$.skip_bound = false;
      }
    }
  };
}
function create_fragment$2(ctx) {
  let article;
  let div;
  let strong;
  let t0;
  let t1;
  let slot;
  return {
    c() {
      article = element("article");
      div = element("div");
      strong = element("strong");
      t0 = text(ctx[0]);
      t1 = space();
      slot = element("slot");
      this.c = noop;
      attr(div, "class", "wrapper");
      set_style(article, "width", ctx[3] + "px");
      set_style(article, "max-width", ctx[2] + "px");
      set_style(article, "min-width", ctx[1] + "px");
    },
    m(target, anchor) {
      insert(target, article, anchor);
      append(article, div);
      append(div, strong);
      append(strong, t0);
      append(div, t1);
      append(div, slot);
    },
    p(ctx2, [dirty]) {
      if (dirty & 1)
        set_data(t0, ctx2[0]);
      if (dirty & 8) {
        set_style(article, "width", ctx2[3] + "px");
      }
      if (dirty & 4) {
        set_style(article, "max-width", ctx2[2] + "px");
      }
      if (dirty & 2) {
        set_style(article, "min-width", ctx2[1] + "px");
      }
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching)
        detach(article);
    }
  };
}
function instance$2($$self, $$props, $$invalidate) {
  let { label = "" } = $$props;
  let { minWidth = 400 } = $$props;
  let { maxWidth = 400 } = $$props;
  let { width: width2 = 200 } = $$props;
  $$self.$$set = ($$props2) => {
    if ("label" in $$props2)
      $$invalidate(0, label = $$props2.label);
    if ("minWidth" in $$props2)
      $$invalidate(1, minWidth = $$props2.minWidth);
    if ("maxWidth" in $$props2)
      $$invalidate(2, maxWidth = $$props2.maxWidth);
    if ("width" in $$props2)
      $$invalidate(3, width2 = $$props2.width);
  };
  return [label, minWidth, maxWidth, width2];
}
class NovelTrivia extends SvelteElement {
  constructor(options) {
    super();
    this.shadowRoot.innerHTML = `<style>article{--primary-color-h:16;--primary-color-s:100%;--primary-color-l:42%;--label-font-family:Georgia, "Times New Roman", Times, serif;--body-font-family:Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", Oxygen, Ubuntu,
    Cantarell, "Open Sans", "Helvetica Neue", sans-serif;--primary-color:hsl(var(--primary-color-h), var(--primary-color-l), var(--primary-color-l));--background-color:#fff;--right:calc(100px + 2vw);--transform:0px;--border:2px;float:right;margin:12px;margin-right:calc(var(--right) * -1);transform:translate3d(0, 0, 0);background-color:var(--background-color);color:var(--text-body-color);border-radius:4px 0 0 4px;padding:8px 16px;font-weight:300;border:var(--border) solid #3334;transition:transform 0.325s ease-out}article:hover{border-color:hsla(var(--primary-color-h), var(--primary-color-s), var(--primary-color-l), 0.66);transform:translate3d(calc((var(--right) + var(--transform) - var(--border)) * -1), 0, 0)}article:hover *{opacity:1}article .wrapper{opacity:0.48;font-family:var(--body-font-family)}article .wrapper strong{font-family:var(--label-font-family);text-decoration:underline;font-size:1.4em;display:block;padding-top:12px;color:var(--primary-color)}</style>`;
    init(this, {
      target: this.shadowRoot,
      props: attribute_to_object(this.attributes),
      customElement: true
    }, instance$2, create_fragment$2, safe_not_equal, {
      label: 0,
      minWidth: 1,
      maxWidth: 2,
      width: 3
    }, null);
    if (options) {
      if (options.target) {
        insert(options.target, this, options.anchor);
      }
      if (options.props) {
        this.$set(options.props);
        flush();
      }
    }
  }
  static get observedAttributes() {
    return ["label", "minWidth", "maxWidth", "width"];
  }
  get label() {
    return this.$$.ctx[0];
  }
  set label(label) {
    this.$$set({ label });
    flush();
  }
  get minWidth() {
    return this.$$.ctx[1];
  }
  set minWidth(minWidth) {
    this.$$set({ minWidth });
    flush();
  }
  get maxWidth() {
    return this.$$.ctx[2];
  }
  set maxWidth(maxWidth) {
    this.$$set({ maxWidth });
    flush();
  }
  get width() {
    return this.$$.ctx[3];
  }
  set width(width2) {
    this.$$set({ width: width2 });
    flush();
  }
}
customElements.define("novel-trivia", NovelTrivia);
function create_fragment$1(ctx) {
  let article;
  let t0;
  let br;
  let t1;
  let strong;
  let t2;
  let t3;
  let span;
  let t5;
  let slot;
  return {
    c() {
      article = element("article");
      t0 = text("\u{1FAB6}");
      br = element("br");
      t1 = space();
      strong = element("strong");
      t2 = text(ctx[0]);
      t3 = space();
      span = element("span");
      span.textContent = "says";
      t5 = space();
      slot = element("slot");
      this.c = noop;
    },
    m(target, anchor) {
      insert(target, article, anchor);
      append(article, t0);
      append(article, br);
      append(article, t1);
      append(article, strong);
      append(strong, t2);
      append(strong, t3);
      append(strong, span);
      append(article, t5);
      append(article, slot);
    },
    p(ctx2, [dirty]) {
      if (dirty & 1)
        set_data(t2, ctx2[0]);
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching)
        detach(article);
    }
  };
}
function instance$1($$self, $$props, $$invalidate) {
  let { name = "Someone" } = $$props;
  $$self.$$set = ($$props2) => {
    if ("name" in $$props2)
      $$invalidate(0, name = $$props2.name);
  };
  return [name];
}
class AuthorsNote extends SvelteElement {
  constructor(options) {
    super();
    this.shadowRoot.innerHTML = `<style>article{box-shadow:0 2px 8px #0004, 0 4px 16px #0001;padding:1em 0.7em;border-radius:4px;margin-top:1em;margin-right:-2em;margin-left:-2em;margin-bottom:1em}article strong{display:block;font-size:1.3em;margin-top:0.5em;margin-bottom:0.3em}article strong span{font-weight:400}</style>`;
    init(this, {
      target: this.shadowRoot,
      props: attribute_to_object(this.attributes),
      customElement: true
    }, instance$1, create_fragment$1, safe_not_equal, { name: 0 }, null);
    if (options) {
      if (options.target) {
        insert(options.target, this, options.anchor);
      }
      if (options.props) {
        this.$set(options.props);
        flush();
      }
    }
  }
  static get observedAttributes() {
    return ["name"];
  }
  get name() {
    return this.$$.ctx[0];
  }
  set name(name) {
    this.$$set({ name });
    flush();
  }
}
customElements.define("authors-note", AuthorsNote);
function generateAffiliateLink(address) {
  const thisPage = new URL(window.location.href);
  thisPage.search = "";
  thisPage.searchParams.set("affiliate", encodeURI(address));
  return thisPage.href;
}
let bodyStyle = {
  top: "",
  position: "",
  height: "",
  minWidth: ""
};
function windowLock(node) {
  const { top: top2, position, height, minWidth } = document.body.style;
  bodyStyle = {
    top: top2,
    position,
    height,
    minWidth
  };
  document.body.style.top = `-${window.scrollY}px`;
  document.body.style.position = "fixed";
  document.body.style.height = "100vh";
  document.body.style.minWidth = "100%";
  if (node)
    node.focus();
}
function windowUnlock() {
  const scrollY = document.body.style.top;
  document.body.style.position = bodyStyle.position;
  document.body.style.top = bodyStyle.top;
  document.body.style.height = bodyStyle.height;
  document.body.style.minWidth = bodyStyle.minWidth;
  window.scrollTo(0, parseInt(scrollY || "0") * -1);
}
function cubicIn(t) {
  return t * t * t;
}
function cubicOut(t) {
  const f = t - 1;
  return f * f * f + 1;
}
function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
  const o = +getComputedStyle(node).opacity;
  return {
    delay,
    duration,
    easing,
    css: (t) => `opacity: ${t * o}`
  };
}
function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity: opacity2 = 0 } = {}) {
  const style2 = getComputedStyle(node);
  const target_opacity = +style2.opacity;
  const transform = style2.transform === "none" ? "" : style2.transform;
  const od = target_opacity * (1 - opacity2);
  return {
    delay,
    duration,
    easing,
    css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - od * u}`
  };
}
function scale(node, { delay = 0, duration = 400, easing = cubicOut, start = 0, opacity: opacity2 = 0 } = {}) {
  const style2 = getComputedStyle(node);
  const target_opacity = +style2.opacity;
  const transform = style2.transform === "none" ? "" : style2.transform;
  const sd = 1 - start;
  const od = target_opacity * (1 - opacity2);
  return {
    delay,
    duration,
    easing,
    css: (_t, u) => `
			transform: ${transform} scale(${1 - sd * u});
			opacity: ${target_opacity - od * u}
		`
  };
}
function get_each_context(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[22] = list[i];
  child_ctx[24] = i;
  return child_ctx;
}
function create_if_block(ctx) {
  let div0;
  let div0_intro;
  let div0_outro;
  let t0;
  let article;
  let div1;
  let t1;
  let div2;
  let input_1;
  let t2;
  let span;
  let t4;
  let div6;
  let div4;
  let t5;
  let div3;
  let t6;
  let div5;
  let current_block_type_index;
  let if_block1;
  let article_style_value;
  let article_intro;
  let article_outro;
  let current;
  let mounted;
  let dispose;
  function select_block_type(ctx2, dirty) {
    if (ctx2[7])
      return create_if_block_5;
    return create_else_block;
  }
  let current_block_type = select_block_type(ctx);
  let if_block0 = current_block_type(ctx);
  let each_value = Array(4).fill("");
  let each_blocks = [];
  for (let i = 0; i < each_value.length; i += 1) {
    each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
  }
  const if_block_creators = [create_if_block_1, create_if_block_2, create_if_block_3, create_if_block_4];
  const if_blocks = [];
  function select_block_type_1(ctx2, dirty) {
    if (ctx2[3] === 0)
      return 0;
    if (ctx2[3] === 1)
      return 1;
    if (ctx2[3] === 2)
      return 2;
    if (ctx2[3] === 3)
      return 3;
    return -1;
  }
  if (~(current_block_type_index = select_block_type_1(ctx))) {
    if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
  }
  return {
    c() {
      div0 = element("div");
      t0 = space();
      article = element("article");
      div1 = element("div");
      if_block0.c();
      t1 = space();
      div2 = element("div");
      input_1 = element("input");
      t2 = space();
      span = element("span");
      span.textContent = "\u{1F4CB}";
      t4 = space();
      div6 = element("div");
      div4 = element("div");
      t5 = text("\u{1F4A1} Tips\n        ");
      div3 = element("div");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      t6 = space();
      div5 = element("div");
      if (if_block1)
        if_block1.c();
      attr(div0, "class", "overlay");
      set_style(div0, "opacity", opacity);
      toggle_class(div1, "copied", ctx[7]);
      attr(input_1, "onfocus", "this.select();");
      attr(input_1, "type", "text");
      input_1.value = ctx[6];
      input_1.readOnly = true;
      attr(div2, "class", "affiliate-link");
      attr(div4, "class", "head");
      attr(div5, "class", "body");
      attr(div6, "class", "tips");
      attr(article, "class", "pg--modal");
      attr(article, "style", article_style_value = "padding: " + padding + "; --modalWidth: " + width + "px; --modalTop: " + top + "; " + style);
      toggle_class(article, "borderTop", borderTop);
    },
    m(target, anchor) {
      insert(target, div0, anchor);
      insert(target, t0, anchor);
      insert(target, article, anchor);
      append(article, div1);
      if_block0.m(div1, null);
      append(article, t1);
      append(article, div2);
      append(div2, input_1);
      ctx[18](input_1);
      append(div2, t2);
      append(div2, span);
      append(article, t4);
      append(article, div6);
      append(div6, div4);
      append(div4, t5);
      append(div4, div3);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].m(div3, null);
      }
      append(div6, t6);
      append(div6, div5);
      if (~current_block_type_index) {
        if_blocks[current_block_type_index].m(div5, null);
      }
      current = true;
      if (!mounted) {
        dispose = [
          listen(div0, "click", ctx[17]),
          listen(span, "click", ctx[10])
        ];
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (current_block_type !== (current_block_type = select_block_type(ctx))) {
        if_block0.d(1);
        if_block0 = current_block_type(ctx);
        if (if_block0) {
          if_block0.c();
          if_block0.m(div1, null);
        }
      }
      if (dirty & 128) {
        toggle_class(div1, "copied", ctx[7]);
      }
      if (!current || dirty & 64 && input_1.value !== ctx[6]) {
        input_1.value = ctx[6];
      }
      if (dirty & 2056) {
        each_value = Array(4).fill("");
        let i;
        for (i = 0; i < each_value.length; i += 1) {
          const child_ctx = get_each_context(ctx, each_value, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
          } else {
            each_blocks[i] = create_each_block(child_ctx);
            each_blocks[i].c();
            each_blocks[i].m(div3, null);
          }
        }
        for (; i < each_blocks.length; i += 1) {
          each_blocks[i].d(1);
        }
        each_blocks.length = each_value.length;
      }
      let previous_block_index = current_block_type_index;
      current_block_type_index = select_block_type_1(ctx);
      if (current_block_type_index === previous_block_index) {
        if (~current_block_type_index) {
          if_blocks[current_block_type_index].p(ctx, dirty);
        }
      } else {
        if (if_block1) {
          group_outros();
          transition_out(if_blocks[previous_block_index], 1, 1, () => {
            if_blocks[previous_block_index] = null;
          });
          check_outros();
        }
        if (~current_block_type_index) {
          if_block1 = if_blocks[current_block_type_index];
          if (!if_block1) {
            if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
            if_block1.c();
          } else {
            if_block1.p(ctx, dirty);
          }
          transition_in(if_block1, 1);
          if_block1.m(div5, null);
        } else {
          if_block1 = null;
        }
      }
    },
    i(local) {
      if (current)
        return;
      add_render_callback(() => {
        if (div0_outro)
          div0_outro.end(1);
        div0_intro = create_in_transition(div0, fade, { duration: 125, easing: cubicOut });
        div0_intro.start();
      });
      transition_in(if_block1);
      add_render_callback(() => {
        if (article_outro)
          article_outro.end(1);
        article_intro = create_in_transition(article, scale, {
          duration: 225,
          start: 0.8,
          opacity: 0,
          easing: cubicOut
        });
        article_intro.start();
      });
      current = true;
    },
    o(local) {
      if (div0_intro)
        div0_intro.invalidate();
      div0_outro = create_out_transition(div0, fade, { duration: 450, easing: cubicIn });
      transition_out(if_block1);
      if (article_intro)
        article_intro.invalidate();
      article_outro = create_out_transition(article, scale, {
        duration: 325,
        start: 0.9,
        opacity: 0,
        easing: cubicIn
      });
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(div0);
      if (detaching && div0_outro)
        div0_outro.end();
      if (detaching)
        detach(t0);
      if (detaching)
        detach(article);
      if_block0.d();
      ctx[18](null);
      destroy_each(each_blocks, detaching);
      if (~current_block_type_index) {
        if_blocks[current_block_type_index].d();
      }
      if (detaching && article_outro)
        article_outro.end();
      mounted = false;
      run_all(dispose);
    }
  };
}
function create_else_block(ctx) {
  let t;
  return {
    c() {
      t = text("Here's your affiliate link:");
    },
    m(target, anchor) {
      insert(target, t, anchor);
    },
    d(detaching) {
      if (detaching)
        detach(t);
    }
  };
}
function create_if_block_5(ctx) {
  let t;
  return {
    c() {
      t = text("Your affiliate link has been copied to clipboard!");
    },
    m(target, anchor) {
      insert(target, t, anchor);
    },
    d(detaching) {
      if (detaching)
        detach(t);
    }
  };
}
function create_each_block(ctx) {
  let span;
  let mounted;
  let dispose;
  function click_handler_1() {
    return ctx[19](ctx[24]);
  }
  return {
    c() {
      span = element("span");
      toggle_class(span, "selected", ctx[3] === ctx[24]);
    },
    m(target, anchor) {
      insert(target, span, anchor);
      if (!mounted) {
        dispose = listen(span, "click", click_handler_1);
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & 8) {
        toggle_class(span, "selected", ctx[3] === ctx[24]);
      }
    },
    d(detaching) {
      if (detaching)
        detach(span);
      mounted = false;
      dispose();
    }
  };
}
function create_if_block_4(ctx) {
  let div;
  let div_intro;
  let div_outro;
  let current;
  let mounted;
  let dispose;
  return {
    c() {
      div = element("div");
      div.textContent = "Now you're ready! What are you waiting for? Go promote the novel out there and good\n            luck! \u{1F44D}\u{1F44D}\u{1F44D}";
      attr(div, "class", "tips-item");
      toggle_class(div, "selected", ctx[3] === 3);
    },
    m(target, anchor) {
      insert(target, div, anchor);
      current = true;
      if (!mounted) {
        dispose = action_destroyer(ctx[13].call(null, div));
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & 8) {
        toggle_class(div, "selected", ctx[3] === 3);
      }
    },
    i(local) {
      if (current)
        return;
      add_render_callback(() => {
        if (div_outro)
          div_outro.end(1);
        div_intro = create_in_transition(div, fly, ctx[12].In());
        div_intro.start();
      });
      current = true;
    },
    o(local) {
      if (div_intro)
        div_intro.invalidate();
      div_outro = create_out_transition(div, fly, ctx[12].Out());
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(div);
      if (detaching && div_outro)
        div_outro.end();
      mounted = false;
      dispose();
    }
  };
}
function create_if_block_3(ctx) {
  let div;
  let div_intro;
  let div_outro;
  let current;
  let mounted;
  let dispose;
  return {
    c() {
      div = element("div");
      div.innerHTML = `The amount of money you&#39;ll get at first probably won&#39;t satisfy you, since likely there
            is very small of people who aware of the incoming web standard Web Monetization and even
            smaller of people who subscribe for it. <br/><br/>But don&#39;t give up! There&#39;a a
            beginning for everything - and you, yes you, are the very first people who will vanguard
            the likely shift of web economy with the birth of web standard Web Monetization, which
            in the future, will be a very serious contender of ads economy that currently sustains
            almost every corner of the web out there. And like every industry and community, those
            who spearhead the revolution will definitely be rewarded!`;
      attr(div, "class", "tips-item");
      toggle_class(div, "selected", ctx[3] === 2);
    },
    m(target, anchor) {
      insert(target, div, anchor);
      current = true;
      if (!mounted) {
        dispose = action_destroyer(ctx[13].call(null, div));
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & 8) {
        toggle_class(div, "selected", ctx[3] === 2);
      }
    },
    i(local) {
      if (current)
        return;
      add_render_callback(() => {
        if (div_outro)
          div_outro.end(1);
        div_intro = create_in_transition(div, fly, ctx[12].In());
        div_intro.start();
      });
      current = true;
    },
    o(local) {
      if (div_intro)
        div_intro.invalidate();
      div_outro = create_out_transition(div, fly, ctx[12].Out());
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(div);
      if (detaching && div_outro)
        div_outro.end();
      mounted = false;
      dispose();
    }
  };
}
function create_if_block_2(ctx) {
  let div;
  let div_intro;
  let div_outro;
  let current;
  let mounted;
  let dispose;
  return {
    c() {
      div = element("div");
      div.textContent = "To get the most out of this affiliate link is to write book reviews you'd think people\n            will happy reading. Dig hidden gems and start recommend them to fellow readers in the\n            community!";
      attr(div, "class", "tips-item");
      toggle_class(div, "selected", ctx[3] === 1);
    },
    m(target, anchor) {
      insert(target, div, anchor);
      current = true;
      if (!mounted) {
        dispose = action_destroyer(ctx[13].call(null, div));
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & 8) {
        toggle_class(div, "selected", ctx[3] === 1);
      }
    },
    i(local) {
      if (current)
        return;
      add_render_callback(() => {
        if (div_outro)
          div_outro.end(1);
        div_intro = create_in_transition(div, fly, ctx[12].In());
        div_intro.start();
      });
      current = true;
    },
    o(local) {
      if (div_intro)
        div_intro.invalidate();
      div_outro = create_out_transition(div, fly, ctx[12].Out());
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(div);
      if (detaching && div_outro)
        div_outro.end();
      mounted = false;
      dispose();
    }
  };
}
function create_if_block_1(ctx) {
  let div;
  let t0;
  let t1;
  let t2;
  let div_intro;
  let div_outro;
  let current;
  let mounted;
  let dispose;
  return {
    c() {
      div = element("div");
      t0 = text("You will receive ");
      t1 = text(ctx[2]);
      t2 = text("% of revenue of Web Monetization subscribers clicking your\n            affiliate link. Please note that you are not being paid by how much clicks you get, but\n            instead the time spent by subscribers reading the novel you referred. It is recommended\n            to promote good novels that you're confident people will follow through, and avoid\n            annoying people with spam to maintain trust with fellow readers.");
      attr(div, "class", "tips-item");
      toggle_class(div, "selected", ctx[3] === 0);
    },
    m(target, anchor) {
      insert(target, div, anchor);
      append(div, t0);
      append(div, t1);
      append(div, t2);
      current = true;
      if (!mounted) {
        dispose = action_destroyer(ctx[13].call(null, div));
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (!current || dirty & 4)
        set_data(t1, ctx[2]);
      if (dirty & 8) {
        toggle_class(div, "selected", ctx[3] === 0);
      }
    },
    i(local) {
      if (current)
        return;
      add_render_callback(() => {
        if (div_outro)
          div_outro.end(1);
        div_intro = create_in_transition(div, fly, ctx[12].In());
        div_intro.start();
      });
      current = true;
    },
    o(local) {
      if (div_intro)
        div_intro.invalidate();
      div_outro = create_out_transition(div, fly, ctx[12].Out());
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(div);
      if (detaching && div_outro)
        div_outro.end();
      mounted = false;
      dispose();
    }
  };
}
function create_fragment(ctx) {
  let article;
  let img;
  let img_src_value;
  let t0;
  let section;
  let h3;
  let t2;
  let p;
  let t3;
  let strong;
  let t4;
  let t5;
  let t6;
  let t7;
  let em;
  let t9;
  let div;
  let input_1;
  let t10;
  let button;
  let t12;
  let if_block_anchor;
  let current;
  let mounted;
  let dispose;
  let if_block = ctx[4] && create_if_block(ctx);
  return {
    c() {
      article = element("article");
      img = element("img");
      t0 = space();
      section = element("section");
      h3 = element("h3");
      h3.textContent = "Instant affiliate link";
      t2 = space();
      p = element("p");
      t3 = text("Promote\n      ");
      strong = element("strong");
      t4 = text(ctx[0]);
      t5 = text("\n      and enjoy ~");
      t6 = text(ctx[2]);
      t7 = text("% of Coil subscription revenue from paying visitors you bring.\n      ");
      em = element("em");
      em.textContent = "No sign-up or paperwork required.";
      t9 = space();
      div = element("div");
      input_1 = element("input");
      t10 = space();
      button = element("button");
      button.textContent = `${input_label}`;
      t12 = space();
      if (if_block)
        if_block.c();
      if_block_anchor = empty();
      this.c = noop;
      attr(img, "class", "pg--image");
      if (!src_url_equal(img.src, img_src_value = `${ctx[1]}`))
        attr(img, "src", img_src_value);
      attr(img, "width", "100%");
      attr(img, "height", "auto");
      attr(img, "alt", "Instant affiliate link.");
      attr(input_1, "id", "generate-link-input");
      attr(input_1, "autocomplete", "off");
      attr(input_1, "type", "text");
      attr(input_1, "placeholder", "Enter your Interledger payment pointer address");
      attr(div, "class", "referrer-generator");
      attr(section, "class", "pg--content");
      attr(article, "part", "body");
      attr(article, "class", "pg--affiliate-link");
    },
    m(target, anchor) {
      insert(target, article, anchor);
      append(article, img);
      append(article, t0);
      append(article, section);
      append(section, h3);
      append(section, t2);
      append(section, p);
      append(p, t3);
      append(p, strong);
      append(strong, t4);
      append(p, t5);
      append(p, t6);
      append(p, t7);
      append(p, em);
      append(section, t9);
      append(section, div);
      append(div, input_1);
      ctx[16](input_1);
      append(div, t10);
      append(div, button);
      insert(target, t12, anchor);
      if (if_block)
        if_block.m(target, anchor);
      insert(target, if_block_anchor, anchor);
      current = true;
      if (!mounted) {
        dispose = [
          listen(window, "keyup", ctx[14]),
          listen(button, "click", ctx[9])
        ];
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      if (!current || dirty & 2 && !src_url_equal(img.src, img_src_value = `${ctx2[1]}`)) {
        attr(img, "src", img_src_value);
      }
      if (!current || dirty & 1)
        set_data(t4, ctx2[0]);
      if (!current || dirty & 4)
        set_data(t6, ctx2[2]);
      if (ctx2[4]) {
        if (if_block) {
          if_block.p(ctx2, dirty);
          if (dirty & 16) {
            transition_in(if_block, 1);
          }
        } else {
          if_block = create_if_block(ctx2);
          if_block.c();
          transition_in(if_block, 1);
          if_block.m(if_block_anchor.parentNode, if_block_anchor);
        }
      } else if (if_block) {
        group_outros();
        transition_out(if_block, 1, 1, () => {
          if_block = null;
        });
        check_outros();
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(if_block);
      current = true;
    },
    o(local) {
      transition_out(if_block);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(article);
      ctx[16](null);
      if (detaching)
        detach(t12);
      if (if_block)
        if_block.d(detaching);
      if (detaching)
        detach(if_block_anchor);
      mounted = false;
      run_all(dispose);
    }
  };
}
let input_label = "Generate your affiliate link";
let padding = "24px 24px 64px";
let width = 500;
let top = "20%";
let opacity = 0.35;
let borderTop = false;
let style = "";
function instance($$self, $$props, $$invalidate) {
  let { label = "" } = $$props;
  let { image = "" } = $$props;
  let { rate = "10" } = $$props;
  let input;
  let generatedLink = "";
  function createAffiliateLink() {
    $$invalidate(6, generatedLink = generateAffiliateLink(input.value));
    $$invalidate(4, showModal = true);
  }
  let copied = false;
  let linkElement;
  let hasClickedYet = false;
  let selectedTips = 0;
  let previousSelectedTips = 0;
  function copyLink() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(generatedLink);
    } else {
      linkElement.select();
      document.execCommand("copy");
    }
    $$invalidate(7, copied = true);
  }
  function clickTips(index) {
    hasClickedYet = true;
    $$invalidate(3, selectedTips = index);
  }
  const transition = {
    In() {
      const isLeft = selectedTips < previousSelectedTips;
      return { x: isLeft ? 12 : -12, duration: 275 };
    },
    Out() {
      const isLeft = selectedTips < previousSelectedTips;
      return { x: isLeft ? -6 : 6, duration: 125 };
    }
  };
  function tipsSelected(el) {
    const parent = el.parentElement;
    if (hasClickedYet)
      parent.style.transition = "height 0.32s ease-in-out";
    const height = el.clientHeight;
    parent.style.height = height + "px";
  }
  let showModal = false;
  function handlePressKey(e) {
    if (!showModal)
      return;
    if (e.key === "Escape")
      close();
  }
  const close = () => {
    $$invalidate(4, showModal = false);
  };
  function input_1_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      input = $$value;
      $$invalidate(5, input);
    });
  }
  const click_handler = () => close();
  function input_1_binding_1($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      linkElement = $$value;
      $$invalidate(8, linkElement);
    });
  }
  const click_handler_1 = (index) => clickTips(index);
  $$self.$$set = ($$props2) => {
    if ("label" in $$props2)
      $$invalidate(0, label = $$props2.label);
    if ("image" in $$props2)
      $$invalidate(1, image = $$props2.image);
    if ("rate" in $$props2)
      $$invalidate(2, rate = $$props2.rate);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & 8) {
      if (selectedTips) {
        tick().then(() => {
          previousSelectedTips = selectedTips;
        });
      }
    }
    if ($$self.$$.dirty & 16) {
      if (showModal === true) {
        windowLock();
      }
    }
    if ($$self.$$.dirty & 16) {
      if (showModal === false) {
        windowUnlock();
      }
    }
  };
  return [
    label,
    image,
    rate,
    selectedTips,
    showModal,
    input,
    generatedLink,
    copied,
    linkElement,
    createAffiliateLink,
    copyLink,
    clickTips,
    transition,
    tipsSelected,
    handlePressKey,
    close,
    input_1_binding,
    click_handler,
    input_1_binding_1,
    click_handler_1
  ];
}
class AffiliateLink extends SvelteElement {
  constructor(options) {
    super();
    this.shadowRoot.innerHTML = `<style>.pg--affiliate-link{--width:1000px;--primary-color-h:16;--primary-color-s:100%;--primary-color-l:42%;--primary-color:hsl(var(--primary-color-h), var(--primary-color-s), var(--primary-color-l));--font-family:Roboto, -apple-system, BlinkMacSystemFont, Segoe UI, Oxygen, Ubuntu, Cantarell, Open Sans, Helvetica Neue, sans-serif;width:var(--width);margin:0 auto;margin-bottom:128px;padding:24px;background-color:var(--background-color, #fff);border:1px solid #0002;box-shadow:0 2px 8px #0002, 0 4px 16px #0001;overflow:hidden;display:grid;grid-template-columns:1fr 3fr;grid-gap:128px;border-radius:8px;font-family:var(--font-family)}.pg--affiliate-link .pg--image{transform:scale(1.8)}.pg--affiliate-link .pg-content strong{color:var(--bold-color)}.pg--affiliate-link .pg-content em{font-weight:300}:global(html.light) .pg--affiliate-link{box-shadow:0 12px 24px #0002}:global(html.light) .pg--affiliate-link .referrer-generator>button{background:hsl(var(--primary-color-h), var(--primary-color-s), 38%);filter:none}.referrer-generator{width:100%;display:grid;grid-template-columns:1fr auto;grid-gap:8px}.referrer-generator input[type=text]{padding:6px}.referrer-generator button{font-family:inherit;padding-left:18px;padding-right:18px;border-radius:2px;background:hsl(var(--primary-color-h), var(--primary-color-s), 42%);color:#fffd;border:none;user-select:none}.referrer-generator button:not([disabled]){cursor:pointer}.referrer-generator button:focus{outline:none}@media screen and (max-width: 789px){article{display:none}}.affiliate-link{--primary-color-h:16;--primary-color-s:100%;--primary-color-l:42%;--primary-color:hsl(var(--primary-color-h), var(--primary-color-s), var(--primary-color-l));display:flex;gap:4px;margin-top:0.6em}.affiliate-link input{padding:8px;border-radius:4px;width:90%;overflow:hidden;text-overflow:clip;background-color:#999;border:2px solid #555;font-family:"Courier New", Courier, monospace;font-weight:700}.affiliate-link span{padding:4px 12px;background-color:var(--primary-color);border-radius:4px;user-select:none;cursor:pointer}.affiliate-link span:active{filter:contrast(90%)}.tips{position:relative}.tips .head{display:flex;align-items:center;justify-content:center;margin-top:1.25em;margin-bottom:1.2em;font-weight:700;color:hsla(var(--primary-color-h), var(--primary-color-s), 60%, 1);font-size:1.4em;flex-direction:column}.tips .head div{display:flex;margin-top:0.25em;contain:layout}.tips .head div span{margin-right:6px;border-radius:4px;width:8px;height:8px;background-color:#0004;opacity:0.6;display:inline-block;transition:width 0.3s ease-in-out;cursor:pointer}.tips .head div span.selected{opacity:1;width:20px}.tips .body{position:relative;will-change:height}.tips .body .tips-item{position:absolute;top:0;left:0}.copied{font-style:italic;font-weight:300;color:var(--primary-color)}.pg--modal{--borderRadius:4px;width:var(--modalWidth, 500px);position:fixed;top:var(--modalTop, 20%);min-height:250px;left:calc(50% - var(--modalWidth) / 2);background-color:var(--background-color, #fff);z-index:999999;border-radius:var(--borderRadius);overflow:hidden;font-family:"Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif}.pg--modal.borderTop{border-top:2px solid var(--primary-color);border-radius:0 0 var(--borderRadius) var(--borderRadius)}@media screen and (max-width: 768px){article{--modalWidth:95vw !important}}.overlay{z-index:999998;position:fixed;top:0;left:0;width:100%;height:100%;background-color:#000}</style>`;
    init(this, {
      target: this.shadowRoot,
      props: attribute_to_object(this.attributes),
      customElement: true
    }, instance, create_fragment, safe_not_equal, { label: 0, image: 1, rate: 2 }, null);
    if (options) {
      if (options.target) {
        insert(options.target, this, options.anchor);
      }
      if (options.props) {
        this.$set(options.props);
        flush();
      }
    }
  }
  static get observedAttributes() {
    return ["label", "image", "rate"];
  }
  get label() {
    return this.$$.ctx[0];
  }
  set label(label) {
    this.$$set({ label });
    flush();
  }
  get image() {
    return this.$$.ctx[1];
  }
  set image(image) {
    this.$$set({ image });
    flush();
  }
  get rate() {
    return this.$$.ctx[2];
  }
  set rate(rate) {
    this.$$set({ rate });
    flush();
  }
}
customElements.define("affiliate-link", AffiliateLink);
