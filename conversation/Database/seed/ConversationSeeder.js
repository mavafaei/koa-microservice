const fs = require('fs')
const path = require('path')
const esConnection = require('../../Service/esConnection')
class ConversationSeeder {
  async run () {
    try {
      // Clear previous ES index
      await esConnection.resetIndex('conversation')
      // Read Conversation Data

      let data = fs.readFileSync(path.join(__dirname, '/../data/mock-conversations.json'))
      data = JSON.parse(data)
      for (const i in data) {
        const { id, parties } = this.parseConversation(data[i])
        await this.inserConversationData(id, parties)
      }
    } catch (e) {
      console.log('Cannot Seed Data ... ', e.message)
    }
  }

  parseConversation (conversation) {
    const id = conversation.id
    const parties = conversation.parties

    return {
      id,
      parties
    }
  }

  async inserConversationData (id, parties) {
    const [from, to] = parties
    const conversationData = []
    // Describe action
    conversationData.push({
      index: {
        _index: esConnection.index,
        _type: esConnection.type
      }
    })
    // Add Conversation
    conversationData.push({
      id,
      from,
      to
    })
    await esConnection.client.bulk({ body: conversationData })
    console.log(`Indexed Conversation ${id} - ${from} - ${to}`)
  }
}
module.exports = new ConversationSeeder()
