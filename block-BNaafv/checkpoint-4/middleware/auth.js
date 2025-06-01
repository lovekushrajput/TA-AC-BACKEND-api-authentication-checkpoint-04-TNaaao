let jwt = require('jsonwebtoken')

module.exports = {
    varifyToken: async (req, res, next) => {
        let token = req.headers.authorization
        try {
            if (token) {
                let payload = await jwt.verify(token, process.env.PRIVATE_KEY)
                req.users = payload
                return next()
            }
        } catch (error) {
            next(error)
        }

    },

    optionalAuthentication: async (req, res, next) => {
        let token = req.headers.authorization
        try {
            if (token) {
                let payload = await jwt.verify(token, process.env.PRIVATE_KEY)
                req.users = payload
                return next()
            } else {
                req.users = null
                next()
            }
        } catch (error) {

        }
    }
}


