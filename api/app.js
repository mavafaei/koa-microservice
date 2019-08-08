require('dotenv').config()
const Koa = require('koa')
const Router = require('koa-router')
var bodyParser = require('koa-bodyparser')

// generate new app
const app = new Koa()
const router = new Router()
const Jwtrouter = new Router()
app.use(bodyParser())
app.use(async (ctx, next) => {
  const start = Date.now()
  await next()
  const ms = Date.now() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}`)
})

// load routs
require('./Routes/web')({ router, Jwtrouter })

app.use(router.routes())
  .use(router.allowedMethods())
  .use(Jwtrouter.routes())
  .use(Jwtrouter.allowedMethods())

app.use(async function (ctx, next) {
  ctx.set('Access-Control-Allow-Origin', '*')
  await next()
})
app.use(async (ctx, next) => {
  try {
    await next()

    if (ctx.status === 404) { ctx.throw(ctx.status) }
  } catch (e) {
    ctx.status = e.status
    ctx.body =
      {
        code: e.status,
        message: e.message
      }
  }
})

const port = process.env.PORT || 4000

app.listen(port, err => {
  if (err) throw err
  console.log(`App Listening on Port ${port}`)
})
