const ApiController = require('../Controllers/ApiController')
module.exports = {
  start: function (io, ctx, next) {
    io.on('connection', function (socket) {
      console.log('Socket Connection successfully')
      // login socket
      socket.on('login', async (msg) => {
        ctx.request.body = msg

        const result = await ApiController.login(ctx, next)
        if (result.user.code === 200) {
          io.emit('login-success', 'user login successfully')
        } else {
          io.emit('login-failed', 'user login Failed')
        }
      })
      // Send message
      socket.on('message', async (msg) => {
        ctx.request.body = msg
        ctx.params = msg

        const result = await ApiController.CreateConversationMessage(ctx, next)

        if (result.code === 200) {
          io.emit('send-success', result.data)
        } else {
          io.emit('send-failed', 'send message Failed')
        }
      })
    })
  }
}
