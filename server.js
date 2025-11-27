import express from "express"
import dotenv from "dotenv"
dotenv.config()
import { db } from "./db.js"
import { userRouter } from "./routes/userRouter.js"
import { adminRouter } from "./routes/adminRouter.js"
import { departmentRouter } from "./routes/departmentRouter.js"

const app = express()
app.use(express.json())
const port = process.env.PORT || 3000

app.get('/', (req, res) => {    
  res.send('Hello World!')
})

app.use("/user",userRouter)
app.use("/admin",adminRouter)
app.use("/department",departmentRouter)

app.listen(port, () => {
  console.log(`Server Running successfully on port ${port}`)
})
