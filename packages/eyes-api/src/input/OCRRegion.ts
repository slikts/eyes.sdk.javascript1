import type * as types from '@applitools/types'
import {Region} from './Region'

export type OCRRegion<TElement = unknown, TSelector = unknown> = {
  target: Region | TElement | types.Selector<TSelector>
  hint?: string
  minMatch?: number
  language?: string
}
