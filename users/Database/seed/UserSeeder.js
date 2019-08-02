const fs = require('fs')
const path = require('path')
const esConnection = require('../../Service/esConnection')
class UserSeeder {
  async run () {
    try {
      // Clear previous ES index
      await esConnection.resetIndex()
      // Read Users Data

      let data = fs.readFileSync(path.join(__dirname, '/../data/mock-users.json'))
      data = JSON.parse(data)
      for (let i in data) {
        const {id, name, email} = this.parseUser(data[i])
        await this.inserUserData(id, name, email)
      }
    } catch (e) {
      console.log('Cannot Seed Data ... ', e.message)
    }
  }
  parseUser (user) {
    const id = user.id
    const name = user.name
    const email = user.email

    return {
      id,
      name,
      email
    }
  }

  async inserUserData (id, name, email) {
    let userData = []
    // Describe action
    userData.push({
      index: {
        _index: esConnection.index,
        _type: esConnection.type
      }
    })
    // Add User
    userData.push({
      id,
      name,
      email
    })
    await esConnection.client.bulk({body: userData})
    console.log(`Indexed User ${id} - ${email}`)
  }
}
module.exports = new UserSeeder()
