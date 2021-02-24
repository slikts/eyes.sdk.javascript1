import * as utils from '@applitools/utils'

export type PropertyData = {
  name: string
  value: string
}

export class PropertyDataData implements Required<PropertyData> {
  private _name: string
  private _value: string

  constructor(prop: PropertyData)
  constructor(name: string, value: string)
  constructor(propOrName: PropertyData | string, value?: string) {
    if (utils.types.isString(propOrName)) {
      return new PropertyDataData({name: propOrName, value})
    }
    const prop = propOrName
    utils.guard.isString(prop.name, {name: 'prop.name'})
    utils.guard.notNull(prop.value, {name: 'prop.value'})

    this._name = prop.name
    this._value = prop.value
  }

  get name(): string {
    return this._name
  }
  getName(): string {
    return this._name
  }
  setName(name: string) {
    this._name = name
  }

  get value(): string {
    return this._value
  }
  getValue(): string {
    return this._value
  }
  setValue(value: string) {
    this._value = value
  }
}
