const express = require("express");
const router = express.Router();
const Board = require("../schemas/board");
const mongoose = require("mongoose");
const ObjectId = require('mongoose').Types.ObjectId;

// 게시글 삭제
router.post("/delete", async (req, res) => {
  try {
    const result = await Board.deleteOne({ _id: req.body._id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "삭제할 게시글을 찾을 수 없습니다." });
    }
    res.json({ message: "게시글이 삭제되었습니다." });
  } catch (err) {
    console.error("게시글 삭제 실패: ", err);
    res.status(500).json({ message: "게시글 삭제 실패", error: err.message });
  }
});

// 게시글 수정
router.post("/update", async (req, res) => {
  try {
    await Board.updateOne(
      { _id: req.body._id },
      {
        $set: {
          title: req.body.title,
          content: req.body.content,
        },
      }
    );
    res.json({ message: "게시글이 수정되었습니다." });
  } catch (err) {
    console.error(err);
    res.json({ message: false });
  }
});

// 게시글 작성
router.post("/write", async (req, res) => {
  try {
    console.log("POST /write 요청 데이터: ", req.body); // 요청 데이터 로그

    const obj = {
      writer: new mongoose.Types.ObjectId(req.body._id), // ObjectId 변환
      title: req.body.title,
      content: req.body.content,
    };

    console.log("MongoDB에 저장할 데이터: ", obj); // 저장 전 데이터 로그

    const board = new Board(obj);
    await board.save(); // 데이터 저장
    res.json({ message: "게시글이 업로드되었습니다." });
  } catch (err) {
    console.error("데이터 저장 실패: ", err); // 에러 로그
    res.status(500).json({ message: "데이터 저장 실패", error: err.message });
  }
});

// 게시글 목록 가져오기
router.post("/getBoardList", async (req, res) => {
  try {
    const _id = req.body._id;
    const board = await Board.find({ writer: _id })
      .sort({ createdAt: -1 }); // 정렬
    res.json({ list: board });
  } catch (err) {
    console.error(err);
    res.json({ message: false });
  }
});


// 게시글 상세보기
router.get("/detail/:id", async (req, res) => {
  try {
    const id = req.params.id;
    console.log("상세보기 요청 ID: ", id);
    const board = await Board.findById(id);
    if (!board) {
      return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    }
    res.json({ board });
  } catch (err) {
    console.error("게시글 상세보기 실패: ", err);
    res.status(500).json({ message: "게시글 상세보기 실패", error: err.message });
  }
});

module.exports = router;
