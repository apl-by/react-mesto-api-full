const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const handleError = require('../errors/utils');
const { JWT_SECRET, ADMIN_ID } = require('../config/index');

const getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send(users))
    .catch((err) => handleError(err, next));
};

const getUser = (req, res, next) => {
  const { id } = req.params;
  User.findById(id).orFail()
    .then((user) => res.send(user))
    .catch((err) => handleError(err, next));
};

const getMe = (req, res, next) => {
  const id = req.user._id;
  User.findById(id).orFail()
    .then((user) => {
      const isAdmin = id === ADMIN_ID;
      res.send({ ...user._doc, isAdmin });
    })
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
  User.findByIdAndUpdate(
    ownerId,
    { name, about },
    { new: true, runValidators: true },
  )
    .orFail()
    .then((user) => res.send(user))
    .catch((err) => handleError(err, next));
};

const updateUserAvatar = (req, res, next) => {
  const ownerId = req.user._id;
  const { avatar } = req.body;
  User.findByIdAndUpdate(ownerId, { avatar }, { new: true, runValidators: true })
    .orFail()
    .then((user) => res.send(user))
    .catch((err) => handleError(err, next));
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: '7d',
      });
      res.send({ token });
    })
    .catch(next);
};

module.exports = {
  getUsers, getUser, getMe, createUser, updateUser, updateUserAvatar, login,
};
