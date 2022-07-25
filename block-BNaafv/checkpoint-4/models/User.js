let mongoose = require('mongoose')
let Schema = mongoose.Schema
let jwt = require('jsonwebtoken')
let bcrypt = require('bcrypt')

let userschema = new Schema({
    name: String,
    username: { type: String, required: true, unique: true },
    bio: String,
    image: String,
    isAdmin: { type: Boolean, default: false },
    email: { type: String, unique: true, required: true },
    following: { type: Boolean, default: false },
    follow: [String],
    password: { type: String, required: true },
    isBlocked: { type: Boolean, default: false }
})

//hashing the password
userschema.pre('save', async function (next) {
    let adminEmail = [
        'lovekushrazput143@gmail.com'
    ]

    //checking Admin
    if (adminEmail.includes(this.email)) {
        this.isAdmin = true
    }
    try {
        if (this.password && this.isModified('password')) {
            let hash = await bcrypt.hash(this.password, 10)
            this.password = hash
            return next()
        } else {
            next()
        }
    } catch (error) {
        console.log(error);
    }
})

//varify password
userschema.methods.varifyPassword = async function (password) {
    try {
        let result = await bcrypt.compare(password, this.password)
        return result
    } catch (error) {
        console.log(error);
    }

}
//generating the token
userschema.methods.signToken = async function () {
    let payload = {
        userId: this._id,
        email: this.email,
    }

    try {
        let token = await jwt.sign(payload, process.env.PRIVATE_KEY)
        return token
    } catch (error) {
        console.log(error)
    }
}


//returning the user
userschema.methods.userJSON = function (token) {
    return {
        token: token,
        email: this.email,
        username: this.username
    }
}

module.exports = mongoose.model('User', userschema)