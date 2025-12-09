import express from "express"
import dotenv from "dotenv"
import cors from "cors"

dotenv.config()
import { db } from "./db.js"
import { userRouter } from "./routes/userRouter.js"
import { adminRouter } from "./routes/adminRouter.js"
import { complaintRouter } from "./routes/complaintRouter.js"

const app = express()

//cors configuratins
app.use(cors({
  origin:["http://localhost:5173","http://127.0.0.1:5173","https://nagrik-setu.netlify.app"],
  credentials:true,
  methods:["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders:["Content-Type","Authorization"]
}))

app.options(/.*/,cors());

app.use(express.json())
const port = process.env.PORT || 3000

app.get('/api/v1/', (req, res) => {    
  res.status(200).send('Hello World!')
})

app.use("/api/v1/user",userRouter)
app.use("/api/v1/admin",adminRouter)
app.use("/api/v1/complaints",complaintRouter)

app.listen(port, () => {
  console.log(`Server Running successfully on port ${port}`)
})
