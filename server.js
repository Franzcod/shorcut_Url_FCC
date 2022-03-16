require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser')
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const urlparser = require('url')
const dns = require('dns');

// Basic Configuration
const port = process.env.PORT || 3000;
mongoose.connect(process.env.DB_URI, {})


const urlSchema = new mongoose.Schema({url : 'string'});
const UrlModel = mongoose.model('Url', urlSchema)
console.log('=> ', mongoose.connection.readyState ? 'Base de datos conectada' : "base de datos NO conectada")

app.use(bodyParser.urlencoded({ extended: false }))
app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// guarda el endpoint del input en base de datos si es un URl correcto
app.post('/api/shorturl/new', async function(req, res) {
  const urlInput = req.body.url
  
  dns.lookup(urlparser.parse(urlInput).hostname, (error, addres)=>{
    if(!addres){
      res.json({msg: "Url incorrecta"})
    }
    else {
      try{
        const newUrl = new UrlModel({url: urlInput})
        newUrl.save((err, data)=>{
          res.json({original_url: data.url, short_url : data.id})
        })
      }
      catch(e){
        res.json(e)
      }
    }
  })
  
});

//Se busca con el id y si esta en DB te redirige al endpoint 
app.get('/api/shorturl/:id',async function(req, res) {
  const {id} = req.params;
  UrlModel.findById(id, (err,data)=>{
    if(!data){
      res.json({error: err})
    }
    else{
      res.redirect(data.url)
    }
  })
});

app.get('/data',async function(req, res) {
  let data = await UrlModel.find();
  res.json({data})
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
