require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient } = require('mongodb');
const dns = require('dns');
const urlparser = require('url');

// Basic Configuration
const port = process.env.PORT || 3000;
const client = new MongoClient(process.env.DB_URL);
const db = client.db('shorturls');
const urls = db.collection('urls');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post('/api/shorturl/', function(req, res) {
  const url = req.body.url;
  const hostname = urlparser.parse(req.body.url).hostname;

  async function checkHostname(err, address) {

    if (!address) {
      res.json({ error: 'Invalid Url' });
    }
    else {
      const urlCount = await urls.countDocuments({});
      const urlDoc = {
        url: req.body.url,
        short_url: urlCount
      };

      const result = await urls.insertOne(urlDoc);
      console.log(result);
      res.json({
        original_url: url,
        short_url: urlCount
      });
    }
  }

  dns.lookup(hostname, checkHostname);
});

app.get('/api/shorturl/:short_url', async function(req, res) {
  let shorturl = req.params.short_url;
  let urlDoc = await urls.findOne({ short_url: +shorturl });
  res.redirect(urlDoc.url);
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
