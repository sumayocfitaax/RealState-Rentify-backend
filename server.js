const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require("http");
const { Server } = require("socket.io");
const connectedDb = require('./config/db');
const authRouter = require('./router/authRouter');
const userRouter = require('./router/userRouter');
const propertyRouter = require('./router/propertyRouter');
const inquiryRouter = require('./router/inquiryRouter');
const wishlistRouter = require('./router/wishlistRouter');
const contactRouter = require('./router/contactRouter');
const adminRouter = require('./router/adminRouter');
const chatRouter = require('./router/chatRouter')

dotenv.config()
connectedDb()
 
const app = express()
app.use(express.json())

//middle ware
app.use(cors());

const allowOrigins = [
  "http://localhost:5173/"
].filter(Boolean)

// app.use(cors({
//   origin: function (origin, callback) {
//     if (!origin) return callback(null, true);

//     if (allowOrigins.includes(origin)) {
//       return callback(null, true);
//     } else {
//       console.log("Blocked CORS origin:", origin);
//       return callback(new Error("Not allowed by CORS"));
//     }
//   },
//   credentials: true
// }));

const port = process.env.PORT || 9000;

//Routes
app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)
app.use('/api/property', propertyRouter)
app.use('/api/inquiry', inquiryRouter)
app.use('/api/wishlist', wishlistRouter)
app.use('/api/contact', contactRouter)
app.use('/api/admin', adminRouter)
app.use('/api/chat', chatRouter)

app.get('/', (req,res) => {
  res.json('API IS WORKING')
})

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.on("connection", (socket) => {
  socket.on("joinChat", (chatId) => {
    socket.join(chatId)
  });

  socket.on("sendMessage", (data) => {
    io.to(data.chatId).emit("receiveMessage", data)
  });

  socket.on("disconnect", () => {

  })
})

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`http://localhost:${port}`);
});