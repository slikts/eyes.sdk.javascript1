const handlebars = require('handlebars')
const {loadFile} = require('../common-util')

async function loadTemplate(path) {
  return loadFile(path)
}

async function templateLoader({template: templatePath, testFrameworkTemplate}) {
  if (testFrameworkTemplate) return testFrameworkTemplate
  const template = await loadTemplate(templatePath)
  handlebars.registerHelper('tags', (context, options) => {
    if (!context || context.length <= 0) return ''
    return ` (${context.map(options.fn).join(' ')})`
  })
  return handlebars.compile(template, {noEscape: true})
}

exports.loadTemplate = loadTemplate
exports.templateLoader = templateLoader
