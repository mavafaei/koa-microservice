require('dotenv').config()
const Koa = require('koa')
const Router = require('koa-router')
var bodyParser = require('koa-bodyparser')
const app = new Koa()
const router = new Router()
const Jwtrouter = new Router()

app.use(bodyParser())

// load routs
require('./Routes/web')({ router, Jwtrouter })

app.use(async (ctx, next) => {
  const start = Date.now()
  await next()
  const ms = Date.now() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}`)
})

app.use(async (ctx, next) => next().catch((err) => {
  if (err.message) {
    ctx.status = 400
    ctx.body = {
      status: 400,
      message: err.message
    }
  } else {
    ctx.status = 500
    ctx.body = {
      status: 500,
      message: 'Internal Server Error'
    }
  }
}))

app.use(async function (ctx, next) {
  ctx.set('Access-Control-Allow-Origin', '*')
  await next()
})

const port = process.env.PORT || 4000

app
  .use(router.routes())
  .use(router.allowedMethods())
  .use(Jwtrouter.routes())
  .use(Jwtrouter.allowedMethods())

app.listen(port, err => {
  if (err) throw err
  console.log(`App Listening on Port ${port}`)
})
