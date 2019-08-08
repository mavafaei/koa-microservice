async function ConversationMapping (client, index, type) {
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

module.exports = {
  ConversationMapping
}
