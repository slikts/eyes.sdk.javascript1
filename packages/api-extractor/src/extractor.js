const fs = require('fs')
const path = require('path')
const typedoc = require('typedoc')
const prettier = require('prettier')
const dts = require('./dts')

function build({entry, out, tsconfig}) {
  const cwd = process.cwd()
  const td = new typedoc.Application()
  td.options.addReader(new typedoc.TSConfigReader())
  td.bootstrap({
    entryPoints: [path.resolve(cwd, entry)],
    tsconfig: path.resolve(cwd, tsconfig),
    disableSources: true,
    readme: 'none',
    categorizeByGroup: false,
    excludeInternal: true,
    excludeProtected: true,
    excludePrivate: true,
  })

  let context = null
  td.converter.on(typedoc.Converter.EVENT_CREATE_PARAMETER, ctx => {
    context = ctx
  })

  const project = td.convert()

  const string = dts(project, context)

  fs.writeFileSync(
    path.resolve(cwd, out),
    prettier.format(string, {
      parser: 'typescript',
      printWidth: 120,
      singleQuote: true,
      semi: false,
      bracketSpacing: false,
      trailingComma: 'all',
    }),
  )
}

module.exports = build
