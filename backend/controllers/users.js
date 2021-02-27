const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const handleError = require('../errors/utils');

// const getUsers = (req, res) => {
//   User.find({})
//     .then((users) => res.send(users))
//     .catch((err) => res.status(500).send({ message: err.message }));
// };  ----   ????????????????

// const getUser = (req, res) => {
//   const { id } = req.params;
//   User.findById(id).orFail()
//     .then((user) => res.send(user))
//     .catch((err) => handleSearchError(err, res, { message: 'Нет пользователя с таким id' }));
// };

const getUser = (req, res, next) => {
  const id = req.user._id;
  User.findById(id).orFail()
    .then((user) => res.send(user))
    .catch((err) => handleError(err, next));
};

const createUser = (req, res, next) => {
  const { body } = req;
  bcrypt.hash(body.password, 10)
    .then((hash) => User.create({ ...body, password: hash }))
    .then((user) => res.send({ data: `Пользователь ${user.email} создан` }))
    .catch((err) => handleError(err, next));
};

const updateUser = (req, res, next) => {
  const ownerId = req.user._id;
  const { name, about } = req.body;
  User.findByIdAndUpdate(ownerId, { name, about }, { new: true, runValidators: true })
    .then((user) => res.send(user))
    .catch((err) => handleError(err, next));
};

const updateUserAvatar = (req, res, next) => {
  const ownerId = req.user._id;
  const { avatar } = req.body;
  User.findByIdAndUpdate(ownerId, { avatar }, { new: true, runValidators: true })
    .then((user) => res.send(user))
    .catch((err) => handleError(err, next));
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, 'some-secret-key', { expiresIn: '7d' });
      res.send({ token });
    })
    .catch(next);
};

module.exports = {
  getUser, createUser, updateUser, updateUserAvatar, login,
};
