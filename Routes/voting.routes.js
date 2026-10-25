
const express = require('express');
const router = express.Router();

const Voting = require('../Models/voting.model');
const auth = require('../Middleware/auth');

// Create voting form
router.get('/create', auth, (req, res) => {
    res.render('create-voting');
});

// Save new voting
router.post('/create', auth, async (req, res) => {
    try {
        const { title, question, category, expiresAt } = req.body;

        let options = req.body.options || [];
        if (!Array.isArray(options)) options = [options];

        options = options
            .map(option => String(option).trim())
            .filter(option => option.length > 0);

        const allowedCategories = [
            'Education', 'Fun', 'Technology', 'Sports', 'Other'
        ];

        if (
            !title?.trim() ||
            !question?.trim() ||
            title.trim().length > 100 ||
            question.trim().length > 500 ||
            options.length < 2 ||
            options.length > 10 ||
            options.some(option => option.length > 100) ||
            !allowedCategories.includes(category)
        ) {
            return res.status(400).send(
                'Please check title, question, category and 2–10 valid options.'
            );
        }

        const cleanOptions = options.map(text => ({ text }));

        const data = {
            title: title.trim(),
            question: question.trim(),
            category,
            options: cleanOptions,
            createdBy: req.user.registerId
        };

        if (expiresAt) {
            const endDate = new Date(expiresAt);

            if (isNaN(endDate.getTime()) || endDate <= new Date()) {
                return res.status(400).send('Please select a future end date.');
            }

            data.expiresAt = endDate;
        }

        await Voting.create(data);

        return res.redirect('/voting/mine?created=1');
    } catch (error) {
        console.error('Create voting error:', error);
        return res.status(500).send('Voting create nahi ho saki.');
    }
});

// All active polls
router.get('/', auth, async (req, res) => {
    try {
        const votings = await Voting.find({
            isActive: true,
            $or: [
                { expiresAt: null },
                { expiresAt: { $gt: new Date() } }
            ]
        }).sort({ createdAt: -1 });

        res.render('voting', { votings });
    } catch (error) {
        console.error(error);
        res.status(500).send('Unable to load votings.');
    }
});

// Current user's polls
router.get('/mine', auth, async (req, res) => {
    try {
        const votings = await Voting.find({
            createdBy: req.user.registerId
        }).sort({ createdAt: -1 });

        res.render('my-votings', {
            votings,
            created: req.query.created === '1',
            deleted: req.query.deleted === '1',
            publicBaseUrl: process.env.APP_URL
        }); 
    } catch (error) {
        console.error(error);
        res.status(500).send('Unable to load your votings.');
    }
});


const crypto = require('crypto');
const cookieParser = require('cookie-parser');

// Public poll page

router.get('/poll/:id', async (req, res) => {
    try {
        const voting = await Voting.findOne({
            _id: req.params.id,
            isActive: true,
            $or: [
                { expiresAt: null },
                { expiresAt: { $gt: new Date() } }
            ]
        });

        if (!voting) {
            return res.status(404).send('Voting not found or expired.');
        }

        const voterKey = req.cookies?.voterKey;

        const alreadyVoted = voterKey
            ? voting.votes.some(vote => vote.voterKey === voterKey)
            : false;

        if (alreadyVoted) {
            return res.send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Already Voted</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            text-align: center;
                            padding: 60px 20px;
                            background: #f4f7fb;
                        }
                        .message {
                            max-width: 500px;
                            margin: auto;
                            padding: 30px;
                            background: white;
                            border-radius: 12px;
                            box-shadow: 0 4px 16px #0001;
                        }
                    </style>
                </head>
                <body>
                    <div class="message">
                        <h2>✅ Vote Already Submitted</h2>
                        <p>You have already submitted a vote.</p>
                        <p>You can vote only once.</p>
                    </div>
                </body>
                </html>
            `);
        }

        return res.render('public-voting', { voting });

    } catch (error) {
        console.error('Load poll error:', error);
        return res.status(400).send('Invalid voting link.');
    }
});


// Submit public vote
router.post('/poll/:id/vote', async (req, res) => {
    try {
        const { optionIndex } = req.body;
        const index = Number(optionIndex);

        if (!Number.isInteger(index) || index < 0) {
            return res.status(400).send('Invalid option.');
        }

        const voting = await Voting.findOne({
            _id: req.params.id,
            isActive: true,
            $or: [
                { expiresAt: null },
                { expiresAt: { $gt: new Date() } }
            ]
        });

        if (!voting) {
            return res.status(404).send('Voting not found or expired.');
        }

        if (index >= voting.options.length) {
            return res.status(400).send('Invalid option.');
        }

        let voterKey = req.cookies?.voterKey;

        if (!voterKey) {
            voterKey = crypto.randomUUID();
            res.cookie('voterKey', voterKey, {
                httpOnly: true,
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
                maxAge: 365 * 24 * 60 * 60 * 1000
            });
        }

        const alreadyVoted = voting.votes.some(
            vote => vote.voterKey === voterKey
        );

        if (alreadyVoted) {
            return res.status(409).send('You have already voted in this poll.');
        }

        voting.votes.push({
            voterKey,
            voterId: null,
            optionIndex: index
        });

        await voting.save();

       return res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Vote Submitted</title>
        </head>
        <body>
            <script>
                window.location.replace('about:blank');
            </script>
        </body>
        </html>
    `    );
    } catch (error) {
        console.error('Vote error:', error);
        res.status(500).send('The vote could not be submitted.');
    }
});

// Delete a poll created by the logged-in user
router.post('/delete/:id', auth, async (req, res) => {
    try {
        const deletedPoll = await Voting.findOneAndDelete({
            _id: req.params.id,
            createdBy: req.user.registerId
        });

        if (!deletedPoll) {
            return res.status(404).send(
                'Poll not found or you are not allowed to delete it.'
            );
        }

        return res.redirect('/voting/mine?deleted=1');
    } catch (error) {
        console.error('Delete poll error:', error);

        if (error.name === 'CastError') {
            return res.status(400).send('Invalid poll ID.');
        }

        return res.status(500).send('The poll could not be deleted.');
    }
});



module.exports = router;
