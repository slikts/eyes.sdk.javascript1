module.exports = CheckSettings => {
  return args => {
    const checkArgs = {...args}
    checkArgs.name = checkArgs.tag
    checkArgs.isFully = checkArgs.fully
    if (checkArgs.target && checkArgs.target === 'region' && checkArgs.selector)
      checkArgs.region = checkArgs.selector
    if (checkArgs.floating)
      checkArgs.floatingRegions = checkArgs.floating.map(r => {
        if (
          Number.isInteger(r.top) &&
          Number.isInteger(r.left) &&
          Number.isInteger(r.width) &&
          Number.isInteger(r.height)
        )
          r.region = {top: r.top, left: r.left, width: r.width, height: r.height}
        else if (r.selector) r.region = r.selector
        return r
      })
    if (checkArgs.ignore)
      checkArgs.ignoreRegions = checkArgs.ignore.map(r => (r.selector ? r.selector : r))
    if (checkArgs.layout)
      checkArgs.layoutRegions = checkArgs.layout.map(r => (r.selector ? r.selector : r))
    if (checkArgs.strict)
      checkArgs.strictRegions = checkArgs.strict.map(r => (r.selector ? r.selector : r))
    if (checkArgs.content)
      checkArgs.contentRegions = checkArgs.content.map(r => (r.selector ? r.selector : r))
    if (checkArgs.accessibility)
      checkArgs.accessibilityRegions = checkArgs.accessibility.map(r => {
        if (r.selector) r.region = r.selector
        return r
      })
    const checkSettings = new CheckSettings(checkArgs)
    if (args.scriptHooks) {
      Object.entries(args.scriptHooks).forEach(([name, script]) => {
        checkSettings.hook(name, script)
      })
    }
    return checkSettings
  }
}
