import * as utils from '@applitools/utils'

const REF_ID = 'applitools-ref-id'

export type Ref<TValue = any> = {'applitools-ref-id': string}

export type DeepRef<TValue, TTarget> = TValue extends TTarget ? Ref<TValue>
  : TValue extends (...args: any[]) => any ? TValue
  : TValue extends Date ? TValue
  : TValue extends Record<PropertyKey, any> ? {[key in keyof TValue]: DeepRef<TValue[key], TTarget>}
  : TValue

export class Refer<TTarget> {
  private _store = new Map<string, any>()
  private _relation = new Map<string, Set<Ref>>()

  constructor(private readonly _check: (value: any) => value is TTarget) {
  }

  private isRef(ref: any): ref is Ref {
    return Boolean(ref[REF_ID])
  }

  ref<TValue>(value: TValue, parentRef?: Ref): DeepRef<TValue, TTarget> {
    if (this._check(value)) {
      const ref = utils.general.guid()
      this._store.set(ref, value)
      if (parentRef) {
        let childRefs = this._relation.get(parentRef[REF_ID])
        if (!childRefs) {
          childRefs = new Set()
          this._relation.set(parentRef[REF_ID], childRefs)
        }
        childRefs.add({[REF_ID]: ref})
      }
      return {[REF_ID]: ref} as any
    } else if (utils.types.isArray(value)) {
      return value.map(value => this.ref(value, parentRef)) as any
    } else if (utils.types.isObject(value)) {
      return Object.entries(value).reduce((obj, [key, value]) => {
        return Object.assign(obj, {[key]: this.ref(value, parentRef)})
      }, {}) as any
    } else {
      return value
    }
  }

  deref<TValue>(ref: Ref<TValue>): TValue {
    if (this.isRef(ref)) {
      return this._store.get(ref[REF_ID])
    } else {
      return ref
    }
  }

  destroy(ref: Ref): void {
    if (!this.isRef(ref)) return
    const childRefs = this._relation.get(ref[REF_ID])
    childRefs.forEach(childRef => this.destroy(childRef))
    this._store.delete(ref[REF_ID])
  }
}
