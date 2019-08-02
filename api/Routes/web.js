const joi = require('joi')
const validate = require('koa-joi-validate')
const ApiController = require('../Controllers/ApiController')
const jwt = require('../middleware/jwt')
const webRouter = ({ router, Jwtrouter }) => {
  router.get('/', async (ctx, next) => {
    ctx.body = 'Api MicroService'
  })

  /**
   * Post /
   * Sign Up
   */
  router.post('/signup', validate({
    body: {
      email: joi.string().email().max(60).required(),
      name: joi.string().min(3).max(60)
    }
  }), async (ctx, next) => {
    ctx.body = await ApiController.signup(ctx, next)
  })

  /**
   * Get /
   * Login
   */
  router.post('/login', validate({
    body: {
      email: joi.string().email().max(60).required()

    }
  }), async (ctx, next) => {
    ctx.body = await ApiController.login(ctx, next)
  })

  /**
   * Get /
   * Find users by mail
   */
  Jwtrouter.use(jwt.middleware)

  Jwtrouter.get('/users', validate({
    query: {
      email: joi.string().email().max(60).required()
    }
  }), async (ctx, next) => {
    ctx.body = await ApiController.findUserByMail(ctx, next)
  })

  /**
   * Post /
   * Create Conversation
   */
  Jwtrouter.post('/conversation', validate({
    body: {
      with: joi.string().guid().max(36).required()
    }
  }), async (ctx, next) => {
    ctx.body = await ApiController.cerateConversation(ctx, next)
  })

  /**
   * Post /
   * Send message Message
   */
  router.post('/conversation/:id/message', validate({
    params: {
      id: joi.string().guid().max(36).required()
    },
    body: {
      body: joi.string().required()
    }
  }), async (ctx, next) => {
    ctx.body = await ApiController.CreateConversationMessage(ctx, next)
  })

  /**
   * GET /:id
   * Get a Conversation by id
   */
  router.get('/conversation/:id', validate({
    params: {
      id: joi.string().guid().max(36).required()
    },
    query: {
      offset: joi.number().integer().min(0).default(0),
      limit: joi.number().integer().min(1).default(10)
    }
  }), async (ctx, next) => {
    ctx.body = await ApiController.getConversationById(ctx, next)
  })
}
module.exports = webRouter
