
const jwt = require('jsonwebtoken')

exports.middleware = async (ctx, next) => {
  const { SECRET } = process.env
  const token = ctx.request.body.token || ctx.headers.authorization
  var decoded = jwt.verify(token, SECRET)

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
  const token = ctx.request.body.token || ctx.headers.authorization
  return jwt.verify(token, SECRET)
}
