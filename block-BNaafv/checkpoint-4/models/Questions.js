let mongoose = require('mongoose')
let Schema = mongoose.Schema
let slug = require('slug')

let questionSchema = new Schema({
    title: { type: String, required: true },
    author: {
        _id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        username: String
    },
    slug: String,
    description: String,
    tags: [String],
    upvoted: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    upvote: { type: Number, default: 0 },
    commentId: [{type: Schema.Types.ObjectId, ref: 'Comment'}]
}, { timestamps: true })

questionSchema.pre('save', function (next) {
    this.slug = slug(this.title, '-')
    next()
})

module.exports = mongoose.model('Question', questionSchema)