const wsauth = require("../middleware/wsauth");
const express = require("express");
const router = express.Router();
const expressWs = require("express-ws")(router);
clients = [];

router.ws("/", wsauth, async (ws, req) => {
  ws.on("error", function(err) {
    console.log(err);
  });

  clients.push(ws);

  ws.on("open", function open() {
    console.log("connected");
    ws.send(Date.now());
  });

  ws.on("close", function close() {
    clients.splice(clients.indexOf(ws), 1);
    //console.log("disconnected", clients.length);
  });

  ws.on("message", function(message) {
    clients.forEach(function(client) {
      client.send(message);
    });
  });
});

module.exports = router;
