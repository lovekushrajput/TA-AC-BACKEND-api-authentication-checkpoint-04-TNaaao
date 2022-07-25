var express = require('express');
var router = express.Router();
var User = require('../models/User')
var auth = require('../middleware/auth')

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

//register
router.post('/register', async (req, res, next) => {
  try {
    let user = await User.create(req.body)
    let token = await user.signToken()
    return res.json({ user: user.userJSON(token) })
  } catch (error) {
    next(error)
  }
})

//login
router.post('/login', async (req, res, next) => {
  let { email, password } = req.body

  
  if (!email && !password) {
    return res.json({ error: "Email/Password is required" })
  }

  let user = await User.findOne({ email })

  if (!user) {
    return res.json({ error: 'Invalid Email' })
  }

  //varify password
  let result = await user.varifyPassword(password)

  if (!result) {
    return res.json({ error: 'Invalid Password' })
  }

  if (user.isBlocked) {
    return res.status(400).json('Sorry You can`t Login ,you are blocked')
  }
  //generate the token
  let token = await user.signToken()
  res.json({ user: user.userJSON(token) })

})

//profile
router.get('/profile/:username', auth.optionalAuthentication, async (req, res, next) => {
  let username = req.params.username
  let profile = await User.findOne({ username: username }, 'name username image bio following isBlocked')

  if (profile.isBlocked) {
    return res.status(400).json('You are blocked')
  }
  //if user is login
  if (req.users) {
    let loggedInUser = await User.findById(req.users.userId)
    //if loggedInUser follow the username
    if (loggedInUser.follow.includes(profile._id)) {
      //return following as true
      profile.following = true
      return res.json({ profile })
    } else {
      return res.json({ json })
    }

    //if users is not logged In
  } else {
    res.json({ profile })
  }
})

//authentication
router.use(auth.varifyToken)


//current user
router.get('/current-user', async (req, res, next) => {
  let id = req.users.userId
  let user = await User.findById(id)
  let token = await user.signToken()
  res.json({ user: user.userJSON(token) })
})

//update profile
router.put('/profile/:username', async (req, res, next) => {
  let username = req.params.username
  let profile = await User.findOneAndUpdate({ username: username }, req.body, { new: true })


  if (!profile) {
    res.json({ error: `${username} is not Found` })
  }
  return res.redirect('/api/users/profile/' + username)
})

//follow user
router.post('/:username/follow', async (req, res, next) => {
  let username = req.params.username
  let loggedInUser = req.users.userId

  try {
    let followedUser = await User.findOne({ username })

    //no followed user
    if (!followedUser) {
      return res.status(400).json({ error: `${username} is not found` })
    }

    // checking loggedInUser and followed user are not same
    if (followedUser._id.equals(loggedInUser)) {
      return res.status(400).json({ error: 'You Can`t follow Yourself' })
    }

    //checking if user is alredy followed or not
    if (followedUser.follow.includes(loggedInUser)) {
      return res.json({ error: `You Have already followed ${username}` })
    }

    //finally followed
    let usr = await User.findOneAndUpdate({ username }, { $push: { follow: loggedInUser } }, { new: true })
    usr.following = true

    let user = {
      name: usr.name,
      username: usr.username,
      email: usr.email,
      bio: usr.bio,
      following: usr.following
    }
    res.json({ user })

  } catch (error) {
    next(error)
  }
})


//unfollow
router.delete('/:username/follow', async (req, res, next) => {
  let username = req.params.username
  let loggedInUser = req.users.userId

  try {
    let unfollowedUser = await User.findOne({ username })

    // //no followed user
    if (!unfollowedUser) {
      return res.status(400).json({ error: `${username} is not found` })
    }
    //checking loggedInUser and followed user are not same
    if (unfollowedUser._id.equals(loggedInUser)) {
      return res.status(400).json({ error: 'You Can`t unfollow Yourself' })
    }

    //checking if user is alredy followed or not
    if (unfollowedUser.follow.includes(loggedInUser)) {
      //finally unfollowed
      let usr = await User.findOneAndUpdate({ username }, { $pull: { follow: loggedInUser } }, { new: true })
      usr.following = false

      let user = {
        name: usr.name,
        username: usr.username,
        email: usr.email,
        bio: usr.bio,
        following: usr.following
      }
      res.json({ user })
    }

    return res.json({ error: `You Have already unfollowed ${username}` })

  } catch (error) {
    next(error)
  }
})

module.exports = router;
