const { client, index, type } = require('../Service/esConnection')
const esConnection = require('../Service/esConnection')
const uuid = require('uuid')
class UserController {
  async CreateUser (mail, name) {
    const params = {
      id: uuid(),
      email: mail,
      name: name
    }
    const userData = []
    // Describe action
    userData.push({
      index: {
        _index: esConnection.index,
        _type: esConnection.type
      }
    })
    // check user unique
    const body = {
      query: {
        match_phrase_prefix: {
          email: mail
        }
      },
      highlight: { fields: { text: {} } }
    }
    const userCount = await client.search({
      index,
      type,
      body
    })
    if (userCount.hits.total === 0) {
      // Add User
      userData.push(params)
      const user = await esConnection.client.bulk({ body: userData })
      console.log(`Indexed User ${params.id} - ${params.email}`)
      if (user.errors === false) {
        return params
      }
    } else {
      const err = new Error('Email exists')
      err.status = 400
      throw err
    }
  }

  async findUserByMail (mail, offset = 0) {
    const body = {
      from: offset,
      query: {
        match_phrase_prefix: {
          email: mail
        }
      },
      highlight: { fields: { text: {} } }
    }
    const result = await client.search({
      index,
      type,
      body
    })
    console.log(result.hits)
    return result.hits.hits
  }

  async getUserById (id) {
    const body = {
      query: {
        match_phrase_prefix: {
          id: id
        }
      },
      highlight: { fields: { text: {} } }
    }
    const result = await client.search({
      index,
      type,
      body
    })
    return result.hits.hits
  }
}

module.exports = new UserController()
