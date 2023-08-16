const express = require("express");
const rateLimit = require("express-rate-limit");
const app = express();
const path = require("path");
const port = 8080;

app.disable("x-powered-by");

const basePath = "/sosialhjelp/fagsystem-mock";

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minutes
  max: 100, // Limit each IP to 100 requests per minute
  message: "You have exceeded the 100 requests in 1 minute limit!",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
});

app.use(limiter);
app.set("trust proxy", 1); // 1 reverse proxy

app.use(
  basePath,
  express.static(path.join(__dirname, "./", "build"), { index: false }),
);

app.get(`${basePath}/internal/isAlive|isReady`, (req, res) => {
  res.status(200).send("This was a triumph");
});

app.use(/^(?!.*\/(internal|static)\/).*$/, (req, res, next) => {
  res.sendFile(path.join(__dirname, "./", "build", "index.html"));
});

app.listen(port, (req, res) => {
  console.log(`listening on port ${port}`);
});
