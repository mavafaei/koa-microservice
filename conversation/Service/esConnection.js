const elasticsearch = require('elasticsearch')
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

  await ConversationMapping()
  await MessageMapping()
}

/** Add  section schema mapping to ES */
async function ConversationMapping () {
  const schema = {
    id: { type: 'text' },
    from: { type: 'text' },
    to: { type: 'text' }
  }
  return client.indices.putMapping({
    index,
    type,
    body: { properties: schema }
  })
}

async function MessageMapping () {
  const schema = {
    id: { type: 'text' },
    conversationId: { type: 'text' },
    from: { type: 'text' },
    body: { type: 'text' },
    createdAt: { type: 'text' },
    updatedAt: { type: 'text' }
  }
  return client.indices.putMapping({
    index: indexMessage,
    type: typeMessage,
    body: { properties: schema }
  })
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
