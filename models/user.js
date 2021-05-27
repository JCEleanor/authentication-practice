const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const userSchema = new mongoose.Schema({
	username: {
		type: String,
		required: [ true, 'Username cannot be blank' ]
	},
	password: {
		type: String,
		required: [ true, 'Password cannot be blank' ]
	}
})

//group the logic that has to do with the user model, instead of putting it in index.js
userSchema.statics.findAndValidate = async function(username, password) {
	const foundUser = await this.findOne({ username })
	const isValid = await bcrypt.compare(password, foundUser.password) //return true or false
	return isValid ? foundUser : false
}

//a middleware runs before saving it to database
userSchema.pre('save', async function(next) {
	//to prevent rehashing the password ('password is the field in the userSchema')
	if (!this.isModified('password')) return next()

	this.password = await bcrypt.hash(this.password, 12)
	next()
})

module.exports = mongoose.model('User', userSchema)
