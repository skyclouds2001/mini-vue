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
