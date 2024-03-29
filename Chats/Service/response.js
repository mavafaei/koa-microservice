module.exports = function (options = {}) {
  const custom = options.custom
  if (custom && (typeof custom !== 'function')) {
    throw new TypeError('`custom` should be a function that return an object')
  }

  return async function koaRes (ctx, next) {
    try {
      await next()
      if (ctx._returnRaw) {
        return
      }

      const code = ctx.status
      const data = ctx.body
      if (ctx.method.toLowerCase !== 'option' && code !== 404) {
        ctx.body = {
          data: data
        }
        if (custom) {
          Object.assign(ctx.body, custom(ctx))
        }
        ctx.status = code
      }
    } catch (e) {
      ctx.app.emit('error', e, ctx)

      ctx.status = e.status || e.statusCode || 500
      ctx.body = {
        error: {
          status: ctx.status,
          title: e.message || e,
          message: e.message || e,
          info: e.stack || e
        }

      }
      if (custom) {
        Object.assign(ctx.body, custom(ctx))
      }

      if (!options.debug) {
        delete ctx.body.info
      }
    }
  }
}
