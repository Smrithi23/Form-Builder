const mongoose = require('mongoose')

const Form = mongoose.model('Form', {
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    html: {
        type: String,
        trim: true
    },
    responses: [{
        response: {}
    }],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
})

module.exports = Form