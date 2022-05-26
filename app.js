const express=require("express");
const app=express();
const mongoose=require("mongoose");
const path=require("path");
const store=require("./middleware/multer");
const fs=require('fs');
const bodyParser = require("body-parser");

app.set('views', path.join(__dirname, 'views'));
app.set('view engine','ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({
  extended: true
}));


// database
mongoose.connect("mongodb://localhost:27017/EventDB");


//schemas

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

const respresentativeSchema=new mongoose.Schema({
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
  },
  name:{
    type:String,
    required:true
  },
  post:{
    type:String,
    required:true
  },
  email:{
    type:String,
    required:true
  },
  mobile:{
    type:Number,
    required:true
  }
});


//models
const Media = mongoose.model('media', mediaSchema);
const StudentRespresentative = mongoose.model('studentRespresentative',respresentativeSchema);
const StudentVolunteer = mongoose.model('studentVolunteer',respresentativeSchema);
const TeacherRepresentative = mongoose.model('teacherRepresentative',respresentativeSchema);


//routes

// ************************** Event Gallery *********************************

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


// ********************************** Student Representatives ***************************

app.get("/UploadStudentRepresentatives",function(req,res){
  res.render("uploadRepresentatives",{
    path: "/UploadStudentRepresentatives"
  });
});

app.post("/UploadStudentRepresentatives",store.array('pics',1),function(req,res,next){
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
      imageBase64:src,
      name:req.body.name,
      post:req.body.post,
      email:req.body.email,
      mobile:req.body.mobile
    }

    let studentRespresentative=new StudentRespresentative(images);

    studentRespresentative.save(function(err,media) {
      if (!err) {
        console.log("Upload Successful");
      }
      else{
        console.log("Upload Unsuccessful");
      }
    });

  })

  res.redirect("/DisplayStudentRespresentative");

});


app.get("/DisplayStudentRespresentative",function(req,res){
  StudentRespresentative.find({},function(err, items){
 		if (err) {
 			console.log(err);
 			res.status(500).send('An error occurred', err);
 		}
 		else {
      StudentVolunteer.find({},function(err, items1){
     		if (err) {
     			console.log(err);
     			res.status(500).send('An error occurred', err);
     		}
     		else {
     			res.render('coordinators',{ items: items, volunteers:items1});
     		}
     	})
 		}
 	})
});

app.get("/UpdateStudentRepresentatives",function(req,res){
 StudentRespresentative.find({},function(err, items){
		if (err) {
			console.log(err);
			res.status(500).send('An error occurred', err);
		}
		else {
			res.render('updateRepresentatives', { path:"/UpdateStudentRepresentatives",items: items });
		}
	})


	//res.render('DisplayMedia', { items: items });

});

app.post("/UpdateStudentRepresentatives",function(req,res){
 if(req.body.hasOwnProperty("edit")){
   StudentRespresentative.findOne({_id:req.body.edit}, function(err,representative) {
     if (!err) {
       res.render("editRepresentatives",{
         path:"/editStudentRepresentatives",
         student:representative
       });
     }
   });

 }
 else{
   var deleteID=req.body.delete;
   console.log(deleteID);
   StudentRespresentative.findByIdAndRemove(deleteID, function(err) {
     if (!err) {
       console.log("Successfully deleted checked item");
       res.redirect("/UpdateStudentRepresentatives");
     }
   });
 }
});

app.post("/editStudentRepresentatives",store.array('pics',1),function(req,res,next){
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
      imageBase64:src,
      name:req.body.name,
      post:req.body.post,
      email:req.body.email,
      mobile:req.body.mobile
    }

    // let studentRespresentative=new StudentRespresentative(images);

    StudentRespresentative.updateOne({_id:req.body.update},
      images,
      function(err,media) {
      if (!err) {
        console.log("Upload Successful");
      }
      else{
        console.log("Upload Unsuccessful");
      }
    });
    res.redirect("/UpdateStudentRepresentatives");
  })

});


// ********************************** Volunteers ***************************************

app.get("/UploadVolunteer",function(req,res){
  res.render("uploadRepresentatives",{
    path: "/UploadVolunteer"
  });
});

app.post("/UploadVolunteer",store.array('pics',1),function(req,res,next){
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
      imageBase64:src,
      name:req.body.name,
      post:req.body.post,
      email:req.body.email,
      mobile:req.body.mobile
    }

    let studentVolunteer=new StudentVolunteer(images);

    studentVolunteer.save(function(err,media) {
      if (!err) {
        console.log("Upload Successful");
      }
      else{
        console.log("Upload Unsuccessful");
      }
    });

  })

  res.redirect("/DisplayVolunteer");

});


app.get("/DisplayVolunteer",function(req,res){
  StudentVolunteer.find({},function(err, items){
 		if (err) {
 			console.log(err);
 			res.status(500).send('An error occurred', err);
 		}
 		else {
 			res.redirect("/DisplayStudentRespresentative");
 		}
 	})
});

app.get("/UpdateVolunteer",function(req,res){
 StudentVolunteer.find({},function(err, items){
		if (err) {
			console.log(err);
			res.status(500).send('An error occurred', err);
		}
		else {
			res.render('updateRepresentatives', { path:"/UpdateVolunteer",items: items });
		}
	})


	//res.render('DisplayMedia', { items: items });

});

app.post("/UpdateVolunteer",function(req,res){
 if(req.body.hasOwnProperty("edit")){
   StudentVolunteer.findOne({_id:req.body.edit}, function(err,representative) {
     if (!err) {
       res.render("editRepresentatives",{
         path:"/editVolunteer",
         student:representative
       });
     }
   });

 }
 else{
   var deleteID=req.body.delete;
   console.log(deleteID);
   StudentVolunteer.findByIdAndRemove(deleteID, function(err) {
     if (!err) {
       console.log("Successfully deleted checked item");
       res.redirect("/UpdateVolunteer");
     }
   });
 }
});

app.post("/editVolunteer",store.array('pics',1),function(req,res,next){
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
      imageBase64:src,
      name:req.body.name,
      post:req.body.post,
      email:req.body.email,
      mobile:req.body.mobile
    }

    // let studentRespresentative=new StudentRespresentative(images);

    StudentVolunteer.updateOne({_id:req.body.update},
      images,
      function(err,media) {
      if (!err) {
        console.log("Upload Successful");
      }
      else{
        console.log("Upload Unsuccessful");
      }
    });
    res.redirect("/UpdateVolunteer");
  })

});


// **************************** Teacher Representative **************************************

app.get("/UploadTeacherRepresentatives",function(req,res){
  res.render("uploadRepresentatives",{
    path: "/UploadTeacherRepresentatives"
  });
});

app.post("/UploadTeacherRepresentatives",store.array('pics',1),function(req,res,next){
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
      imageBase64:src,
      name:req.body.name,
      post:req.body.post,
      email:req.body.email,
      mobile:req.body.mobile
    }

    let teacherRespresentative=new TeacherRepresentative(images);

    teacherRespresentative.save(function(err,media) {
      if (!err) {
        console.log("Upload Successful");
      }
      else{
        console.log("Upload Unsuccessful");
      }
    });

  })

  res.redirect("/DisplayTeacherRespresentative");

});


app.get("/DisplayTeacherRespresentative",function(req,res){
  TeacherRepresentative.find({},function(err, items){
 		if (err) {
 			console.log(err);
 			res.status(500).send('An error occurred', err);
 		}
 		else {
     			res.render('teacherRepresentatives',{ items: items});
     	}
 	})
});

app.get("/UpdateTeacherRepresentatives",function(req,res){
 TeacherRepresentative.find({},function(err, items){
		if (err) {
			console.log(err);
			res.status(500).send('An error occurred', err);
		}
		else {
			res.render('updateRepresentatives', { path:"/UpdateTeacherRepresentatives",items: items });
		}
	})


	//res.render('DisplayMedia', { items: items });

});

app.post("/UpdateTeacherRepresentatives",function(req,res){
 if(req.body.hasOwnProperty("edit")){
   TeacherRepresentative.findOne({_id:req.body.edit}, function(err,representative) {
     if (!err) {
       res.render("editRepresentatives",{
         path:"/editTeacherRepresentatives",
         student:representative
       });
     }
   });

 }
 else{
   var deleteID=req.body.delete;
   console.log(deleteID);
   TeacherRepresentative.findByIdAndRemove(deleteID, function(err) {
     if (!err) {
       console.log("Successfully deleted checked item");
       res.redirect("/UpdateTeacherRepresentatives");
     }
   });
 }
});

app.post("/editTeacherRepresentatives",store.array('pics',1),function(req,res,next){
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
      imageBase64:src,
      name:req.body.name,
      post:req.body.post,
      email:req.body.email,
      mobile:req.body.mobile
    }

    TeacherRepresentative.updateOne({_id:req.body.update},
      images,
      function(err,media) {
      if (!err) {
        console.log("Upload Successful");
      }
      else{
        console.log("Upload Unsuccessful");
      }
    });
    res.redirect("/UpdateTeacherRepresentatives");
  })

});















//setting the Server
app.listen(3000,function(){
  console.log("Server started on port 3000");
});
