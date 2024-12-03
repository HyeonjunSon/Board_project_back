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
      return res.status(404).json({ message: "No posts found to delete." });
    }
    res.json({ message: "Post deleted." });
  } catch (err) {
    console.error("Failed to delete post: ", err);
    res.status(500).json({ message: "Failed to delete post", error: err.message });
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
    res.json({ message: "Post has been modified." });
  } catch (err) {
    console.error(err);
    res.json({ message: false });
  }
});

// 게시글 작성
router.post("/write", async (req, res) => {
  try {
    console.log("POST /write 요청 데이터:", req.body);

    if (!mongoose.Types.ObjectId.isValid(req.body._id)) {
      return res.status(400).json({ message: "Invalid user ID." });
    }

    const obj = {
      writer: new mongoose.Types.ObjectId(req.body._id),
      title: req.body.title,
      content: req.body.content,
    };

    console.log("Data to store in MongoDB:", obj);

    const board = new Board(obj);
    await board.save();
    res.json({ message: "Your post has been uploaded." });
  } catch (err) {
    console.error("Failed to save data:", err); // 디버깅용 에러 로그
    res.status(500).json({ message: "Server internal error", error: err.message });
  }
});


// 게시글 목록 가져오기
router.post("/getBoardList", async (req, res) => {
  try {
    const _id = req.body._id;

    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({ message: "Invalid user ID." });
    }

    const boards = await Board.find({ writer: _id }).sort({ createdAt: -1 });
    res.json({ list: boards });
  } catch (err) {
    console.error("Failed to get a list of posts:", err);
    res.status(500).json({
      message: "Failed to get a list of posts",
      error: err.message,
    });
  }
});



// 게시글 상세보기
router.get("/detail/:id", async (req, res) => {
  try {
    const id = req.params.id;
    console.log("Request for a detailed view ID: ", id);
    const board = await Board.findById(id);
    if (!board) {
      return res.status(404).json({ message: "Post not found." });
    }
    res.json({ board });
  } catch (err) {
    console.error("Post Details Failed: ", err);
    res.status(500).json({ message: "Post Details Failed", error: err.message });
  }
});

module.exports = router;
