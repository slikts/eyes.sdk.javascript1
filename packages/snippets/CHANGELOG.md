
# Changelog

## Unreleased


## 2.1.7 - 2021/9/9

- fix `getShadowRoot` to follow convention for arguments

## 2.1.6 - 2021/9/6

- return array instead of object from `addElementIds`

## 2.1.5 - 2021/9/6

- add `getShadowRoot` snippet
- replace `setElementMarkers` with `addElementIds` snippet, which will return a selector mapping

## 2.1.4 - 2021/8/4

- add `isEqualElements` snippet

## 2.1.3 - 2021/3/11

- fix exception thrown in getElementTranslateOffset [Trello](https://trello.com/c/duAwaupv)

## 2.1.1 - 2021/1/26

- handle translated html elements during content size extracting
- chore: add husky

## 2.1.0 - 2020/10/23

- fix `blurElement`: use default value if element passed as `null`
- fix `getElementRect`: extract element fixed ancestor inner offset even if it not scrollable
- fix `setElementMarkers`: concat ids instead of override

## 2.0.3 - 2020/10/6

- publish with dist folder

## 2.0.2 - 2020/10/6

- added `addPageMarker` and `cleanupPageMarker` snippets
- handle priority of the style properties in `getElementStyleProperties` and `setElementStyleProperties`

## 2.0.1 - 2020/9/28

- remove yarn workspaces

## 2.0.0 - 2020/9/14

- Breaking change: changed snippets argument format from object to array
- Breaking change: changed snippets return value format from object to array
- add ios tests

## 1.1.1 - 2020/8/30

- nothing added, technical issue with unreleased commits

## 1.1.0 - 2020/8/30

- add `markElements` and `cleanupElementIds`

## 1.0.3 - 2020/8/10

- bumped sdk-release-kit version to latest

## 1.0.2 - 2020/8/4

- Fix git tagging

## 1.0.1 - 2020/8/4

- Fix IE capabilities

## 1.0.0 - 2020/8/4

- First release
