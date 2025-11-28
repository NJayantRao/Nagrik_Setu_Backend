import express from "express"
import dotenv from "dotenv"
dotenv.config()
import { db } from "./db.js"
import { userRouter } from "./routes/userRouter.js"
import { adminRouter } from "./routes/adminRouter.js"
import { departmentRouter } from "./routes/departmentRouter.js"
import { staffRouter } from "./routes/staffRouter.js"
import { complaintRouter } from "./routes/complaintRouter.js"

const app = express()
app.use(express.json())
const port = process.env.PORT || 3000

app.get('/', (req, res) => {    
  res.send('Hello World!')
})

app.use("/user",userRouter)
app.use("/admin",adminRouter)
app.use("/department",departmentRouter)
app.use("/staff",staffRouter)
app.use("/complaints",complaintRouter)

app.listen(port, () => {
  console.log(`Server Running successfully on port ${port}`)
})
