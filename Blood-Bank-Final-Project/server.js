const express = require("express");
const dotenv = require("dotenv");
const colors = require("colors");
const morgan = require('morgan');
const cors = require('cors');
const connectDB = require("./config/db");
const path = require('path')
dotenv.config();
connectDB();
const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));
app.use('/api/v1/test', require('./routes/testRoutes'));
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/inventory', require('./routes/inventoryRoutes'));
app.use('/api/v1/analytics', require('./routes/analyicsRoutes'));
app.use('/api/v1/admin', require('./routes/adminRoutes'));
// static folder
app.use(express.static(path.join(__dirname,'./client/build')))
//static routes
app.get("*",function(req,res){
  res.sendFile(path.join(__dirname,"./client/build/index.html"))
})
const PORT = 8000 || process.env.PORT;
app.listen(PORT, () => {
  console.log(
    `Node Server Running In ${process.env.DEV_MODE} ModeOn Port ${process.env.PORT}`
      .bgBlue.yellow
  );
}); 