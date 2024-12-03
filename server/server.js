const express = require("express");
const app = express();
const cors = require("cors");
const session = require("express-session");
const connect = require("../schemas");
const { WebSocketServer } = require("ws");
const mongoose = require("mongoose");

require("dotenv").config();

connect();

// MongoDB 연결
mongoose.connection.on("connected", () => {
  console.log("MongoDB 연결 성공");
});
mongoose.connection.on("error", (err) => {
  console.error("MongoDB 연결 실패: ", err.message);
});

//CORS 옵션 설정
const corsOptions = {
origin: process.env.FRONTEND_URL || "https://incandescent-tartufo-b29b25.netlify.app", 
  credentials: true, 
};

// 미들웨어 설정
app.use(cors(corsOptions));

app.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", process.env.FRONTEND_URL);
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  res.sendStatus(200);
});


// Express 세션 설정
app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: "Hyeonjun",
    store: MongoStore.create({ mongoUrl: process.env.DATABASE_URL }),
    cookie: {
      httpOnly: true,
      secure: true, // 배포 환경에서 HTTPS라면 true로 설정
    },
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// 요청 디버깅용 미들웨어
app.use((req, res, next) => {
  if (req.method === "GET" && req.url === "/member/login") {
    res.status(404).send("이 페이지는 GET 요청을 지원하지 않습니다.");
  } else {
    next();
  }
});

// 기본 라우트
app.get("/", (req, res) => {
  res.send("Server is running!");
});

// API 라우터
app.use("/member", require("../routes/memberRouter"));
app.use("/board", require("../routes/boardRouter"));

// HTTP 서버 시작
const server = app.listen(process.env.PORT||3000, () => {
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
