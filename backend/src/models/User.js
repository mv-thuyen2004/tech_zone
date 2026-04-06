const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, default: "" },
  address: { type: String, default: "" },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { timestamps: true });

// ĐÃ XÓA HOÀN TOÀN HÀM TỰ ĐỘNG BĂM ĐỂ TRÁNH LỖI XUNG ĐỘT

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);