const express = require('express')
const router = new express.Router()
const Form = require('../models/form')
const User = require('../models/user')
const auth = require('../middleware/auth')
const apikey = require('../config.js')
const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(apikey)

//When we click Create a new Form - new form will be created and saved and form page will be rendered
router.get('/form', auth, async(req, res) => {
    
    try {
        const form = new Form
        form.title = 'Untitled'
        form.description = "form_description"
        form.html = ''
        form.owner = req.user._id
        form.save()
        const id = form._id
        res.status(200).redirect('/form/'+id)
    } catch(e) {
        res.send('Cannot save')
    }
})

//When form is saved
router.post('/form', auth, async(req, res) => {
    try {
        const html = req.body.html
        const id = req.body.id
        const title = req.body.title
        const description = req.body.description
        const form = await Form.findOne({ _id: req.body.id })
        if(!form) {
            return res.status(404).send()
        }
        form.html = req.body.html
        form.title = req.body.title
        form.description = req.body.description
        await form.save()
        res.status(200).render('form', {html, title, description, id})
        
    } catch (e) {
        res.send(e)
    }
})
//Selecting a form from dashboard
router.get('/form/:id', auth, async(req, res) => {
    const _id = req.params.id

    try {
        const form = await Form.findOne({_id, owner: req.user._id})
        const id = form._id
        const title = form.title
        const description = form.description
        const html = form.html

        res.status(200).render('form', {title, description, html, id})
    } catch(e) {
        res.send(e)
    }
})
//When form is sent
router.post('/send/:id', auth, async(req, res) => {
    try {
        const sub = req.body.sub
        const message = req.user.name + ' has sent a form. ' + ' ' + req.body.message
        const link = req.body.link
        const to = req.body.to
        sgMail.send({
            to: to,
            from: 'formbuilder3@gmail.com',
            subject: sub,
            text: message + ' ' + link
        })
        
        res.status(200).redirect('/user')
    } catch(e) {
        res.send('Cannot send')
    }
})

//Rendering page of form sent
router.get('/:id', async(req, res) => {
    try {
        const id = req.params.id
        const form = await Form.findOne({ _id: id })
        const html = form.html
        const title = form.title
        const description = form.description
        res.status(200).render('preview', { html, title, description, id })

    } catch(e) {
        res.send('Form not available')
    }
})

//Sending Response
router.post('/responses/:id', async(req, res) => {
    try {
        const id = req.params.id
        const form = await Form.findOne({ _id: id })
        const response = req.body
        console.log(req.body)
        form.responses = form.responses.concat({response})
        console.log(form.responses)
        await form.save()
        const message = 'Thanks for the response!'
        res.status(200).render('preview', {message})

    } catch(e) {
        res.send(e)
    }
})

router.get('/response/:id', auth, async(req, res) => {
    try {
        const id = req.params.id
        const form = await Form.findOne({ _id: id })
        res.status(200).render('response', { form, id })
    } catch(e) {
        res.send(e)
    }
})

router.get('/delete/:id', auth, async(req, res) => {
    try {
        await Form.findOneAndDelete({_id: req.params.id })
        res.status(200).render('delete')
    } catch(e) {
        res.send(e)
    }
})

module.exports = router