const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

const frontendPath = path.resolve(
  __dirname,
  "..",
  "frontend",
  "home page"
);

app.use(express.static(frontendPath));

app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

app.get("/api/test", (req, res) => {
  res.json({
    message: "Hello from Node.js backend!"
  });
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});