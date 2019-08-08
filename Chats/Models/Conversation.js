async function ConversationMapping (client, index, type) {
  const schema = {
    id: { type: 'text' },
    from: { type: 'text' },
    to: { type: 'text' },
    createdAt: { type: 'text' },
    updatedAt: { type: 'text' }
  }
  return client.indices.putMapping({
    index,
    type,
    body: { properties: schema }
  })
}

module.exports = {
  ConversationMapping
}
