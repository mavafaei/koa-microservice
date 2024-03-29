const elasticsearch = require('elasticsearch')
const User = require('../Models/User')
// Core ES variables for this project
const index = 'users'
const type = 'list'
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
async function resetIndex () {
  if (await client.indices.exists({ index })) {
    await client.indices.delete({ index })
  }
  await client.indices.create({ index })
  await User.UserMapping(client, index, type)
}

module.exports = {
  client,
  index,
  type,
  checkConnection,
  resetIndex
}
