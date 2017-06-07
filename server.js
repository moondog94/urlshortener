var mongo = require('mongodb').MongoClient
var url = 'mongodb://localhost:27017/shorten'
var short = 'https://free-code-camp-api-moondog94.c9users.io/'
const express = require('express')
const app = express()



mongo.connect(url, function handleSequence(err,db){
    if(err) throw err
    db.dropDatabase()
    var counters = db.collection('counters')
    var countDoc = {_id:"shortid",sequence_value:0}
    counters.insert(countDoc,function handleIt(err,doc){
        if(err) throw err
        console.log(JSON.stringify(countDoc))
        db.close()
    })
})



app.get('/short/:link', function handleShorten(req, res){
    mongo.connect(url, function handleInsert(err, db){
        if(err) throw err
        
    
        db.collection('counters').findAndModify(
        {_id: 'shortid'},
        [['_id','asc']],
        {$inc : {sequence_value: 1}},
        {},
        function handleIncrement(err,data){
            if(err) throw err
            var coll = db.collection('shorten')
        
            var newId = data.value.sequence_value
            var original_link = req.params.link
            if(!(original_link.startsWith('https://')))
                original_link = "https://".concat(original_link)
            var jsonDoc = {
                "_id":newId,
                "original":original_link,
                "short":short.concat(newId)
            }
            coll.insert(jsonDoc, function handleDoc(err,doc){
                if(err) throw err
               // console.log(doc)
                console.log(JSON.stringify(jsonDoc))
                res.json(jsonDoc)
                db.close()    
            })
        })

        
        
        
    })
})

app.get('/:id(\\d+)/', function (req, res) {
  mongo.connect(url, function handleFind(err,db){
      if(err) throw err
      
      var shorten = db.collection('shorten')
      shorten.find({_id : +req.params.id}).toArray(function handleResponse(err,docs){
          if(err) throw err
         
          
          res.redirect(docs[0].original)
          db.close()
      })
  })
})

app.listen(8080, function () {
  console.log('Example app listening on port 8080!')
})