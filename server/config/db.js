const mongoose = require("mongoose");

const ConnectDB = async () => {
  try {
    mongoose
      .connect(process.env.MONGO_URI)
      .then(console.log("Conntected to MongoDB"));
  } catch (error) {
    console.log('Connecting to MongoDB Failed')
  }
};

module.exports = ConnectDB
