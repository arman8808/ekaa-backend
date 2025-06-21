const http = require('http')
const app = require('./app')
const port = process.env.PORT || 5000;
const connectDb = require('./db/connection')

const server = http.createServer(app);
connectDb()


server.listen(port,() => {
    console.log("server is listen at port "+port)
})