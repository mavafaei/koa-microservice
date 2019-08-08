
const jwt = require('jsonwebtoken')

exports.middleware = async (ctx, next) => {
  const { SECRET } = process.env
  let token = ctx.request.body.token || ctx.headers.authorization

  if (typeof token !== 'undefined') {
    token = token.replace('Bearer ', '')
    var decoded = jwt.verify(token, SECRET)
  } else {
    const err = new Error('Unauthorized')
    err.status = 401
    err._message = 'Jwt must be provide'
    throw err
  }

  if (decoded) {
    await next()
  }
}

exports.createToken = (data, expiresIn = 3000) => {
  const { SECRET } = process.env
  return jwt.sign(data, SECRET, {
    expiresIn
  })
}

exports.getUser = async (ctx, next) => {
  const { SECRET } = process.env
  let token = ctx.request.body.token || ctx.headers.authorization
  token = token.replace('Bearer ', '')
  return jwt.verify(token, SECRET)
}
