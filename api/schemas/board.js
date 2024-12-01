const mongoose = require("mongoose");

const boardSchema = new mongoose.Schema(
  {
    writer: { type: mongoose.Schema.Types.ObjectId, required: true },  // 작성자 ID
    title: { type: String, required: true },  // 제목
    content: { type: String, required: true },  // 내용
  },
  {
    timestamps: true,  // createdAt, updatedAt 자동 추가
    collection: "board",  // 컬렉션 이름을 "board"로 명시적으로 설정
  }
);

module.exports = mongoose.model("Board", boardSchema);
