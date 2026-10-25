
const mongoose = require('mongoose');

const votingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },

    question: {
        type: String,
        required: true,
        trim: true
    },

    category: {
        type: String,
        enum: ['Education', 'Fun', 'Technology', 'Sports', 'Other'],
        default: 'Other'
    },

    options: [{
        text: {
            type: String,
            required: true,
            trim: true
        }
    }],

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Registervoter',
        required: true
    },

    
votes: [{
    voterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Registervoter',
        default: null
    },
    voterKey: {
        type: String,
        default: null
    },
    optionIndex: {
        type: Number,
        required: true
    }
}],

    isActive: {
        type: Boolean,
        default: true
    },

    expiresAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Voting', votingSchema);
