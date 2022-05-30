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

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "UnAuthorized access" });
  }

  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    await client.connect();
    const partsCollection = client.db("akAccessories").collection("parts");
    const ordersCollection = client.db("akAccessories").collection("orders");
    const reviewCollection = client.db("akAccessories").collection("reviews");
    const userCollection = client.db("akAccessories").collection("users");
    const profileCollection = client.db("akAccessories").collection("profile");

    // verify admin
    const verifyAdmin = async (req, res, next) => {
      const requester = req.decoded.email;
      const requesterAccount = await userCollection.findOne({
        email: requester,
      });
      if (requesterAccount.role === "admin") {
        next();
      } else {
        res.status(403).send({ message: "forbidden" });
      }
    };

    // make admin
    app.put("/user/admin/:email", verifyJWT, verifyAdmin, async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      const updateDoc = {
        $set: { role: "admin" },
      };

      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.get("/admin/:email", async (req, res) => {
      const email = req.params.email;
      const user = await userCollection.findOne({ email: email });
      const isAdmin = user.role === "admin";
      res.send({ admin: isAdmin });
    });

    // get all users api
    app.get("/user", verifyJWT, verifyAdmin, async (req, res) => {
      const users = await userCollection.find().toArray();
      res.send(users);
    });

    // creating users on server
    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      const token = jwt.sign(
        { email: email },
        process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: "5d",
        }
      );
      res.send({ result, token });
    });

    // get reviews api
    app.get("/reviews", async (req, res) => {
      const query = {};
      const reviews = await reviewCollection.find(query).toArray();
      res.send(reviews);
    });

    // add reviews api
    app.post("/reviews", async (req, res) => {
      const reviewAdd = req.body;
      const review = await reviewCollection.insertOne(reviewAdd);
      res.send(review);
    });

    // Add parts api
    app.post("/parts", async (req, res) => {
      const newParts = req.body;
      const result = await partsCollection.insertOne(newParts);
      res.send(result);
    });

    // add profile info api
    app.post("/myProfile", async (req, res) => {
      const newProfile = req.body;
      const result = await profileCollection.insertOne(newProfile);
      res.send(result);
    });

    // update profile info api
    app.put("/updateProfile/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };

      const result = await profileCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
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
