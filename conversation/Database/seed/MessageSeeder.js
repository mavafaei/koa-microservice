const fs = require('fs')
const path = require('path')
const esConnection = require('../../Service/esConnection')
class MessageSeeder {
  async run () {
    try {
      // Clear previous ES index
      await esConnection.resetIndex('message')
      // Read Message Data
      //
      let data = fs.readFileSync(path.join(__dirname, '/../data/mock-messages.json'))
      data = JSON.parse(data)
      for (const i in data) {
        const { id, conversationId, from, body, created_at, updated_at } = this.parseMessages(data[i])
        await this.inserMessageData(id, conversationId, from, body, created_at, updated_at)
      }
    } catch (e) {
      console.log('Cannot Seed Data ... ', e.message)
    }
  }

  parseMessages (message) {
    const id = message.id
    const conversationId = message.conversationId
    const from = message.from
    const body = message.body
    const createdAt = message.createdAt
    const updatedAt = message.updatedAt

    return {
      id,
      conversationId,
      from,
      body,
      createdAt,
      updatedAt
    }
  }

  async inserMessageData (id, conversationId, from, body, createdAt, updatedAt) {
    const messageData = []
    // Describe action
    messageData.push({
      index: {
        _index: esConnection.indexMessage,
        _type: esConnection.typeMessage
      }
    })
    // Add Message
    messageData.push({
      id,
      conversationId,
      from,
      body,
      createdAt,
      updatedAt
    })
    await esConnection.client.bulk({ body: messageData })
    console.log(`Indexed Message ${id} - ${conversationId} - ${body}`)
  }
}
module.exports = new MessageSeeder()
