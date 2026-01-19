const {
  validateUser,
  getUser,
  saveUser,
  updateUser,
  deleteUser,
  validateParams,
} = require('../model/user-model');
const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();

//geters
router.get('/', auth, async (req, res) => {
  /*
    #swagger.tags = ['User']
    #swagger.description = 'Get all users';
    #swagger.operationId = 'getUsers';
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.responses[200] = {
      schema: {$ref: '#/definitions/UsersGet'},
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
   */
  //get users
  const user = await getUser();

  if (user.error_code)
    return res.status(user.error_code).send(user.error_message);
  res.send(user);
});

router.get('/:id', auth, async (req, res) => {
  /*
    #swagger.tags = ['User']
    #swagger.description = 'Get user by ID';
    #swagger.operationId = 'getUser';
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'User ID',
      type: 'integer',
    }
    #swagger.responses[200] = {
      schema: {$ref: '#/definitions/UserGet'},
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
   */
  const { error } = validateParams(req.params);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await getUser(req.params.id);
  if (user.error_code)
    return res.status(user.error_code).send(user.error_message);
  res.send(user[0]);
});

//seters
// router.post("/", auth, async (req, res) => {
//   const { error } = validateUser(req.body);
//   if (error) return res.status(400).send(error.details[0].message);

//   const user = await saveUser(req.body);
//   if (user.error) return res.status(500).send(user.error);

//   return res.send(user);
// });

router.put('/:id', auth, async (req, res) => {
  /*
    #swagger.tags = ['User']
    #swagger.description = 'Update user';
    #swagger.operationId = 'updateUser';
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'User ID',
      type: 'integer',
    }
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'User data',
      schema: {$ref: '#/definitions/UserUpdate'},

    }
    #swagger.responses[200] = {
      schema: {$ref: '#/definitions/UserGet'},
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
   */
  let { error: idError } = validateParams(req.params);
  if (idError) return res.status(400).send(idError.details[0].message);

  let { error: userError } = validateUser(req.body);
  if (userError) return res.status(400).send(userError.details[0].message);

  const user = await updateUser(req.params.id, req.body);
  if (user.error_code)
    return res.status(user.error_code).send(user.error_message);
  return res.send(user);
});

//delete
router.delete('/:id', auth, async (req, res) => {
  /*
    #swagger.tags = ['User']
    #swagger.description = 'Delete user';
    #swagger.operationId = 'deleteUser';
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.responses[200] = {
      schema: {$ref: '#/definitions/UserDelete'},
    } 
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
   */
  const { error } = validateParams(req.params);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await deleteUser(req.params.id);

  if (user.error_code)
    return res.status(user.error_code).send(user.error_message);
  return res.send(user);
});

module.exports = router;
