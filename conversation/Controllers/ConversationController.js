const {client, index, type} = require('../Service/esConnection')
const esConnection = require('../Service/esConnection')
const uuid = require('uuid')
class ConversationController {
  async CreateConversation (parties) {
    const [from, to] = parties
    const params = {
      id: uuid(),
      from: from,
      to: to
    }
    let conversationData = []
    // Describe action
    conversationData.push({
      index: {
        _index: esConnection.index,
        _type: esConnection.type
      }
    })
    // Add Conversation
    conversationData.push(params)
    const conversation = await esConnection.client.bulk({body: conversationData})
    console.log(`Indexed Conversation ${params.id} - ${from} - ${to}`)
    return conversation
  }
  async CreateConversationMessage (conversationId, from, body) {
    const params = {
      id: uuid(),

      conversationId: conversationId,
      from: from,
      body: body,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    let messageData = []
    // Describe action
    messageData.push({
      index: {
        _index: esConnection.indexMessage,
        _type: esConnection.typeMessage
      }
    })
    // Add Message
    messageData.push(params)
    const message = await esConnection.client.bulk({body: messageData})
    console.log(`Indexed Message ${params.id} - ${conversationId} - ${body}`)
    return message
  }
  findUserConversation (userId, offset = 0, limit = 10) {
    const body = {
      from: offset,
      size: limit,
      query: {
        match: {
          from: {
            query: userId,
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
  async getConversationById (id, offset = 0, limit = 10) {
    let messages = []
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
    const conversation = await client.search({
      index,
      type,
      body
    })

    if (conversation._shards.total > 0) {
      for (let i in conversation.hits.hits) {
        let messageBody = {
          from: offset,
          size: limit,
          query: {
            match: {
              conversationId: {
                query: conversation.hits.hits[i]._source.id,
                operator: 'and',
                fuzziness: 'auto'
              }
            }
          },
          highlight: {fields: {text: {}}}
        }
        messages = await client.search({
          index: esConnection.indexMessage,
          type: esConnection.typeMessage,
          body: messageBody
        })
      }
    }

    return {conversation: conversation, messages: messages}
  }
  getConversationMessage (id, offset = 0, limit = 10) {
    const body = {
      from: offset,
      size: limit,
      query: {
        match: {
          conversationId: {
            query: id,
            operator: 'and',
            fuzziness: 'auto'
          }
        }
      },
      highlight: {fields: {text: {}}}
    }
    return client.search({
      index: esConnection.indexMessage,
      type: esConnection.typeMessage,
      body
    })
  }
}

module.exports = new ConversationController()
