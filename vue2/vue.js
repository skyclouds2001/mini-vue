/**
 * @file a minimum implement of Vue 2.x
 * @author skyclouds2001
 * @version 0.0.0
 * @since 2023.6.26
 */
class Vue {
  /**
   * @typedef {object} VueOptions
   * @property {string | Element} [el] {@link https://v2.cn.vuejs.org/v2/api/index.html#el}
   * @property {Record<string, any> | () => Record<string, any>} [data] {@link https://v2.cn.vuejs.org/v2/api/index.html#data}
   */

  /**
   * @param {VueOptions} options
   */
  constructor(options) {
    this.#options = options

    const data = this.#data = typeof options.data === 'function' ? options.data() : (options.data ?? {})
    this.#observe(data)
    this.#proxy(data)

    this.#event = new Map()

    if (this.#options.el) {
      this.$mount(this.#options.el)
    }
  }

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

  /********** 实例data相关 **********/

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
    this.$on(event, fn)
  }

  /**
   * @see https://v2.cn.vuejs.org/v2/api/index.html#vm-off
   * @param {string | string[]} [event]
   * @param {Function} [callback]
   * @public
   */
  $off(event, callback) {
    if (!event) {
      this.#event.clear()
    } else {
      if (Array.isArray(event)) {
        event.forEach((ev) => {
          this.$off(ev, callback)
        })
      } else {
        if (!callback) {
          this.#event.delete(event)
        } else {
          this.#event.get(event).splice(this.#event.get(event).findIndex((fn) => fn === callback))
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
    if (!el) {
      el = document.createDocumentFragment()
    }
    if (typeof el === 'string') {
      el = document.querySelector(el)
    }
    this.$el = el

    // 1 render

    // 2 template

    // 3 use dom structure

    return this
  }

  /**
   * @param {Element} el
   * @private
   */
  #compile() {
    const fg = document.createDocumentFragment()
    for(let child = this.$el.firstChild; child; child = this.$el.firstChild) {
      fg.appendChild(child)
    }

    /**
     * 替换 {{  }} 表达式的值
     * @param {Node} fg 
     */
    const replace = (fg) => {
      Array.from(fg.childNodes).forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE && /{{(.*)}}/.test(node.textContent)) {
          // const arr = RegExp.$1.split('.')
          // let val = this
          // arr.forEach(k => (val = val[k]))
          // node.textContent = text.replace(reg, val)
        }

        if (node.childNodes) {
          replace(node)
        }
      })
    }

    this.$el.appendChild(fg)
  }
}
