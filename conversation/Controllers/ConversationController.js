const { client, index, type } = require('../Service/esConnection')
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
    const conversationData = []
    // Describe action
    conversationData.push({
      index: {
        _index: esConnection.index,
        _type: esConnection.type
      }
    })
    // Add Conversation
    conversationData.push(params)

    // check conversation unique
    const body = {
      query: {
        bool: {
          must: [
            {
              match_phrase_prefix: {
                from: from
              }
            },
            {
              match_phrase_prefix: {
                to: to
              }
            }
          ]
        }
      }
    }
    const conversationCount = await client.search({
      index,
      type,
      body
    })
    if (conversationCount.hits.total === 0) {
      // Add Conversation
      await esConnection.client.bulk({ body: conversationData })
      console.log(`Indexed Conversation ${params.id} - ${from} - ${to}`)
      return params
    } else {
      return conversationCount.hits.hits[0]._source
    }
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

    const messageData = []
    // Describe action
    messageData.push({
      index: {
        _index: esConnection.indexMessage,
        _type: esConnection.typeMessage
      }
    })
    // Add Message
    messageData.push(params)

    // check conversation exists

    const conversationBody = {
      query: {
        match_phrase_prefix: {
          id: conversationId
        }
      },
      highlight: { fields: { text: {} } }
    }

    const conversationCount = await client.search({
      index,
      type,
      body: conversationBody
    })

    if (conversationCount.hits.total === 0) {
      const err = new Error('Conversation not found')
      err.status = 404
      throw err
    } else {
      await esConnection.client.bulk({ body: messageData })
      console.log(`Indexed Message ${params.id} - ${conversationId} - ${body}`)
    }
    return params
  }

  async findUserConversation (userId, offset = 0, limit = 10) {
    const body = {
      from: offset,
      size: limit,
      query: {
        bool: {
          should: [
            {
              match_phrase_prefix: {
                from: userId
              }
            },
            {
              match_phrase_prefix: {
                to: userId
              }
            }
          ]
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

  async getConversationById (id, offset = 0, limit = 10) {
    let messages = []
    const body = {
      query: {
        match_phrase_prefix: {
          id: id
        }
      },
      highlight: { fields: { text: {} } }
    }
    const conversation = await client.search({
      index,
      type,
      body
    })

    if (conversation._shards.total > 0) {
      for (const i in conversation.hits.hits) {
        const messageBody = {
          from: offset,
          size: limit,
          query: {
            match_phrase_prefix: {
              conversationId: conversation.hits.hits[i]._source.id
            }
          },

          highlight: { fields: { text: {} } }
        }
        messages = await client.search({
          index: esConnection.indexMessage,
          type: esConnection.typeMessage,
          body: messageBody
        })
      }
    }

    return { conversation: conversation.hits.hits, messages: messages.hits.hits }
  }

  async getConversationMessage (id, offset = 0, limit = 10) {
    const body = {
      from: offset,
      size: limit,
      query: {
        match_phrase_prefix: {
          conversationId: id
        }
      },
      highlight: { fields: { text: {} } }
    }
    const result = await client.search({
      index: esConnection.indexMessage,
      type: esConnection.typeMessage,
      body
    })

    return result.hits.hits
  }
}

module.exports = new ConversationController()
