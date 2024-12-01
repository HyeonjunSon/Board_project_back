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
    // ReCAPTCHA 검증 로직을 제거
    // const recaptchaResponse = req.body.recaptchaToken;
    // const secretKey = "your-secret-key";
    // const recaptchaVerify = await axios.post(
    //   `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaResponse}`
    // );
    // if (!recaptchaVerify.data.success) {
    //   return res.json({ message: "ReCAPTCHA verification failed" });
    // }

    let obj = { email: req.body.email };

    let user = await User.findOne(obj);
    console.log(user);

    if (user) {
      res.json({
        message: "이메일이 중복되었습니다. 새로운 이메일을 입력해주세요.",
        dupYn: "1",
      });
    } else {
      const salt = (await randomBytes(64)).toString("base64");
      const hashedPassword = (
        await pbkdf2(req.body.password, salt, 100000, 64, "sha512")
      ).toString("base64");

      obj = {
        email: req.body.email,
        name: req.body.name,
        password: hashedPassword,
        salt: salt,
      };

      user = new User(obj);
      await user.save();
      res.json({ message: "회원가입 되었습니다!", dupYn: "0" });
    }
  } catch (err) {
    console.log(err);
    res.json({ message: false });
  }
});


// 로그인
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      res.json({ message: "아이디나 패스워드가 일치하지 않습니다." });
    } else {
      const hashedPassword = (
        await pbkdf2(req.body.password, user.salt, 100000, 64, "sha512")
      ).toString("base64");

      if (hashedPassword === user.password) {
        await User.updateOne(
          { email: req.body.email },
          { $set: { loginCnt: 0 } }
        );
        req.session.email = user.email;
        res.json({
          message: "로그인 되었습니다!",
          _id: user._id,
          email: user.email,
        });
      } else {
        const updatedLoginCnt = user.loginCnt + 1;

        if (updatedLoginCnt >= 5) {
          await User.updateOne(
            { email: req.body.email },
            { $set: { loginCnt: updatedLoginCnt, lockYn: true } }
          );
          res.json({
            message:
              "아이디나 패스워드가 5회 이상 일치하지 않아 잠겼습니다.\n고객센터에 문의 바랍니다.",
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
    }
  } catch (err) {
    console.log(err);
    res.json({ message: "로그인 실패" });
  }
});

// 로그아웃
router.get("/logout", (req, res) => {
  console.log("/logout" + req.sessionID);
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
    console.log(err);
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
    console.log(err);
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
    console.log(err);
    res.json({ message: false });
  }
});

// 전체 회원 목록 가져오기
router.post("/getAllMember", async (req, res) => {
  try {
    const user = await User.find({});
    res.json({ message: user });
  } catch (err) {
    console.log(err);
    res.json({ message: false });
  }
});

module.exports = router;
