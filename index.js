const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rqmpqim.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
// console.log(uri);

async function run() {
    try {
        await client.connect();
        const userCollection = client.db('text-apps').collection('users');
        const blogCollection = client.db('text-apps').collection('blogs');

        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user
            };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        })

        // check if admin
        app.get('/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            const isAdmin = user.role === 'admin';
            res.send({ admin: isAdmin });
        })

        // add blog
        app.post('/blogs', async (req, res) => {
            const blog = req.body;
            const result = await blogCollection.insertOne(blog);
            res.send(result);
        })

        // load all blogs
        app.get('/blogs', async (req, res) => {
            const result = await blogCollection.find().toArray();
            res.send(result);
        })

        // load clicked blog 
        app.get('/blogs/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await blogCollection.findOne(query);
            res.send(result);
        })

        // delete blog
        app.delete('/blogs/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await blogCollection.deleteOne(query);
            res.send(result);
        })

        // update blog
        app.patch('/blogs/:id', async (req, res) => {
            const id = req.params.id;
            const blogInfo = req.body;
            const filter = { _id: ObjectId(id) };
            const updateDoc = {
                $set: blogInfo
            };
            // console.log('update doc', updateDoc);
            const result = await blogCollection.updateOne(filter, updateDoc);
            // console.log(result);
            res.send(result);
        })

        console.log('everything working by now...');
    }
    finally {

    }
}

run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello from Textapps server side!');
})

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})