const express = require("express");
const path = require("path");
const hbs = require("hbs");

var app = express();

const port = process.env.PORT || 3000;

const partialsPath = path.join(__dirname, "../views/partials");
const staticPath = path.join(__dirname, "../public");

app.use(express.static(staticPath));
hbs.registerPartials(partialsPath);
app.set("view engine", "hbs");

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

app.get("/", function (req, res) {
  res.render("index.hbs");
});

module.exports = {
  app: app,
};
