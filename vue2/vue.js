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
   * @property {Record<string, Method>} [methods] {@link https://v2.cn.vuejs.org/v2/api/index.html#methods}
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

    const data = this.#data = typeof options.data === 'function' ? options.data.call(this) : (options.data ?? {})
    this.#observe(data)
    this.#proxy(data)
    if (this.#options.methods) {
      this.#method(this.#options.methods)
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
  #observe(data) {
    const self = this

    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === 'object') {
        self.#observe(value)
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
            self.#observe(val)
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
  #proxy(data) {
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
   * 将方法绑定到 Vue 实例上
   * @param {Record<string, Function>} methods
   * @private
   */
  #method (methods) {
    for (const fn in methods) {
      this[fn] = typeof methods[fn] !== 'function' ? _ => _ : methods[fn].bind(this)
    }
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
