let mongoose = require('mongoose')
let Schema = mongoose.Schema

let answerSchema = new Schema({
    text: { type: String, required: true },
    author: {
        _id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        username: String
    },
    questionId: { type: Schema.Types.ObjectId, ref: 'Questions' },
    upvoted: [{ type: Schema.Types.ObjectId, ref: 'User', }],
    upvote: { type: Number, default: 0 },
    commentId: [{ type: Schema.Types.ObjectId, ref: 'Comment' }]
}, { timestamps: true })

module.exports = mongoose.model('Answers', answerSchema)