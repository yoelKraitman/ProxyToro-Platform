import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  proxyUsername: {
    type: String,
    unique: true,
  },
  proxyPassword: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
})

// Before saving, hash the password automatically
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 10)
  next()
})

// Method to check password at login
userSchema.methods.comparePassword = function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password)
}

export default mongoose.model('User', userSchema)
