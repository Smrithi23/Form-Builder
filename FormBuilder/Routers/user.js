const express = require('express')
const path = require('path')
const User = require('../models/user')
const Form = require('../models/form')
const auth = require('../middleware/auth')
const hbs = require('hbs')
const Cookies = require('cookies')
// For the router to decode the body of the post request - urlencoded()

const router = new express.Router()
router.use(express.urlencoded())

router.get('', async (req, res) => {
    res.status(200).render('index')
})

// Register
router.post('/users', async (req, res) => {

    try {
        const user = new User(req.body)
        await user.save()
        const token = await user.generateAuthToken()
        var cookies = new Cookies(req, res)
        cookies.set('token', token)
        res.status(200).redirect('/user')
    } catch (e) {
        var register = " "
        var email = " "
        var password = " "
        if(e.code === 11000)
        {
            register = "Already Registered"
        }
        else{
        if(e.errors.password)
        {
            password = "Password must contain atleast 7 characters"
        }
        if(e.errors.email)
        {
            email = "Email is invalid"
        }
    }
        res.status(400).render('index', { register, email, password })
    }
})
//Login
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        await user.populate('forms').execPopulate()
        var cookies = new Cookies(req, res)
        cookies.set('token', token)
        res.status(200).redirect('/user')
    } catch (e) {
        const loginerror = "Incorrect email or password"
        res.status(400).render('index', { loginerror })
    }
})
//Logout
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()

        res.render('index')
    } catch (e) {
        res.status(500).send(e)
    }
})
//Logout from all sessions
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.render('index')

    } catch (e) {
        res.status(500).send(e)
    }
})

router.get('/users/me', auth, async (req, res) => {
    try {
        const user = req.user
        res.render('changeProfile', { user })
    } catch (e) {
        res.status(500).send(e)
    }
})

//Back to Dashboard
router.get('/user', auth, async (req, res) => {
    try {
        const user = req.user
        await user.populate('forms').execPopulate()
        res.render('home', { user })
    } catch (e) {
        res.status(500).send(e)
    }
})

//Updating User Profile
router.post('/users/me', auth, async (req, res) => {

    try {
        const updates = Object.keys(req.body)
        const allowedUpdates = ['name', 'password']
        const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

        if (!isValidOperation) {
            return res.status(400).send({ error: 'Invalid Operation' })
        }
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        const user = req.user
        res.render('changeProfile', { user })
    } catch (e) {
        const user = req.user
        const error = "Password must contain atleast 7 characters"
        res.status(400).render('changeProfile', { error, user })

    }
})


module.exports = router