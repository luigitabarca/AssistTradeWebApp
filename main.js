var express = require('express');
const WsHandler = require('./wsHandler');

var app = express();

var server = app.listen(4000, () => {
    console.log('listening on port 4000');
})

app.use(express.static('public'));

wsHandler = new WsHandler(4000, 4001);

wsHandler.handleWsConnection();