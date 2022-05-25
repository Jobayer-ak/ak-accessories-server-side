const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri =
  "mongodb+srv://ak-accessories:<password>@cluster0.pqt07.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

// async function run() {
//     try {

//     }
//     finally {

//     }
// }

// run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello From Ak Accessories Portal!");
});

app.listen(port, () => {
  console.log(`Ak Accessories APP listening on port ${port}`);
});
