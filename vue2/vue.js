/**
 * @file a minimum implement of Vue 2.x
 * @author skyclouds2001
 * @version 0.0.0
 * @since 2023.6.26
 */
class Vue {
  /**
   * @typedef {object} VueOptions
   *
   * @property {Record<string, any> | () => Record<string, any>} [data] {@link https://v2.cn.vuejs.org/v2/api/index.html#data}
   * @property {Record<string, Function | Record<'get' | 'set', Function>>} [computed] {@link https://v2.cn.vuejs.org/v2/api/index.html#computed}
   * @property {Record<string, Method>} [methods] {@link https://v2.cn.vuejs.org/v2/api/index.html#methods}
   * @property {Record<string, string | Function | Record<string, any> | Array>} [watch] {@link https://v2.cn.vuejs.org/v2/api/index.html#watch}
   *
   * @property {string | Element} [el] {@link https://v2.cn.vuejs.org/v2/api/index.html#el}
   * @property {string} [template] {@link https://v2.cn.vuejs.org/v2/api/index.html#template}
   *
   * @property {string} [name] {@link https://v2.cn.vuejs.org/v2/api/index.html#name}
   */

  /**
   * @param {VueOptions} options
   */
  constructor(options) {
    this.#options = options

    this.#data = typeof options.data === 'function' ? options.data.call(this) : (options.data ?? {})
    this.#initData(this.#data)
    this.#initProxy(this.#data)
    if (this.#options.computed) {
      this.#initComputed(this.#options.computed)
    }
    if (this.#options.methods) {
      this.#initMethod(this.#options.methods)
    }
    if (this.#options.watch) {
      this.#initWatch(this.#options.watch)
    }

    this.#event = new Map()

    if (this.#options.el) {
      this.$mount(this.#options.el)
    }
  }

  /********** 全局通用相关 **********/

  /**
   * @see https://v2.cn.vuejs.org/v2/api/index.html#Vue-version
   * @type {string}
   * @public
   * @readonly
   */
  static version = '0.0.0'

  /********** 实例本身相关 **********/

  /**
   * @see https://v2.cn.vuejs.org/v2/api/index.html#vm-el
   * @type {Element}
   * @public
   * @readonly
   */
  $el

  /********** 实例参数相关 **********/

  /**
   * @type {VueOptions}
   * @private
   */
  #options

  /**
   * @see https://v2.cn.vuejs.org/v2/api/index.html#vm-options
   * @type {VueOptions}
   * @public
   * @readonly
   */
  get $options() {
    return this.#options
  }

  /********** 实例数据相关 **********/

  /**
   * @type {Record<string, any>}
   * @private
   */
  #data

  /**
   * @see https://v2.cn.vuejs.org/v2/api/index.html#vm-data
   * @type {Record<string, any>}
   * @public
   * @readonly
   */
  get $data() {
    return this.#data
  }

  /**
   * 将对象转换为响应式对象
   * @param {Record<string, any>} data
   * @private
   */
  #initData(data) {
    const self = this

    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === 'object') {
        self.#initData(value)
      }

      Object.defineProperty(data, key, {
        enumerable: true,
        get() {
          return value
        },
        set(val) {
          if (val === value) {
            return
          }
          if (typeof val === 'object') {
            self.#initData(val)
          }
          value = val
        }
      })
    })
  }

  /**
   * 将数据代理到 Vue 实例上
   * @param {Record<string, any>} data
   * @private
   */
  #initProxy(data) {
    const self = this

    Object.entries(data).forEach(([key, _]) => {
      // 属性开头为 - 或 $ 的不挂载到 Vue 实例上，以避免和 Vue 本身实例属性冲突混淆
      if (key.startsWith('-') || key.startsWith('$')) {
        return
      }

      Object.defineProperty(self, key, {
        enumerable: true,
        get() {
          return self.#data[key]
        },
        set(val) {
          self.#data[key] = val
        }
      })
    })
  }

  /**
   * 处理计算属性
   * @param {Record<string, Function | Record<'get' | 'set', Function>>} computed
   * @private
   */
  #initComputed (computed) {
    const self = this

    Object.entries(computed).forEach(([key, value]) => {
      if (typeof value === 'function') {
        Object.defineProperty(self, key, {
          get() {
            return value.call(self)
          },
        })
      }
      if (typeof value === 'object' && 'get' in value && 'set' in value) {
        Object.defineProperty(self, key, value)
      }
    })
  }

  /**
   * 将方法绑定到 Vue 实例上
   * @param {Record<string, Function>} methods
   * @private
   */
  #initMethod (methods) {
    for (const fn in methods) {
      this[fn] = typeof methods[fn] !== 'function' ? _ => _ : methods[fn].bind(this)
    }
  }

  /**
   * 处理监听属性
   * @param {Record<string, string | Function | Record<string, any> | Array>} watch
   * @private
   */
  #initWatch (watch) {
    const self = this

    Object.entries(watch).forEach(([key, callback]) => {
      let value = this.#data[key]
      Object.defineProperty(self.#data, key, {
        get() {
          return value
        },
        set(val) {
          const v = value
          value = val
          callback.call(self, val, v)
        },
      })
    })
  }

  /**
   * @see https://v2.cn.vuejs.org/v2/api/index.html#vm-watch
   * @param {string | Function} expOrFn
   * @param {Function | Record<string, any>} callback
   * @param {Record<'deep' | 'immediate', boolean>} [options]
   * @returns {Function}
   * @public
   */
  $watch(expOrFn, callback, options) {
    //
  }

  /********** 实例事件相关 **********/

  /**
   * 事件存储对象
   * @type {Map<string, Function[]>}
   * @private
   */
  #event

  /**
   * @see https://v2.cn.vuejs.org/v2/api/index.html#vm-on
   * @param {string | string[]} event
   * @param {Function} callback
   * @public
   */
  $on(event, callback) {
    if (Array.isArray(event)) {
      event.forEach((ev) => {
        this.$on(ev, callback)
      })
    } else {
      if (!this.#event.has(event)) {
        this.#event.set(event, [])
      }
      this.#event.get(event).push(callback)
    }
  }

  /**
   * @see https://v2.cn.vuejs.org/v2/api/index.html#vm-once
   * @param {string} event
   * @param {Function} callback
   * @public
   */
  $once(event, callback) {
    const fn = (...args) => {
      this.$off(event, callback)
      callback.call(this, ...args)
    }
    fn.fn = callback
    this.$on(event, fn)
  }

  /**
   * @see https://v2.cn.vuejs.org/v2/api/index.html#vm-off
   * @param {string | string[]} [event]
   * @param {Function} [callback]
   * @public
   */
  $off(event, callback) {
    if (!event && !callback) {
      this.#event.clear()
    } else {
      if (Array.isArray(event)) {
        event.forEach((ev) => {
          this.$off(ev, callback)
        })
      } else {
        if (this.#event.has(event)) {
          if (!callback) {
            this.#event.delete(event)
          } else {
            this.#event.get(event).splice(this.#event.get(event).findIndex((fn) => fn === callback || fn.fn === callback), 1)
          }
        }
      }
    }
  }

  /**
   * @see https://v2.cn.vuejs.org/v2/api/index.html#vm-emit
   * @param {string} event
   * @param  {any[]} args
   * @public
   */
  $emit(event, ...args) {
    this.#event.get(event)?.forEach((fn) => {
      fn.call(this, ...args)
    })
  }

  /********** 实例生命周期相关 **********/

  /**
   * @see https://v2.cn.vuejs.org/v2/api/index.html#vm-mount
   * @param {string | Element} [el]
   * @returns {Vue}
   * @public
   */
  $mount(el) {
    if (typeof el === 'string') {
      el = document.querySelector(el)
    }
    if (!el) {
      el = document.createDocumentFragment()
    }

    // 不能将实例挂载到 body 元素或者 html 元素上
    if (el === document.body || el === document.documentElement) {
      return this
    }

    // 1 render
    // 2 template issue-with-#
    // 3 use dom structure

    if (this.#options.template) {
      el.innerHTML = this.#compile(this.#options.template)
    } else if (el) {
      el.innerHTML = this.#compile(el.innerHTML)
    }

    if (el) {
      this.$el = el
    }

    return this
  }

  /**
   * @param {string} template
   * @returns {string}
   * @private
   */
  #compile(template) {
    const compiledTemplate = template.trim().replace(/\{\{(.*?)\}\}/g, (_, expression) => {
      return this.#data[expression.trim()] ?? ''
    })
    return compiledTemplate.trim()
  }
}
