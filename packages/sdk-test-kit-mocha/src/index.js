module.exports = {
  makeTestFilter: tags => new RegExp(`^[\\w\\s\\-]*?(\\((?:@(${tags.join('|')}) ?)+\\))?$`),
}
