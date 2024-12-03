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
    console.log("User requesting membership:", user);

    if (user) {
      return res.json({
        message: "Email is duplicated Please enter a new email.",
        dupYn: "1",
      });
    }

    const salt = (await randomBytes(64)).toString("base64");
    const hashedPassword = (
      await pbkdf2(req.body.password, salt, 100000, 64, "sha512")
    ).toString("base64");

    // 디버깅 로그 추가
    console.log("Hashed password at membership registration:", hashedPassword);
    console.log("Salt value at the time of membership registration:", salt);

    obj = {
      email: req.body.email,
      name: req.body.name,
      password: hashedPassword,
      salt: salt,
    };

    user = new User(obj);
    await user.save();
    res.json({ message: "You have registered as a member!", dupYn: "0" });
  } catch (err) {
    console.error("Sign up error:", err);
    res.json({ message: false });
  }
});


// 로그인
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    console.log("Login Request User:", user);

    if (!user) {
      return res.json({ message: "ID or password does not match." });
    }

    // 비밀번호 해싱
    const hashedPassword = (
      await pbkdf2(req.body.password, user.salt, 100000, 64, "sha512")
    ).toString("base64");

    // 디버깅 로그 추가
    console.log("Password entered at login:", req.body.password);
    console.log("Password Hashed at Login:", hashedPassword);
    console.log("Database storage password:", user.password);

    if (hashedPassword === user.password) {
      console.log("Password match: Login successful");
      await User.updateOne(
        { email: req.body.email },
        { $set: { loginCnt: 0 } }
      );
      req.session.email = user.email;
      return res.json({
        message: "You're logged in!",
        _id: user._id,
        email: user.email,
      });
    } else {
      console.log("Password mismatch: Login failed");
      const updatedLoginCnt = (user.loginCnt || 0) + 1;

      if (updatedLoginCnt >= 5) {
        await User.updateOne(
          { email: req.body.email },
          { $set: { loginCnt: updatedLoginCnt, lockYn: true } }
        );
        res.json({
          message:
            "The account was locked because the ID or password did not match more than 5 times. Please contact the customer service center.",
        });
      } else {
        await User.updateOne(
          { email: req.body.email },
          { $set: { loginCnt: updatedLoginCnt } }
        );
        res.json({
          message: "ID or password does not match.",
        });
      }
    }
  } catch (err) {
    console.error("Login error:", err);
    res.json({ message: "Login fail" });
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
    console.error("Error deleting members:", err);
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
    console.error("rror modifying membership information:", err);
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
    console.error("Error adding members:", err);
    res.json({ message: false });
  }
});

// 전체 회원 목록 가져오기
router.post("/getAllMember", async (req, res) => {
  try {
    const users = await User.find({});
    res.json({ message: users });
  } catch (err) {
    console.error("Error getting membership list:", err);
    res.json({ message: false });
  }
});

module.exports = router;
