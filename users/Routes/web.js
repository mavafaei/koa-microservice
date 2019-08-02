const joi = require('joi')
const validate = require('koa-joi-validate')
const UserController = require('../Controllers/UserController')

const webRouter = ({router}) => {
  router.get('/', async (ctx, next) => {
    ctx.body = 'User MicroService'
  })

  /**
   * Post /
   * Create New User
   */
  router.post('/users', validate({
    body: {
      email: joi.string().email().max(60).required(),
      name: joi.string().min(3).max(60)
    }
  }), async (ctx, next) => {
    const {email, name} = ctx.request.body
    ctx.body = await UserController.CreateUser(email, name)
  })

  /**
   * GET /search
   * Search for a term in the Users
   */
  router.get('/users', validate({
    query: {
      email: joi.string().email().max(60).required(),
      offset: joi.number().integer().min(0).default(0)
    }
  }), async (ctx, next) => {
    const {email, offset} = ctx.request.query
    ctx.body = await UserController.findUserByMail(email, offset)
  })

  /**
   * GET /:id
   * Get a user by id
   */
  router.get('/users/:id', validate({
    type: 'json',
    params: {
      id: joi.string().guid().max(36).required()
    }
  }), async (ctx, next) => {
    const id = ctx.params.id

    ctx.body = await UserController.getUserById(id)
  })
}
module.exports = webRouter
