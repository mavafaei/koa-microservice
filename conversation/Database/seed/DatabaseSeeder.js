const ConversationSeeder = require('./ConversationSeeder')
const MessageSeeder = require('./MessageSeeder')

async function run () {
  await ConversationSeeder.run()
  await MessageSeeder.run()
}
run()
