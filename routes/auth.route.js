const {Router} = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const config = require('config')
const {check, validationResult} = require('express-validator')
const User = require('../models/User')
const router = Router()

// /api.auth/register
router.post(
    '/register',
    [
        check('email', 'Invalid email').isEmail(),
        check('password', "Must be more then 6 simvols"). isLength({ min: 6 })
    ],
    async (req, res) => {
        res.header("Access-Control-Allow-Origin", "*");
        try{
            const errors = validationResult(req)

            if(!errors.isEmpty()) {
                return res.status(400).json({
                    errors: errors.array(),
                    message: "Invalid data in time of registrtation"
                })
            }

            const {email, password} = req.body

            const candidate = await User.findOne({ email })

            if(candidate) {
                console.log('candidate', candidate)
                return res.status(400).json({message: 'Email is alredy exists'})
            }

            const hashedPassword = await bcrypt.hash(password, 12)
            const user = new User({email, password:hashedPassword})

            await user.save()

            res.status(201).json({message: "User is created successfully"})


        } catch (error) {
            console.log('error', error)
            res.status(500).json({message: 'Something went wrong, try again'})
        }
    }
)

// /api.auth/login
router.post(
    '/login',
    [
        check('email', 'Please get valid email').normalizeEmail().isEmail(),
        check('password', 'Please get password').exists()
    ],
    async (req, res) => {
        res.header("Access-Control-Allow-Origin", "*");
        try{
            const errors = validationResult(req)

            if(!errors.isEmpty()) {
                return res.status(400).json({
                    errors: errors.array(),
                    message: 'Invalid data in time of login'
                })
            }

            const {email, password} = req.body
            const user = await User.findOne({ email })

            if(!user) {
                return res.status(400).json({message: 'Has not such user'})
            }

            const isMatch = bcrypt.compare(password, user.password)

            if (!isMatch) {
                return res.status(400).json({ message: 'Wrong password, try again'})
            }

            const token = jwt.sign(
                {userId: user.id},
                config.get('jwtSecret'),
                {expiresIn: '1h'}
            )

            res.json({token, userId: user.id})

        } catch (error) {
            res.status(500).json({message: 'Something went wrong, try again'})
        }
    }
)

module.exports = router