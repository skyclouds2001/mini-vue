const mutableHandlers = {}
const mutableCollectionHandlers = {}
const toRawType = v => Object.prototype.toString.call(v).slice(8, -1)
const isObject = v => v !== null && typeof v === 'object'

export const enum ReactiveFlags {
  SKIP = '__v_skip',
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadonly',
  IS_SHALLOW = '__v_isShallow',
  RAW = '__v_raw',
}

export interface Target {
  [ReactiveFlags.SKIP]?: boolean
  [ReactiveFlags.IS_REACTIVE]?: boolean
  [ReactiveFlags.IS_READONLY]?: boolean
  [ReactiveFlags.IS_SHALLOW]?: boolean
  [ReactiveFlags.RAW]?: any
}

const enum TargetType {
  INVALID = 0,
  COMMON = 1,
  COLLECTION = 2,
}

function targetTypeMap(rawType: string) {
  switch(rawType) {
    case 'Object':
    case 'Array':
      return TargetType.COMMON
    case 'Map':
    case 'Set':
    case 'WeakMap':
    case 'WeakSet':
      return TargetType.COLLECTION
    default:
      return TargetType.INVALID
  }
}

function getTargetType(value: Target) {
  return value[ReactiveFlags.SKIP] || !Object.isExtensible(value) ? TargetType.INVALID : targetTypeMap(toRawType(value))
}

export const reactiveMap = new WeakMap<Target, any>()

export function reactive<T extends object>(target: T) {
  // todo - check if is readonly object

  return createReactiveObject(target, false, mutableHandlers, mutableCollectionHandlers, reactiveMap)
}

export function createReactiveObject(target: Target, isReadonly: boolean, baseHandlers: ProxyHandler<any>, collectionHandlers: ProxyHandler<any>, proxyMap: WeakMap<Target, any>) {
  if (!isObject(target)) return target

  if (target[ReactiveFlags.RAW] && !(isReadonly && target[ReactiveFlags.IS_REACTIVE])) return target

  const existingProxy = proxyMap.get(target)
  if (existingProxy) return existingProxy

  const targetType = getTargetType(target)
  if (targetType === TargetType.INVALID) return target

  const proxy = new Proxy(target, targetType === TargetType.COLLECTION ? collectionHandlers : baseHandlers)
  proxyMap.set(target, proxy)
  return proxy
}
