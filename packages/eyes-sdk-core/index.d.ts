import {SpecDriver} from '@applitools/types'

export function makeSDK<TDriver, TContext, TElement, TSelector>(options: {
  spec: SpecDriver<TDriver, TContext, TElement, TSelector>
})
