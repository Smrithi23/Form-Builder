const express = require('express')
const userRouter = require('./Routers/user.js')
const formRouter = require('./Routers/form.js')
require('./db/mongoose.js')

const path = require('path')  // core npm module
const hbs = require('hbs')

//Define paths for Express config
const viewsPath = path.join(__dirname, './templates/views')
const partialsPath = path.join(__dirname, './templates/partials')
const publicDirectoryPath = path.join(__dirname, './public')

const app = express()
const port = 3000

//Setup handlebars engine and views location
app.set('view engine', 'hbs')
app.set('views', viewsPath)
app.use(express.static(publicDirectoryPath))
hbs.registerPartials(partialsPath)

app.use(express.json())
app.use(userRouter)
app.use(formRouter)

app.listen(port, () => {
    console.log('Server is up on port ' + port)

})