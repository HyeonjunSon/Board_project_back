const mongoose = require("mongoose");

module.exports = () => {
  const connect = () => {
    mongoose
      .connect(process.env.DATABASE_URL)
      .then(() => console.log("MongoDB 연결 성공 (게시판 데이터베이스)"))
      .catch((err) => {
        console.error("MongoDB 연결 실패: ", err.message);
        setTimeout(connect, 5000); // 5초 후 재시도
      });
  };

  connect();

  // 연결 에러 처리
  mongoose.connection.on("error", (error) => {
    console.error("몽고디비 연결 에러", error);
  });

  // 연결 끊김 처리
  mongoose.connection.on("disconnected", () => {
    console.warn("몽고디비 연결이 끊겼습니다. 연결을 재시도 합니다.");
    setTimeout(connect, 5000); // 5초 후 재시도
  });

  // 스키마 파일 로드
  require("./user");
  require("./board");
};

const handler = (req, res) => {
  res.status(200).json({ message: "Hello from the backend!" });
};


