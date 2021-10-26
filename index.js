const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config()
const cors = require('cors');

const app = express();
const port = 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pgkyz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run(){
    try {
        await client.connect()
        const database = client.db('online_shop');
        const productCollection = database.collection('products');
        const orderCollection = database.collection('orders');

        //GET Products API
        app.get('/products', async(req, res)=> {
            console.log(req.query)
            const cursor = productCollection.find({});
            const page = req.query.page;
            const size = parseInt(req.query.size);
            let products;
            const count = await cursor.count();
            if(page){
                products = await cursor.skip(page * size).limit(size).toArray();
            }
            else{
                products = await cursor.toArray();
            }
            
            res.send({
                count,
                products
            });
        });

        //USE post to get data by keys
        app.post('/products/byKeys', async(req, res)=> {
            console.log(req.body)
            const keys = req.body;
            const query = {key: {$in: keys}};
            const products = await productCollection.find(query).toArray() 
            res.send(products)
        });

        //ADD orders API
        app.post('/orders', async(req, res)=> {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.json(result);
        })

    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res)=> {
    res.send('This is my ema john server')
});

app.listen(port, ()=> {
    console.log('listing the port', port)
})