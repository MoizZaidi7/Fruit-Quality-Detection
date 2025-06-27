const mongoose = require('mongoose');

// Direct MongoDB URI (replace with your own)
const mongodbUri = 'mongodb+srv://syedmuhammadmoizzaidi:Ronaldo7@fruitquality.hpbyilq.mongodb.net/myDatabase'; // Replace 'yourdbname' with your database name

mongoose.connect(mongodbUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch(err => {
    console.error("MongoDB connection error:", err);
  });
