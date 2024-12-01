const express = require("express");
const app = express();
const cors = require("cors");
const session = require("express-session");
const connect = require("./schemas");
const { WebSocketServer } = require("ws");
const mongoose = require("mongoose");

connect();

// MongoDB 연결
mongoose.connection.on("connected", () => {
  console.log("MongoDB 연결 성공");
});
mongoose.connection.on("error", (err) => {
  console.error("MongoDB 연결 실패: ", err.message);
});

// CORS 옵션 설정
const corsOptions = {
  origin: true,
  credentials: true,
};

// Express 세션 설정
app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: "Hyeonjun",
    cookie: {
      httpOnly: true,
      secure: false,
    },
  })
);

// 미들웨어 설정
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 요청 디버깅용 미들웨어
app.use((req, res, next) => {
  console.log(`Request received: ${req.method} ${req.url}`);
  next();
});

// 기본 라우트
app.get("/", (req, res) => {
  res.send("Server is running!");
});

// API 라우터
app.use("/member", require("./routes/memberRouter"));
app.use("/board", require("./routes/boardRouter"));

// HTTP 서버 시작
const server = app.listen(8080, () => {
  console.log("HTTP server listening on port 8080...");
});

// WebSocket 서버 설정
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  console.log("WebSocket client connected");

  ws.on("message", (message) => {
    console.log("Received:", message);
    ws.send(`Echo: ${message}`); // 클라이언트로 응답
  });

  ws.on("close", () => {
    console.log("WebSocket client disconnected");
  });
});
