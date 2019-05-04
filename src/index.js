const express = require('express')
const app = express()
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, getUser, getUsersInRoom, removeUser } = require('./utils/users')
const geocode = require('./utils/geocode')

const path = require('path')
const server = http.createServer(app)
const io = socketio(server)

const publicDirectorypath = path.join(__dirname, '../public')
const port = process.env.PORT || 3000

app.use(express.static(publicDirectorypath))

io.on('connection', (socket) => {
    console.log('New WebSocket connection')

    socket.on('join', ({ username, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room })

        if (error) {
            return callback(error)
        }

        socket.join(user.room)
        // Welcome message
        socket.emit('message', {message: generateMessage('Welcome!'), username: 'Mr. Robot'})
        // New user message
        socket.broadcast.to(user.room).emit('message', {message: generateMessage(`${user.username} has joined!`), username: 'Mr. Robot'})
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
    })

    // Sending message through form
    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)
        const filter = new Filter()

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed!')
        }
        io.to(user.room).emit('message', {message: generateMessage(message), username: user.username} )
        callback()
    })

    // Send Location
    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id)
        console.log(user.username)
        geocode(coords.latitude, coords.longitude, (res) => {
            io.to(user.room).emit('locationMessage', {message: generateLocationMessage(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`), username: user.username, location: res.city + ", " + res.province})
            callback()
        })
    })

    socket.on('getLocation', coords => {
        geocode(coords.latitude, coords.longitude, (res) => {
            socket.location = res.city + ", " + res.province
            console.log(socket.location)
        })
    })

    // Disconnection message
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('message', {message: generateMessage(`${user.username} has left!`), username: 'Mr. Robot'})
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
        
    })
})


server.listen(port, () => {
    console.log('Server is up on port ' + port)
})