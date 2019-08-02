const {client, index, type} = require('../Service/esConnection')
const esConnection = require('../Service/esConnection')
const uuid = require('uuid')
class UserController {
  async CreateUser (mail, name) {
    const params = {
      id: uuid(),
      email: mail,
      name: name
    }
    let userData = []
    // Describe action
    userData.push({
      index: {
        _index: esConnection.index,
        _type: esConnection.type
      }
    })
    // Add User
    userData.push(params)
    const user = await esConnection.client.bulk({body: userData})
    console.log(`Indexed User ${params.id} - ${params.email}`)
    return user
  }
  findUserByMail (mail, offset = 0) {
    const body = {
      from: offset,
      query: {
        match: {
          email: {
            query: mail,
            operator: 'and',
            fuzziness: 'auto'
          }
        }
      },
      highlight: {fields: {text: {}}}
    }
    return client.search({
      index,
      type,
      body
    })
  }
  getUserById (id) {
    const body = {
      query: {
        match: {
          id: {
            query: id,
            operator: 'and',
            fuzziness: 'auto'
          }
        }
      },
      highlight: {fields: {text: {}}}
    }
    return client.search({
      index,
      type,
      body
    })
  }
}

module.exports = new UserController()
