var express = require('express');
var router = express.Router();
var auth = require('../middleware/auth')
var User = require('../models/User')
var Question = require('../models/Questions')

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});


//block user
router.post('/admin/:id/block',auth.varifyToken, async (req, res, next) => {
  let admin = await User.findById(req.users.userId)
  if (admin.isAdmin) {
    let user = await User.findById(req.params.id)
    user.isBlocked = true
    user.save()
    return res.json({ message: `${user.username} is blocked successfully ` ,user})
  }
})


//block user
router.post('/admin/:id/unblock', auth.varifyToken,async (req, res, next) => {
  let admin = await User.findById(req.users.userId)
  if (admin.isAdmin) {
    let user = await User.findById(req.params.id)
    user.isBlocked = false
    user.save()
    return res.json({ message: `${user.username} is blocked successfully ` }, user)
  }
})

//dashboard
router.get('/admin/dashboard', async (req, res, next) => {
  let blockedUser = await User.find({ isBlocked: true })
  let unBlockedUser = await User.find({isAdmin: false })
  let users = await User.find({})
  let questions = await Question.find({})
  return res.json({ blockedUser, unBlockedUser, users, questions })
})

module.exports = router;
