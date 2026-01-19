const pool = require('../startup/db');
const { validateLogin } = require('../model/login-model');
const {
  generateAuthToken,
  generateRefreshToken,
} = require('../model/user-model');
const { setRefreshTokenCookie } = require('../../v3/middleware/setRefreshTokenCookie')
const bcrypt = require('bcryptjs');
const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  // #swagger.ignore = true
  let token, refreshToken;
  const { error } = validateLogin(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const query = {
    text: 'SELECT user_id,password,email,name,surname,"mobilePhone" FROM "users" WHERE deleted = false and email=$1',
    values: [req.body.email],
  };

  try {
    pgres = await pool.query(query);

    for await (const login of pgres.rows) {
      const validPassword = await bcrypt.compare(
        req.body.password,
        login.password,
      );
      if (validPassword) {
        token = generateAuthToken(login);
        refreshToken = generateRefreshToken(login);
        setRefreshTokenCookie(res, refreshToken);
        return res.send({ authToken: token });
      }
    }
    return res.status(401).send({ message: 'Špatné jméno nebo heslo.' });
  } catch (error) {
    return res.status(500).send(error.stack);
  }
});

module.exports = router;
