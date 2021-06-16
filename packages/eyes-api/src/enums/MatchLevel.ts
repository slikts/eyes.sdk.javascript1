export enum MatchLevel {
  None = 'None',
  LegacyLayout = 'Layout1',
  Layout = 'Layout',
  Layout2 = 'Layout2',
  Content = 'Content',
  Strict = 'Strict',
  Exact = 'Exact',
}

export type MatchLevelLiteral = MatchLevel | `${MatchLevel}`
