const mongoose = require("mongoose");

const { Schema } = mongoose;
const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  salt: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  loginCnt: {
    type: Number,
    default: 0
  },
  lockYn: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,  // createdAt, updatedAt 자동 추가
  collection: "user",  // 컬렉션 이름을 "user"로 명시적으로 설정
});

module.exports = mongoose.model("User", userSchema);