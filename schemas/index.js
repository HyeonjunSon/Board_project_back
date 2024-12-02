const mongoose = require("mongoose");

module.exports = () => {
  const connect = () => {
    mongoose
      .connect("mongodb+srv://Ths1061205:oeRt8MxHHu0c9BnD@hyeonjun.yl4qx.mongodb.net/project?retryWrites=true&w=majority&appName=Hyeonjun", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
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


