const uuid = require('uuid')

const REF_ID = 'applitools-ref-id'

class Refer {
  constructor() {
    this._store = new Map()
    this._relation = new Map()
  }

  ref(value, parentRef) {
    const ref = uuid.v4()
    this._store.set(ref, value)
    if (parentRef) {
      let childRefs = this._relation.get(parentRef[REF_ID])
      if (!childRefs) {
        childRefs = new Set()
        this._relation.set(parentRef[REF_ID], childRefs)
      }
      childRefs.add(ref)
    }
    return {[REF_ID]: ref}
  }

  isRef(ref) {
    return Boolean(ref[REF_ID])
  }

  deref(ref) {
    if (this.isRef(ref)) {
      return this._store.get(ref[REF_ID])
    } else {
      return ref
    }
  }

  destroy(ref) {
    if (!this.isRef(ref)) return
    const childRefs = this._relation.get(ref[REF_ID])
    childRefs.forEach(childRef => this.destroy(childRef))
    this._store.delete(ref[REF_ID])
  }
}

module.exports = Refer
