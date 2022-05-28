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
    const reviewCollection = client.db("akAccessories").collection("reviews");

    // reviews api
    app.post("/reviews", async (req, res) => {
      const reviewAdd = req.body;
      const review = await reviewCollection.insertOne(reviewAdd);
      res.send(review);
    });

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

    // get only orders
    app.get("/orders", async (req, res) => {
      const email = req.params.customerEmail;
      const orders = await ordersCollection.find(email).toArray();
      res.send(orders);
    });

    // Delete order
    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.deleteOne(query);
      res.send(result);
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
