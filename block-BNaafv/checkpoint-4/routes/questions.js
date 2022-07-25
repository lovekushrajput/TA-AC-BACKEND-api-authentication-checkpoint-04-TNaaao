var express = require('express');
var router = express.Router();
var User = require('../models/User');
var Question = require('../models/Questions');
var auth = require('../middleware/auth');
var Answers = require('../models/Answers');
var slug = require('slug');
var Comment = require('../models/Comments')



// list of questions
router.get('/', auth.optionalAuthentication, async (req, res, next) => {
    let questions = await Question.find({})
    res.json({ questions })
})

router.get('/tags' ,auth.optionalAuthentication, async(req,res,next)=>{
    let question = await Question.find({})
    let arr = []
    question.map((elm)=> arr.push(elm.tags))
    res.json({tags: arr.flat()})
})


router.use(auth.varifyToken)

//create question
router.post('/', async (req, res, next) => {
    let user = await User.findById(req.users.userId)
    req.body.author = {
        _id: user._id,
        username: user.username
    }
    req.body.tags = req.body.tags.split(',')
    let question = await Question.create(req.body)

    res.json({ question })
})

//update question
router.put('/:id', async (req, res, next) => {
    let id = req.params.id
    if (req.body.title) {
        req.body.slug = slug(req.body.title, '-')
    }
    let question = await Question.findByIdAndUpdate(id, req.body, { new: true })
    res.json({ question })
})

//delete question
router.delete('/:slug', async (req, res, next) => {
    let slug = req.params.slug
    let question = await Question.findOneAndDelete({ slug: slug })
    let comment = await Comment.deleteMany({ questionId: question._id })
    res.json({ message: `succesfully deleted`, question })
})

//upvote questions
router.post('/:quesId/upvote', async (req, res, next) => {
    let questionId = req.params.quesId
    let loggedInUser = req.users.userId

    let ques = await Question.findById(questionId)
    if (ques.upvoted.includes(loggedInUser)) {
        let question = await Question.findByIdAndUpdate(questionId, { $pull: { upvoted: loggedInUser } }, { new: true })
        question.upvote = question.upvoted.length
        question.save()
        return res.json({ question })
    }

    let question = await Question.findByIdAndUpdate(questionId, { $push: { upvoted: loggedInUser } }, { new: true })
    question.upvote = question.upvoted.length
    question.save()
    return res.json({ question })
})

//comment question
router.post('/:quesId/comment', async (req, res, next) => {
    let questionId = req.params.quesId
    req.body.questionId = questionId
    let comment = await Comment.create(req.body)
    let question = await Question.findByIdAndUpdate(questionId, { $push: { commentId: comment._id } }, { new: true }).populate('commentId')
    res.json({ question })
})


//add answer
router.post('/:id/answers', async (req, res, next) => {
    let user = await User.findById(req.users.userId)
    let id = req.params.id
    req.body.questionId = id
    req.body.author = {
        _id: user._id,
        username: user.username
    }
    let answer = await Answers.create(req.body)
    res.json({ answer })
})


//list answer
router.get('/:id/answers', async (req, res, next) => {
    let answers = await Answers.find({})
    res.json({ answers })
})


//update answer
router.put('/answers/:id', async (req, res, next) => {
    let id = req.params.id
    let answer = await Answers.findByIdAndUpdate(id, req.body, { new: true })
    res.json({ answer })
})


//delete answer
router.delete('/answers/:id', async (req, res, next) => {
    let id = req.params.id
    let answer = await Answers.findByIdAndDelete(id, req.body)
    let comment = await Comment.deleteMany({ answerId: answer._id })
    res.json({ answer })
})


//upvote answer
router.post('/:ansId/upvote/answer', async (req, res, next) => {
    let questionId = req.params.ansId
    let loggedInUser = req.users.userId

    let ans = await Answers.findById(questionId)
    if (ans.upvoted.includes(loggedInUser)) {
        let answer = await Answers.findByIdAndUpdate(questionId, { $pull: { upvoted: loggedInUser } }, { new: true })
        answer.upvote = answer.upvoted.length
        answer.save()
        return res.json({ answer })
    }

    let answer = await Answers.findByIdAndUpdate(questionId, { $push: { upvoted: loggedInUser } }, { new: true })
    answer.upvote = answer.upvoted.length
    answer.save()
    return res.json({ answer })
})

//comment answer
router.post('/answer/:ansId/comment', async (req, res, next) => {
    let answerId = req.params.ansId
    req.body.answerId = answerId
    let comment = await Comment.create(req.body)
    let answer = await Answers.findByIdAndUpdate(answerId, { $push: { commentId: comment._id } }, { new: true }).populate('commentId')
    res.json({ answer })
})

module.exports = router