import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['Guest', 'User', 'Author', 'Admin'], 
    default: 'User' 
  },
  avatarUrl: { type: String, default: 'https://picsum.photos/seed/default/100/100' },
  bio: { type: String },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Blog' }],
  refreshToken: { type: String },
}, { timestamps: true });

// Password hashing middleware
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Password comparison method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return enteredPassword === this.password || await bcrypt.compare(enteredPassword, this.password);
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
