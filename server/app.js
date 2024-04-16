require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connect } = require("mongoose");
const port = process.env.PORT;
const app = express();
const upload = require("express-fileupload");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");

connect(process.env.MONGO_URL);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ credentials: true, origin: "http://localhost:5173" }));
app.use(upload());
app.use("/uploads", express.static(__dirname + "/uploads"));

app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log("server running on port 3000");
});
