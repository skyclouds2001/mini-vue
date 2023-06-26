/**
 * Mini Vue Class
 */
class Vue {
  /**
   * @typedef {object} VueOptions
   * @property {string | Element} el
   */

  /**
   * @type {number}
   * @private
   * @default 0
   */
  static #uid = 0

  /**
   * @type {string}
   * @public
   * @readonly
   */
  static version = '0.0.0'

  // todo - init global api || https://github.com/vuejs/vue/blob/main/src/core/index.ts#L7
  // todo - init $isServer || https://github.com/vuejs/vue/blob/main/src/core/index.ts#L9
  // todo - init $ssrContext || https://github.com/vuejs/vue/blob/main/src/core/index.ts#L13
  // todo - init FunctionalRenderContext || https://github.com/vuejs/vue/blob/main/src/core/index.ts#L21

  // todo - init lifecycle || https://github.com/vuejs/vue/blob/main/src/core/instance/index.ts#L23
  // todo - init render || https://github.com/vuejs/vue/blob/main/src/core/instance/index.ts#L25

  /**
   * @type {boolean}
   * @private
   * @readonly
   */
  #isVue

  /**
   * @type {Vue}
   * @private
   * @readonly
   */
  #self

  /**
   * @type {number}
   * @private
   * @readonly
   */
  #uid

  /**
   * @type {Record<string, any>}
   * @private
   * @readonly
   */
  #props

  /**
   * @type {Record<string, any>}
   * @private
   * @readonly
   */
  #data

  /**
   * @type {Map<string, Function[]>}
   * @private
   */
  #events

  /**
   * @type {boolean}
   * @private
   */
  #hasHookEvent

  /**
   * @type {VueOptions}
   * @public
   * @readonly
   */
  $options

  /**
   * @type {Record<string, any>}
   * @public
   * @readonly
   */
  get $props() {
    return this.#props
  }

  /**
   * @type {Record<string, any>}
   * @public
   * @readonly
   */
  get $data() {
    return this.#data
  }

  // todo - init $set || https://github.com/vuejs/vue/blob/main/src/core/instance/state.ts#L362
  // todo - init $delete || https://github.com/vuejs/vue/blob/main/src/core/instance/state.ts#L363
  // todo - init $watch || https://github.com/vuejs/vue/blob/main/src/core/instance/state.ts#L365

  /**
   * @param {string | string[]} event
   * @param {Function} callback
   * @returns {Vue}
   */
  $on(event, callback) {
    if (Array.isArray(event)) {
      event.forEach((event) => {
        this.$on(event, callback)
      })
    } else {
      if (!this.#events.has(event)) this.#events.set(event, [])
      this.#events.get(event).push(callback)
      if (/^hook:/.test(event)) {
        this.#hasHookEvent = true
      }
    }
    return this
  }

  /**
   * @param {string | string[]} event
   * @param {Function} callback
   * @returns {Vue}
   */
  $once(event, callback) {
    const on = (...args) => {
      this.$off(event, callback)
      callback.apply(this, ...args)
    }
    on.fn = callback
  
    this.$on(event, on)

    return this
  }

  /**
   * @param {string | string[]} [event]
   * @param {Function} [callback]
   * @returns {Vue}
   */
  $off(event, callback) {
    if (!event && !callback) {
      this.#events.clear()
    } else if (Array.isArray(event)) {
      event.forEach((event) => {
        this.$off(event, callback)
      })
    } else {
      if (this.#events.has(event)) {
        if (callback) {
          this.#events.set(event, this.#events.get(event).filter((fn) => callback !== fn && callback !== fn.fn))
        } else {
          this.#events.delete(event)
        }
      }
    }

    return this
  }

  /**
   * @param {string} event
   * @returns {Vue}
   */
  $emit(event, ...args) {
    // todo - handle in dev mode || https://github.com/vuejs/vue/blob/main/src/core/instance/events.ts#L133
    this.#events.get(event)?.forEach((fn) => {
      // todo - invoke with warn handler || https://github.com/vuejs/vue/blob/main/src/core/instance/events.ts#L133
      fn.apply(this, args)
    })
    return this
  }

  /**
   * @param {VueOptions} options
   * @public
   */
  constructor(options) {
    const vm = this

    vm.#isVue = true
    vm.#uid = Vue.#uid++

    // todo - avoid instances from being observed || https://github.com/vuejs/vue/blob/main/src/core/instance/init.ts#L31
    // todo - effect scope || https://github.com/vuejs/vue/blob/main/src/core/instance/init.ts#L35
    // todo - handle for component instance || https://github.com/vuejs/vue/blob/main/src/core/instance/init.ts#L38
    // todo - merge options from parent instance
    vm.$options = options

    // todo - use instance proxy when not in production mode || https://github.com/vuejs/vue/blob/main/src/core/instance/init.ts#L51

    vm.#self = this

    // todo - init lifecycle hooks and data || https://github.com/vuejs/vue/blob/main/src/core/instance/init.ts#L59

    this.#events = new Map()
    this.#hasHookEvent = false
    // todo - init parent attached events || https://github.com/vuejs/vue/blob/main/src/core/instance/events.ts#L15

    // todo - init render method || https://github.com/vuejs/vue/blob/main/src/core/instance/init.ts#L61

    // todo - call beforeCreate hook || https://github.com/vuejs/vue/blob/main/src/core/instance/init.ts#L62
    // todo - init inject data || https://github.com/vuejs/vue/blob/main/src/core/instance/init.ts#L63
    // todo - init state data || https://github.com/vuejs/vue/blob/main/src/core/instance/init.ts#L64
    // todo - init provide data || https://github.com/vuejs/vue/blob/main/src/core/instance/init.ts#L65
    // todo - call created hook || https://github.com/vuejs/vue/blob/main/src/core/instance/init.ts#L66

    if (vm.$options.el) {
      // todo - mount el || https://github.com/vuejs/vue/blob/main/src/core/instance/init.ts#L76
    }
  }
}
