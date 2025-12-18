import express from 'express'
import 'dotenv/config'
import cors from 'cors'

import dbconfig from './config/database.js'
import router from './routes/deployment.routes.js'
import cookieParser from 'cookie-parser'
import integrationsRouter from './routes/integrations.routes.js'

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(cors({
  origin: "http://localhost:5173", 
  credentials: true
}));

app.use('/v1/deployment/api' , router)
app.use('/v1/deployment/api/internal' , integrationsRouter)
dbconfig()
.then(()=>{
   try {
     app.listen(process.env.PORT, ()=>{
        console.log('server is running on port' , process.env.PORT);
    })
   } catch (error) {
    console.error('error in server connection ', error);
   }
})