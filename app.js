const express=require("express");
const app=express();
const mongoose=require("mongoose");
const path=require("path");
const store=require("./middleware/multer");
const fs=require('fs');
const bodyParser = require("body-parser");

app.set('views', path.join(__dirname, 'views'));
app.set('view engine','ejs');
//app.use(express.static(__dirname + '/public'));
//app.use(express.json());
//app.use(express.static(path.join("public")));
app.use(express.static("public"));
app.use(bodyParser.urlencoded({
  extended: true
}));


// database
mongoose.connect("mongodb://localhost:27017/EventDB");

//schemas

// var mediaSchema = new mongoose.Schema({
//     name: String,
//     desc: String,
//     img:
//     {
//         data: Buffer,
//         contentType: String
//     }
// });


const mediaSchema=new mongoose.Schema({
  filename:{
    type:String,
    unique:true,
    required:true
  },
  contentType:{
    type:String,
    required:true
  },
  imageBase64:{
    type:String,
    required:true
  }
});

//models
const Media = mongoose.model('media', mediaSchema);

//routes
app.get("/",function(req,res){
  Media.find({},function(err, items){
 		if (err) {
 			console.log(err);
 			res.status(500).send('An error occurred', err);
 		}
 		else {
 			res.render('home',{ items: items });
 		}
 	})

});

app.get("/UploadMedia",function(req,res){
  res.render("uploadMedia");
});

app.post("/UploadMedia",store.array('medias',20),function(req,res,next){
  const files=req.files;

  if(!files){
    const error=new Error('Please choose files');
    error.httpStatusCode=400;
    return next(error);
  }

  //convert images into base64 encoding

  let imgArray=files.map(function(file){
    let img=fs.readFileSync(file.path)

    return encode_image=img.toString('base64');
  })

  let result=imgArray.map(function(src,index){
    //create object to store media into the collection
    var images={
      filename:files[index].originalname,
      contentType:files[index].mimetype,
      imageBase64:src
    }

    let media=new Media(images);

    media.save(function(err,media) {
      if (!err) {
        console.log("Upload Successful");
      }
      else{
        console.log("Upload Unsuccessful");
      }
    });

  })

  res.redirect("/");

  //res.json(imgArray);
});


app.get("/DeleteMedia",function(req,res){
 // Media.find({},function(err, items){
	// 	if (err) {
	// 		console.log(err);
	// 		res.status(500).send('An error occurred', err);
	// 	}
	// 	else {
	// 		res.render('displayMedia', { items: items });
	// 	}
	// })
 //  .clone().catch(function(err){ console.log(err)})

 //const items = Media.find({});

 Media.find({},function(err, items){
		if (err) {
			console.log(err);
			res.status(500).send('An error occurred', err);
		}
		else {
			res.render('DeleteMedia', { items: items });
		}
	})


	//res.render('DisplayMedia', { items: items });

});

app.post("/DeleteMedia",function(req,res){
  console.log(req);
  var deleteID=req.body.delete;
  console.log(deleteID);
  Media.findByIdAndRemove(deleteID, function(err) {
    if (!err) {
      console.log("Successfully deleted checked item");
      res.redirect("/DeleteMedia");
    }
  });
});
































//setting the Server
app.listen(3000,function(){
  console.log("Server started on port 3000");
});
