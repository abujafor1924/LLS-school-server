const express = require("express");
const app = express();

const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const stripe = require("stripe")(
  " sk_test_51NIXUYAJxfkqSYwayMW1qAZ8URCoHSsiahG6wQvOoq4plUSEBzjvLIjlnHZSj2NRYTpgs4VW6XDfSW0TwEqgoF3600fcXAH13X"
);
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello Assingment-12");
});

const uri =
  "mongodb+srv://langCliub:wNOkxXt2zRQLJNc1@cluster0.frl4ype.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    const userCollection = client.db("dataStores").collection("user");
    const addCollection = client.db("dataStores").collection("addData");
    const enrollCollection = client.db("dataStores").collection("enrollData");
    const enrollcomplitedCollection = client
      .db("dataStores")
      .collection("enrollcomplited");

    //     User Collection
    app.get("/users", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "already singUp" });
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      const result = { admin: user?.role === "admin" };
      res.send(result);
    });

    app.get("/users/instructor", async (req, res) => {
      const query = { role: "instructor" };
      const instructors = await userCollection.find(query).toArray();
      res.send(instructors);
    });
    app.get("/users/instructor/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      const result = { instructor: user?.role === "instructor" };
      res.send(result);
    });

    app.patch("/users/admin/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: "admin",
        },
      };

      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.patch("/users/instructor/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: "instructor",
        },
      };
      const result = await userCollection.updateOne(query, updateDoc);
      res.send(result);
    });

    // instructor Section
    app.get("/addDatas", async (req, res) => {
      const result = await addCollection.find().toArray();
      res.send(result);
    });

    app.get("/allClass", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await addCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/addDatas", async (req, res) => {
      const newItem = req.body;
      const result = await addCollection.insertOne(newItem);
      res.send(result);
    });

    app.patch("/addDatas/approved/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: "approved",
        },
      };
      const result = await addCollection.updateOne(filter, updateDoc);
      res.send(result);
    });
    app.patch("/addDatas/denai/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: "denai",
        },
      };
      const result = await addCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // student class section

    app.get("/enroll", async (req, res) => {
      const result = await enrollCollection.find().toArray();
      res.send(result);
    });

    app.post("/enroll", async (req, res) => {
      const item = req.body;
      // console.log(item);
      const result = await enrollCollection.insertOne(item);
      res.send(result);
    });

    app.delete("/enroll/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id);
      const query = { _id: new ObjectId(id) };
      console.log(query);
      const result = await enrollCollection.deleteOne(query);
      res.send(result);
    });

    // create payment Intent
    app.post("/create-payment-intent", async (req, res) => {
      const { price } = req.body;
      const amount = price * 100;
      // console.log(price, amount);
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        automatic_payment_methods: ["card"],
      });

      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    });

    // enroll ment  section

    // app.get("/enrollcomplited", async (req, res) => {
    //   const result = await enrollCollection.find().toArray();
    //   res.send(result);
    // });

    app.post("/enrollcomplited", async (req, res) => {
      const item = req.body;
      // console.log(item);
      const result = await enrollcomplitedCollection.insertOne(item);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    //     await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`server is running port : ${port}`);
});
