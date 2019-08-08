
async function MessageMapping (client, index, type) {
  const schema = {
    id: { type: 'text' },
    conversationId: { type: 'text' },
    from: { type: 'text' },
    body: { type: 'text' },
    createdAt: { type: 'keyword' },
    updatedAt: { type: 'keyword' }
  }
  return client.indices.putMapping({
    index: index,
    type: type,
    body: { properties: schema }
  })
}

module.exports = {
  MessageMapping
}
