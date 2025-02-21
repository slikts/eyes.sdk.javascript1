const Handlebars = require('handlebars')
const {readFileSync} = require('fs')

const getFilePath = (url, staticPath) => {
  return `${staticPath}${url}`
}

exports.create = function ({hbData, staticPath}) {
  return (req, res, next) => {
    if (!/\.hbs$/.test(req.path)) return next()
    const data = typeof hbData === 'string' ? JSON.parse(hbData) : hbData
    const filePath = getFilePath(req.path, staticPath)
    const file = readFileSync(filePath).toString()
    const compiled = Handlebars.compile(file)(data)
    res.send(compiled)
  }
}
