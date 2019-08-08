const { client, index, type } = require('../Service/esConnection')
const esConnection = require('../Service/esConnection')
const uuid = require('uuid')
class ConversationController {
  async CreateConversation (parties) {
    const [from, to] = parties
    let data = {}
    const params = {
      id: uuid(),
      from: from,
      to: to,
      createdAt: new Date(),
      updatedAt: new Date()
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
      data = params
    } else {
      data = conversationCount.hits.hits[0]._source
    }

    data = {
      id: data.id,
      parties: [
        data.from,
        data.to
      ],
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    }
    return data
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
      err._message = 'Conversation with this info not found'
      throw err
    } else {
      await esConnection.client.bulk({ body: messageData })
      console.log(`Indexed Message ${params.id} - ${conversationId} - ${body}`)
      params.to = conversationCount.hits.hits[0]._source.to
    }
    return params
  }

  async findUserConversation (userId = 0, offset = 0, limit = 10) {
    const conversations = []

    var body = {
      from: offset,
      size: limit,
      highlight: { fields: { text: {} } }
    }
    if (userId !== 0) {
      const query = {
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
      }
      body.query = query
    }

    const result = await client.search({
      index,
      type,
      body
    })

    if (result.hits.hits.length > 0) {
      const conversationList = result.hits.hits
      for (const i in conversationList) {
        // get last message
        const messageBody = {
          size: 1,
          sort: { updatedAt: 'desc' },
          query: {
            match_phrase_prefix: {
              conversationId: conversationList[i]._source.id
            }
          },

          highlight: { fields: { text: {} } }
        }
        let LastLimitMessages = await client.search({
          index: esConnection.indexMessage,
          type: esConnection.typeMessage,
          body: messageBody
        })

        if (LastLimitMessages.hits.hits.length >= 1) {
          LastLimitMessages = LastLimitMessages.hits.hits[0]._source
        } else {
          LastLimitMessages = {}
        }
        conversations[i] = {
          id: conversationList[i]._source.id,
          parties: [
            conversationList[i]._source.from,
            conversationList[i]._source.to
          ],
          createdAt: conversationList[i]._source.createdAt,
          updatedAt: conversationList[i]._source.updatedAt,
          LastLimitMessages: LastLimitMessages
        }
      }
    }
    return conversations
  }

  async getConversationById (id, offset = 0, limit = 10) {
    let data = {}

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
    if (conversation.hits.total > 0) {
      data = conversation.hits.hits[0]._source

      // get last LIMIT messages
      const messageBody = {
        from: offset,
        size: limit,
        sort: { updatedAt: 'desc' },
        query: {
          match_phrase_prefix: {
            conversationId: data.id
          }
        },

        highlight: { fields: { text: {} } }
      }
      let LastLimitMessages = await client.search({
        index: esConnection.indexMessage,
        type: esConnection.typeMessage,
        body: messageBody
      })

      if (LastLimitMessages.hits.hits.length >= 1) {
        LastLimitMessages = LastLimitMessages.hits.hits
      } else {
        LastLimitMessages = {}
      }

      data = {
        id: data.id,
        parties: [
          data.from,
          data.to
        ],
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        messages: LastLimitMessages.map((msg) => { return msg._source })
      }
      return data
    } else {
      const err = new Error('Conversation not found')
      err.status = 404
      err._message = 'Conversation with this info not found'
      throw err
    }
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
