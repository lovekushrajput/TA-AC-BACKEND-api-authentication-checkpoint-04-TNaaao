let mongoose = require('mongoose')
let Schema = mongoose.Schema

let commentSchema = new Schema({
    body: { type: String },
    questionId: { type: Schema.Types.ObjectId, ref: 'Question' },
    answerId: { type: Schema.Types.ObjectId, ref: 'Answers' }
})

module.exports = mongoose.model('Comment', commentSchema)