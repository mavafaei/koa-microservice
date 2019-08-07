const unirest = require('unirest')
const jwt = require('../middleware/jwt')

class ApiController {
  async signup (ctx, next) {
    const { email, name } = ctx.request.body

    const params = {
      email: email,
      name: name
    }
    return new Promise((resolve, reject) => {
      unirest.post(`${process.env.USER_URI}/users`).headers({
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }).send(params).end((response) => {
        if (response) {
          ctx.status = response.status
          resolve(response.body)
        } else if (response.error) {
          reject(response)
        }
      })
    })
  }

  async login (ctx, next) {
    const { email } = ctx.request.body

    return new Promise((resolve, reject) => {
      unirest.get(`${process.env.USER_URI}/users`).headers({
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }).query({
        email: email
      }).end((response) => {
        if (response) {
          let data = {}

          if (response.body.data.length === 1) {
            const token = jwt.createToken(
              { user: response.body.data[0]._source },
              864000
            )
            data = {
              token: token,
              user: response.body.data[0]
            }
            ctx.status = response.status
            resolve(data)
          } else {
            data = {
              status: 404,
              result: 'User not found'

            }
            ctx.status = 404
            resolve(data)
          }
        } else if (response.error) {
          reject(response)
        }
      })
    })
  }

  async findUserByMail (ctx, next) {
    const { email } = ctx.request.query
    return new Promise((resolve, reject) => {
      unirest.get(`${process.env.USER_URI}/users`).headers({
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }).query({
        email: email
      }).end((response) => {
        if (response) {
          let data = {}

          if (response.body.data.length === 1) {
            ctx.status = response.status
            resolve(response.body)
          } else {
            data = {
              status: 404,
              result: 'User not found'

            }
            ctx.status = 404
            resolve(data)
          }
        } else if (response.error) {
          reject(response)
        }
      })
    })
  }

  async cerateConversation (ctx, next) {
    const withUser = ctx.request.body.with

    const User = await jwt.getUser(ctx, next)

    const parties = []
    parties.push(User.user.id, withUser)

    return new Promise((resolve, reject) => {
      unirest.post(`${process.env.CHAT_URI}/conversation`).headers({
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }).send({ parties: parties }).end((response) => {
        if (response) {
          const data = {
            status: 200,
            result: response.body
          }
          ctx.status = response.status
          resolve(data)
        } else if (response.error) {
          reject(response)
        }
      })
    })
  }

  async CreateConversationMessage (ctx, next) {
    const { body } = ctx.request.body
    const { id } = ctx.params

    const User = await jwt.getUser(ctx, next)
    const params = {
      from: User.user.id,
      body: body
    }

    return new Promise((resolve, reject) => {
      unirest.post(`${process.env.CHAT_URI}/conversation/${id}/message`).headers({
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }).send(params).end((response) => {
        if (response) {
          const data = {
            status: 200,
            result: response.body
          }
          ctx.status = response.status
          resolve(data)
        } else if (response.error) {
          reject(response)
        }
      })
    })
  }

  async getConversationById (ctx, next) {
    const { id } = ctx.params
    const { offset, limit } = ctx.query

    return new Promise((resolve, reject) => {
      unirest.get(`${process.env.CHAT_URI}/conversation/${id}`).headers({
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }).query({
        offset: offset,
        limit: limit
      }).end((response) => {
        if (response) {
          const data = {
            status: 200,
            result: response.body
          }
          ctx.status = response.status
          resolve(data)
        } else if (response.error) {
          reject(response)
        }
      })
    })
  }
}

module.exports = new ApiController()
