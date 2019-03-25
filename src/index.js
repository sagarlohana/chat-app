
const express = require('express')
const app = express()
const http = require('http')
const socketio = require('socket.io')

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
    socket.emit('message', 'Welcome!')
    
    // New user message
    socket.broadcast.emit('message', 'A new user has joined!')

    // Sending message through form
    socket.on('sendMessage', (message) => {
        io.emit('message', message)
    })

    // Send Location
    socket.on('sendLocation', (coords) => {
        io.emit('message', `https://google.com/maps?q=${coords.latitude},${coords.longitude}` )
    })

    // Disconnection message
    socket.on('disconnect', () => {
        io.emit('message', 'A user has left!')
    })
})


server.listen(port, () => {
    console.log('Server is up on port ' + port)
})