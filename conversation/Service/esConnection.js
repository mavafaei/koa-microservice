const elasticsearch = require('elasticsearch')
const Message = require('../Models/Message')
const Conversation = require('../Models/Conversation')

// Core ES variables for this project
const index = 'conversation'
const type = 'list'
const typeMessage = 'messageList'
const indexMessage = 'message'
const port = process.env.ES_PORT || 9200
const host = process.env.ES_HOST || 'localhost'
const client = new elasticsearch.Client({
  host: {
    host,
    port
  }
})

/** Check the ES connection status */
async function checkConnection () {
  let isConnected = false
  while (!isConnected) {
    console.log('Connecting to ES')
    try {
      const health = await client.cluster.health({})
      console.log('Connection Successfully', health)
      isConnected = true
    } catch (err) {
      console.log('Connection Failed, Retrying...', err)
    }
  }
}

/** Clear the index, recreate it, and add mappings */
async function resetIndex (name) {
  if (await client.indices.exists({ index: name })) {
    await client.indices.delete({ index: name })
  }
  await client.indices.create({ index: name })

  await Message.MessageMapping(client, indexMessage, typeMessage)
  await Conversation.ConversationMapping(client, index, type)
}

module.exports = {
  client,
  index,
  indexMessage,
  type,
  typeMessage,
  checkConnection,
  resetIndex

}
