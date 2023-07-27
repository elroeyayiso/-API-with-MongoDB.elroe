const PORT = 3000;
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
app.use(cors());

const url = 'mongodb+srv://elroeyayiso123:<password>@cluster0.oymwpmo.mongodb.net/?retryWrites=true&w=majority'; // Replace <password> with your MongoDB Atlas password.
const dbName = 'movie_database';
const client = new MongoClient(url, { useUnifiedTopology: true });

let movieCollection;

async function connectToDB() {
  try {
    await client.connect();
    const db = client.db(dbName);
    movieCollection = db.collection('movies');
    console.log('Connected to MongoDB successfully!');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

connectToDB();

// ... Rest of the code ...




app.route('/all')
  .get(async (req, res) => {
    try {
      const movies = await movieCollection.find().toArray();
      res.json(movies);
    } catch (error) {
      console.error('Error fetching movies from MongoDB:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  })
  .delete(async (req, res) => {
    try {
      await movieCollection.deleteMany({});
      res.sendStatus(200);
    } catch (error) {
      console.error('Error deleting movies from MongoDB:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

app.get('/find', async (req, res) => {
  try {
    console.log(req.query);
    if (req.query.hasOwnProperty('contains')) {
      const searchTerm = req.query.contains.toLowerCase();
      const movies = await movieCollection.find({ $text: { $search: searchTerm } }).toArray();
      res.json(movies);
    } else if (req.query.hasOwnProperty('startsWith')) {
      const searchTerm = req.query.startsWith.toLowerCase();
      const movies = await movieCollection.find({ title: { $regex: `^${searchTerm}`, $options: 'i' } }).toArray();
      res.json(movies);
    }
  } catch (error) {
    console.error('Error searching movies in MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
