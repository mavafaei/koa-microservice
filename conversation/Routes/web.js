const joi = require('joi')
const validate = require('koa-joi-validate')
const ConversationController = require('../Controllers/ConversationController')

const webRouter = ({ router }) => {
  router.get('/', async (ctx, next) => {
    ctx.body = 'Conversation MicroService'
  })

  /**
   * Post /
   * Create New Conversation
   */
  router.post('/conversation', validate({
    body: {
      parties: joi.array().min(2).required().items(joi.string().guid().max(36).required())
    }
  }), async (ctx, next) => {
    const { parties } = ctx.request.body
    ctx.body = await ConversationController.CreateConversation(parties)
  })

  /**
   * Post /
   * Create New Conversation Message
   */
  router.post('/conversation/:id/message', validate({
    params: {
      id: joi.string().guid().max(36).required()
    },
    body: {
      from: joi.string().guid().max(36).required(),
      body: joi.string().required()
    }
  }), async (ctx, next) => {
    const { body, from } = ctx.request.body
    const { id } = ctx.params
    ctx.body = await ConversationController.CreateConversationMessage(id, from, body)
  })

  /**
   * Get /
   * Get Conversation Message
   */
  router.get('/conversation/:id/message', validate({
    params: {
      id: joi.string().guid().max(36).required()
    },
    query: {
      offset: joi.number().integer().min(0).default(0),
      limit: joi.number().integer().min(1).default(10)
    }
  }), async (ctx, next) => {
    const { offset, limit } = ctx.query
    const { id } = ctx.params
    ctx.body = await ConversationController.getConversationMessage(id, offset, limit)
  })

  /**
   * GET /conversation?offset&limit&userId
   * Search for a term in the Users
   */
  router.get('/conversation', validate({
    query: {
      userId: joi.string().guid().max(36).required(),
      offset: joi.number().integer().min(0).default(0),
      limit: joi.number().integer().min(1).default(10)
    }
  }), async (ctx, next) => {
    const { userId, offset, limit } = ctx.request.query
    ctx.body = await ConversationController.findUserConversation(userId, offset, limit)
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
    const { id } = ctx.params
    const { offset, limit } = ctx.query

    ctx.body = await ConversationController.getConversationById(id, offset, limit)
  })
}
module.exports = webRouter
