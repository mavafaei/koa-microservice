
async function UserMapping (client, index, type) {
  const schema = {
    id: { type: 'text' },
    name: { type: 'text' },
    email: { type: 'text' },
    createdAt: { type: 'keyword' }
  }
  return client.indices.putMapping({
    index,
    type,
    body: { properties: schema }
  })
}

module.exports = {
  UserMapping
}
