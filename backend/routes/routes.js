// import express from 'express'
// import { userQuery } from '../controles/ai_controls.js'
// const router=express.Router()
// router.get('/new',(req,res)=>{
//     res.send("welcome to taskmanager")
// })
// router.post('/ask',userQuery)

// export default router


import express from 'express'
import { userQuery } from '../controllers/ai_controls.js'  // ✅ Note: "controllers", not "controles"
const router = express.Router()

router.get('/new', (req, res) => {
  res.send("Welcome to Task Manager")
})

router.post('/ask', userQuery)

export default router
