const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pqt07.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const partsCollection = client.db("akAccessories").collection("parts");
    const ordersCollection = client.db("akAccessories").collection("orders");

    // parts api
    app.get("/parts", async (req, res) => {
      const query = {};
      const cursor = partsCollection.find(query);
      const parts = await cursor.toArray();
      res.send(parts);
    });

    // GET specific parts
    app.get("/parts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const item = await partsCollection.findOne(query);

      res.send(item);
    });

    // Orders api
    app.post("/orders", async (req, res) => {
      const orders = req.body;
      const query = {
        partName: orders.name,
        partDesc: orders.description,
        partImg: orders.img,
        partQuantity: orders.quantity,
        partPrice: orders.price,
        customerEmail: orders.email,
        customerName: orders.name,
        address: orders.address,
        phone: orders.phone,
      };
      const exists = ordersCollection.findOne(query);
      // console.log(exists);
      // if (exists) {
      //   return res.send({ success: false, orders: exists });
      // }
      const result = await ordersCollection.insertOne(orders);
      // console.log(result);
      return res.send({ success: true, result });
    });
  } finally {
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello From Ak Accessories Portal!");
});

app.listen(port, () => {
  console.log(`Ak Accessories APP listening on port ${port}`);
});
