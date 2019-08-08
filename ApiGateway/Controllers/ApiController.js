const unirest = require('unirest')
const jwt = require('../Middleware/jwt')
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
          if (typeof response.body.data !== 'undefined') {
            const token = jwt.createToken(
              { user: response.body.data },
              864000
            )
            data = {
              token: token,
              user: response.body
            }
          } else {
            data = response.body
          }
          resolve(data)
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
          resolve(response.body)
        } else if (response.error) {
          reject(response)
        }
      })
    })
  }

  async findUserById (ctx, next) {
    const { id } = ctx.request.body

    return new Promise((resolve, reject) => {
      unirest.get(`${process.env.USER_URI}/users/${id}`).headers({
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }).end((response) => {
        if (response) {
          resolve(response.body)
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
      }).send({ parties: parties }).end(async (response) => {
        if (response) {
          const data = response.body
          if (response.body.data) {
            const parties = response.body.data.parties
            const _parties = []
            for (const i in parties) {
              ctx.request.body.id = parties[i]
              const userInfo = await this.findUserById(ctx, next)
              _parties.push(userInfo.data)
            }
            data.data.parties = _parties
          }

          resolve(data)
        } else if (response.error) {
          reject(response)
        }
      })
    })
  }

  async CreateConversationMessage (ctx, next) {
    const { body, from } = ctx.request.body
    const { id } = ctx.params
    const token = ctx.request.body.token || ctx.headers.authorization

    const params = {
      body: body
    }

    if (typeof token === 'undefined') {
      params.from = from
    } else {
      const User = await jwt.getUser(ctx, next)

      params.from = User.user.id
    }

    return new Promise((resolve, reject) => {
      unirest.post(`${process.env.CHAT_URI}/conversation/${id}`).headers({
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }).send(params).end((response) => {
        if (response) {
          resolve(response.body)
        } else if (response.error) {
          reject(response)
        }
      })
    })
  }

  async getConversationList (ctx, next) {
    const { offset, limit } = ctx.request.query

    return new Promise((resolve, reject) => {
      unirest.get(`${process.env.CHAT_URI}/conversation`).headers({
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }).query({
        offset: offset,
        limit: limit
      }).end((response) => {
        if (response) {
          resolve(response.body)
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
      }).end(async (response) => {
        if (response) {
          const data = response.body
          if (response.body.data) {
            const parties = response.body.data.parties
            ctx.request.body.id = parties[1]
            const userInfo = await this.findUserById(ctx, next)
            data.data.with = userInfo.data
            delete data.data.parties
          }

          resolve(data)
        } else if (response.error) {
          reject(response)
        }
      })
    })
  }
}

module.exports = new ApiController()
