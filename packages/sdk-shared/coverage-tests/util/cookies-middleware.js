let counter = 0;

module.exports = (req, res, next) => {
  const {query, cookies, method} = req
  counter++;

  console.log('url', req.url, 'cookies', cookies)

  if (req.url.includes('/images/')) {
    if (method === 'GET' && !cookies['token']) {
      console.log('blocking cookie', counter, req.path)
      return res.sendStatus(403)
    }
  }

  if (Object.keys(query).length) {
    console.log('sending cookie', counter)
    res.cookie(query.name, query.value, query)
  }

  
  next()
}
  