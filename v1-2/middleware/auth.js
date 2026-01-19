const jwt = require('jsonwebtoken');
module.exports = function (req, res, next) {
  const token = req.header('x-auth-token');
  if (!token)
    return res.status(401).send({ message: 'Špatný autorizační token.' });

  try {
    const decoded = jwt.verify(token, process.env.QLJWTPRIVATEKEY);
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(401).send({ message: 'Špatný autorizační token.' });
  }
};
