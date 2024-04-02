const express = require('express')
const config = require('config')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')


const PORT = config.get("port") || 5000
const app = express()

app.use(bodyParser.json());
app.use('/code', require('./routes/code.route'))
app.use('/auth', require('./routes/auth.route'))


async function start() {
    try{
        await mongoose.connect(config.get('mongoURi'), {
            // useUnifiedTopology: true,
            // useNewUrlParser: true,
        })
        app.listen(5000, () => {
            console.log(`app has been started on port ${PORT}`)
        })
    } catch (error) {
        console.log('Server Error', error)
        process.exit(1)
    }
}
start()

