// 
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const path = require('path');
const emailRouter = require("./routes/EmailRouter.js")
const questionRouter = require("./routes/QuestionRouter.js");
const employeeRouter = require("./routes/EmployeeRouter.js");
const nominationRouter = require("./routes/NominationRouter.js")
const bootcampRouter = require("./routes/BootcampRouter.js")
const settingsRouter = require("./routes/SettingsRouter.js")
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))

async function main() {
  await mongoose.connect(process.env.URL);
    await mongoose.connection.db.collection('employees').createIndex({ email: 1 }, { unique: true });
    console.log('db connected.');
}

main().catch((err) => {
  console.error('Error connecting to MongoDB:', err);
});

 
app.use(employeeRouter);
app.use(emailRouter)
app.use(questionRouter);
app.use(nominationRouter);
app.use(settingsRouter);
app.use(bootcampRouter)



app.listen(6001, () => {
  // console.log('url', process.env.URL);
  console.log('KM server started at port 6001');
})