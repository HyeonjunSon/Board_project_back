const express = require("express");
const router = express.Router();
const User = require("../schemas/user");
const crypto = require("crypto");
const util = require("util");

const randomBytes = util.promisify(crypto.randomBytes);
const pbkdf2 = util.promisify(crypto.pbkdf2);

// 회원가입
router.post("/join", async (req, res) => {
  try {
    let obj = { email: req.body.email };

    let user = await User.findOne(obj);
    console.log("회원가입 요청 유저:", user);

    if (user) {
      return res.json({
        message: "이메일이 중복되었습니다. 새로운 이메일을 입력해주세요.",
        dupYn: "1",
      });
    }

    const salt = (await randomBytes(64)).toString("base64");
    const hashedPassword = (
      await pbkdf2(req.body.password, salt, 100000, 64, "sha512")
    ).toString("base64");

    // 디버깅 로그 추가
    console.log("회원가입 시 해싱된 비밀번호:", hashedPassword);
    console.log("회원가입 시 salt 값:", salt);

    obj = {
      email: req.body.email,
      name: req.body.name,
      password: hashedPassword,
      salt: salt,
    };

    user = new User(obj);
    await user.save();
    res.json({ message: "회원가입 되었습니다!", dupYn: "0" });
  } catch (err) {
    console.error("회원가입 오류:", err);
    res.json({ message: false });
  }
});


// 로그인
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    console.log("로그인 요청 유저:", user);

    if (!user) {
      return res.json({ message: "아이디나 패스워드가 일치하지 않습니다." });
    }

    // 비밀번호 해싱
    const hashedPassword = (
      await pbkdf2(req.body.password, user.salt, 100000, 64, "sha512")
    ).toString("base64");

    // 디버깅 로그 추가
    console.log("로그인 시 입력된 비밀번호:", req.body.password);
    console.log("로그인 시 해싱된 비밀번호:", hashedPassword);
    console.log("데이터베이스 저장 비밀번호:", user.password);

    if (hashedPassword === user.password) {
      console.log("비밀번호 일치: 로그인 성공");
      await User.updateOne(
        { email: req.body.email },
        { $set: { loginCnt: 0 } }
      );
      req.session.email = user.email;
      return res.json({
        message: "로그인 되었습니다!",
        _id: user._id,
        email: user.email,
      });
    } else {
      console.log("비밀번호 불일치: 로그인 실패");
      const updatedLoginCnt = (user.loginCnt || 0) + 1;

      if (updatedLoginCnt >= 5) {
        await User.updateOne(
          { email: req.body.email },
          { $set: { loginCnt: updatedLoginCnt, lockYn: true } }
        );
        res.json({
          message:
            "아이디나 패스워드가 5회 이상 일치하지 않아 계정이 잠겼습니다. 고객센터에 문의 바랍니다.",
        });
      } else {
        await User.updateOne(
          { email: req.body.email },
          { $set: { loginCnt: updatedLoginCnt } }
        );
        res.json({
          message: "아이디나 패스워드가 일치하지 않습니다.",
        });
      }
    }
  } catch (err) {
    console.error("로그인 오류:", err);
    res.json({ message: "로그인 실패" });
  }
});


// 로그아웃
router.get("/logout", (req, res) => {
  console.log("/logout - 세션 ID:", req.sessionID);
  req.session.destroy(() => {
    res.json({ message: true });
  });
});

// 회원 삭제
router.post("/delete", async (req, res) => {
  try {
    await User.deleteOne({ _id: req.body._id });
    res.json({ message: true });
  } catch (err) {
    console.error("회원 삭제 오류:", err);
    res.json({ message: false });
  }
});

// 회원 정보 수정
router.post("/update", async (req, res) => {
  try {
    await User.updateOne(
      { _id: req.body._id },
      { $set: { name: req.body.name } }
    );
    res.json({ message: true });
  } catch (err) {
    console.error("회원 정보 수정 오류:", err);
    res.json({ message: false });
  }
});

// 회원 추가
router.post("/add", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.json({ message: true });
  } catch (err) {
    console.error("회원 추가 오류:", err);
    res.json({ message: false });
  }
});

// 전체 회원 목록 가져오기
router.post("/getAllMember", async (req, res) => {
  try {
    const users = await User.find({});
    res.json({ message: users });
  } catch (err) {
    console.error("회원 목록 가져오기 오류:", err);
    res.json({ message: false });
  }
});

module.exports = router;
