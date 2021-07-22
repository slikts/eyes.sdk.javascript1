module.exports = (req, res, next) => {
  const {query, cookies, method} = req
  const requestingImage = req.url.includes('/images/') && method === 'GET';

  if (Object.keys(query).length) {
    res.cookie(query.name, query.value, query)
    return next()
  }

  if (requestingImage && !cookies['token']) {    
      return res.sendStatus(403) 
  }
  
  next()
}
  