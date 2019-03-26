const express = require('express')
const app = express()
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')

const path = require('path')
const server = http.createServer(app)
const io = socketio(server)

const publicDirectorypath = path.join(__dirname, '../public')
const port = process.env.PORT || 3000

app.use(express.static(publicDirectorypath))

let count = 0

io.on('connection', (socket) => {
    console.log('New WebSocket connection')

    // Welcome message
    socket.emit('message', generateMessage('Welcome!'))
    
    // New user message
    socket.broadcast.emit('message', generateMessage('A new user has joined!'))

    // Sending message through form
    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter()

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed!')
        }
        io.emit('message', generateMessage(message))
        callback()
    })

    // Send Location
    socket.on('sendLocation', (coords, callback) => {
        io.emit('locationMessage', generateLocationMessage(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })

    // Disconnection message
    socket.on('disconnect', () => {
        io.emit('message', generateMessage('A user has left!'))
    })
})


server.listen(port, () => {
    console.log('Server is up on port ' + port)
})