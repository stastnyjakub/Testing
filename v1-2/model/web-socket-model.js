const WebSocket = require('ws');
const port = process.env.PORT || 3000;

module.exports = async (data) => {
  if (process.env.NODE_ENV === 'test') return;
  const socket = new WebSocket(
    `ws://0.0.0.0:${port}/api/notification?token=${process.env.QLWSKEY}`,
  );

  socket.onopen = function () {
    socket.send(JSON.stringify(data));
    //socket.close();
  };
};
