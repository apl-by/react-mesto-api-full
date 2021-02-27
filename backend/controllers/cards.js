const Card = require('../models/card');
const handleError = require('../errors/utils');
const ForbiddenError = require('../errors/ForbiddenError');

const getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.send(cards.reverse()))
    .catch((err) => handleError(err, next));
};

const createCard = (req, res, next) => {
  const { _id } = req.user;
  const { name, link } = req.body;
  Card.create({ name, link, owner: _id })
    .then((card) => res.send(card))
    .catch((err) => handleError(err, next));
};

const deleteCard = (req, res, next) => {
  const { cardId } = req.params;
  if (req.body.owner !== req.user._id) {
    return next(new ForbiddenError('Нельзя удалить чужую карточку'));
  }
  return Card.findByIdAndRemove(cardId).orFail()
    .then(() => res.send({ message: 'Карточка удалена' }))
    .catch((err) => handleError(err, next));
};

const likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .orFail()
    .then((card) => res.send(card))
    .catch((err) => handleError(err, next));
};

const dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .orFail()
    .then((card) => res.send(card))
    .catch((err) => handleError(err, next));
};

module.exports = {
  getCards, createCard, deleteCard, likeCard, dislikeCard,
};
