module.exports = function(ws, req, next) {
  if (req.query.token === process.env.QLWSKEY) return next();
  ws.close();
  ws.destroy();
  return;
};
