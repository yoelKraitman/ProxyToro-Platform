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
  activePlan: {
    type: String,
    enum: ['none', 'starter', 'pro', 'business'],
    default: 'none',
  },
  planActivatedAt: {
    type: Date,
  },
  usage: {
    proxiesGenerated: { type: Number, default: 0 },
    bandwidthUsed: { type: Number, default: 0 }, // in MB
    lastActive: { type: Date },
  },
  invoices: [
    {
      plan: String,
      amount: Number,
      currency: String,
      paymentId: String,
      status: { type: String, default: 'pending' },
      createdAt: { type: Date, default: Date.now },
    }
  ],
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
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
