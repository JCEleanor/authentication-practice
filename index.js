const express = require('express')
const Mongoose = require('mongoose')
const app = express()
const User = require('./models/user')
const bcrypt = require('bcrypt')
const session = require('express-session')

Mongoose.connect('mongodb://localhost:27017/authDemo', { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => {
		console.log('MONGO CONNECTION OPEN')
	})
	.catch((e) => {
		console.log('MONGO CONNECTION FAILED')
		console.log(e)
	})

app.set('view engine', 'ejs')
app.set('views', 'views')

app.use(express.urlencoded({ extended: true }))
app.use(session({ secret: 'secret', resave: true, saveUninitialized: true }))

const checkLogin = (req, res, next) => {
	if (!req.session.user_id) {
		return res.redirect('/login')
	}
	next()
}

app.get('/', (req, res) => {
	res.send('This is homdpage')
})

app.get('/login', (req, res) => {
	res.render('login')
})

app.get('/register', (req, res) => {
	res.render('form')
})

app.post('/register', async (req, res) => {
	const { username, password } = req.body
	const user = User({ username, password })
	await user.save()
	req.session.user_id = user._id
	res.redirect('/')
})

app.post('/login', async (req, res) => {
	const { username, password } = req.body
	const foundUser = await User.findAndValidate(username, password)

	if (foundUser) {
		req.session.user_id = foundUser._id
		req.session.username = foundUser.username
		res.redirect('/secret')
	} else {
		res.redirect('/login')
	}
})

app.post('/logout', (req, res) => {
	req.session.user_id = null
	res.redirect('/')
})

app.get('/secret', checkLogin, (req, res) => {
	const username = req.session
	res.render('secret', username)
})

app.get('/top-secret', checkLogin, (req, res) => {
	res.send('THIS IS TOP SECRET!!!')
})

app.listen('3000', () => {
	console.log('LISTENING ON PORT 3000')
})
