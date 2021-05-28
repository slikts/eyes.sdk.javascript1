import type {SpecDriver} from '@applitools/types'

export function makeSDK<TDriver, TContext, TElement, TSelector>(options: {
  name: string
  version: string
  spec: SpecDriver<TDriver, TContext, TElement, TSelector>
  VisualGridClient: any
})
