require('dotenv').config()
const Koa = require('koa')
const genres = require('./Service/response')
const Router = require('koa-router')
const bodyParser = require('koa-bodyparser')

// generate new app
const app = new Koa()

const router = new Router()
app.use(bodyParser())
app.use(genres({ debug: process.env.NODE_ENV === 'development' }))
app.use(async (ctx, next) => {
  console.log(ctx.request.body)
  const start = Date.now()
  await next()
  const ms = Date.now() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}`)
})

// load routes
require('./Routes/web')({ router })

app.use(router.routes()).use(router.allowedMethods())

app.use(async function (ctx, next) {
  ctx.set('Access-Control-Allow-Origin', '*')
  await next()
})

app.use(async (ctx, next) => {
  try {
    await next()

    if (ctx.status === 404) { ctx.throw(ctx.status) }
  } catch (e) {
    ctx._returnRaw = true
    ctx.status = e.status
    ctx.body = {
      error: {
        status: e.status,
        title: 'Not Found',
        message: e.message
      }
    }
    // ctx.body =
    //   {

    //     code: e.status,
    //     message: e.message
    //   }
  }
})

const port = process.env.PORT || 3000
app.listen(port, err => {
  if (err) throw err
  console.log(`App Listening on Port ${port}`)
})
