const unirest = require('unirest')

async function send (message) {
  const params = {
    text: `new message from ${message.fromUser.data.name} to  ${message.toUser.data.name} with this content => ${message.body}`
  }

  return new Promise((resolve, reject) => {
    unirest.post(`${process.env.SLACK_URL}`).headers({
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }).send(params).end((response) => {
      if (response) {
        resolve(response.body)
      } else if (response.error) {
        reject(response)
      }
    })
  })
}

module.exports = {
  send
}
