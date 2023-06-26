/**
 * @file a minimum implement of Vue 2.x
 * @author skyclouds2001
 * @version 0.0.0
 * @since 2023.6.26
 */
class Vue {
  /**
   * @typedef {object} VueOptions
   * @property {Record<string, any>} [data]
   */

  /**
   * @param {VueOptions} options
   */
  constructor(options) {
    this.#options = options

    const data = this.#data = options.data ?? {}
    this.#observe(data)
    this.#proxy(data)
  }

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
          if (val === value) return
          if (typeof val === 'object') {
            self.#observe(val)
          }
          value = val
        }
      })
    })
  }

  /**
   * @param {Record<string, any>} data
   * @private
   */
  #proxy(data) {
    const self = this

    Object.entries(data).forEach(([key, _]) => {
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
}
