const express=require("express");
const app=express();
const mongoose=require("mongoose");
const path=require("path");
const store=require("./middleware/multer");
const fs=require('fs');
const bodyParser = require("body-parser");
const nodemailer = require('nodemailer');

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
 			res.render('index',{ items: items });
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

  res.redirect("/adminDashboard#Media");

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
      res.redirect("/adminDashboard#Media");
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

  res.redirect("/adminDashboard#StudRepre");

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
       res.redirect("/adminDashboard#StudRepre");
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
    res.redirect("/adminDashboard#StudRepre");
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

  res.redirect("/adminDashboard#StudRepre");

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
       res.redirect("/adminDashboard#StudRepre");
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
    res.redirect("/adminDashboard#StudRepre");
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

  res.redirect("/adminDashboard/TeacherRepre");

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
       res.redirect("/adminDashboard/TeacherRepre");
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
    res.redirect("/adminDashboard/TeacherRepre");
  })

});


// **************************************************** Login ***********************************************

//Craeting a password
var password = "";
var role;
const BreakError = {};
const Break = {};
function genPassword() {
   var chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
   var passwordLength = 6;

for (var i = 0; i <= passwordLength; i++) {
  var randomNumber = Math.floor(Math.random() * chars.length);
  password += chars.substring(randomNumber, randomNumber +1);
 }
       console.log(password)
}


let mailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth:{
    user: "aishwaryaauti19@gmail.com",
    pass: "Aishwarya@19"
  }
})

app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname+'/public'));
mongoose.connect("mongodb://localhost:27017/EventDB");


const studentSchema = {
  username: {
    type: String,
    unique: true
  },
  email: {
      type: String,
      unique: true
  },
  password: String
};

const Student = mongoose.model("Student", studentSchema);

const adminSchema = {
  username: String,
  password: String
};

const Admin = mongoose.model("Admin", adminSchema);
//Adding content
const account = new  Admin({
username : "Admin",
password  : "Admin"
});

Admin.insertMany(account, function(err){
  if(err){
    console.log(err);
  } else{
    console.log("Succefully Saved");
  }
});




const adminProfileSchema = {
  title: String,
  link: String
};

const AdminProfile = mongoose.model("AdminProfile", adminProfileSchema);

//Adding content
const choice1 = new AdminProfile ({
  title: "Welcome",
  link: ""
});
const choice2 = new AdminProfile ({
  title: "Change a password",
  link: "/changePassword"
});
const choice3 = new AdminProfile ({
  title: "Post a Event",
  link: "/postEvent"
});
const choice4 = new AdminProfile ({
  title: "Delete a Event",
  link: "/deleteEvent"
});

const defaultItems3 = [choice1, choice2,choice3,choice4];

AdminProfile.insertMany(defaultItems3, function(err){
  if(err){
    console.log(err);
  } else{
    console.log("Succefully Saved");
  }
});

const studentProfileSchema = {
  title: String,
  link: String
};

const StudentProfile = mongoose.model("StudentProfile", studentProfileSchema);

//Adding content
const item1 = new StudentProfile ({
  title: "Welcome",
  link: ""
});
const item2 = new StudentProfile ({
  title: "Change a password",
  link: "/changePassword"
});

const defaultItems1 = [item1, item2];

StudentProfile.insertMany(defaultItems1, function(err){
  if(err){
    console.log(err);
  } else{
    console.log("Succefully Saved");
  }
});

const representiveProfileSchema = {
  title: String,
  link: String
};

const RepresentiveProfile = mongoose.model("RepresentiveProfile", representiveProfileSchema);

//Adding content
const list1 = new  RepresentiveProfile({
  title: "Welcome",
  link: ""
});

const list2 = new RepresentiveProfile ({
  title: "Change a password",
  link: "/changePassword"
});

const list3 = new RepresentiveProfile ({
  title: "Post Event",
  link: "/changePassword"
});

const defaultItems2 = [list1, list2, list3];

RepresentiveProfile.insertMany(defaultItems2, function(err){
  if(err){
    console.log(err);
  } else{
    console.log("Succefully Saved");
  }
});

const tRepresentiveProfileSchema = {
  title: String,
  link: String
};

const TRepresentiveProfile = mongoose.model("TRepresentiveProfile", tRepresentiveProfileSchema);

//Adding content
const data1 = new TRepresentiveProfile ({
  title: "Welcome",
  link: ""
});
const data2 = new TRepresentiveProfile ({
  title: "Change a password",
  link: "/changePassword"
});

const defaultItems4 = [data1, data2];

TRepresentiveProfile.insertMany(defaultItems4, function(err){
  if(err){
    console.log(err);
  } else{
    console.log("Succefully Saved");
  }
});



const representiveSchema = {
  email: {
      type: String,
      unique: true
  },
  password: String,
  role: String
};

const Representive = mongoose.model("Representive", representiveSchema);

app.post("/Studentregister", function(req, res){
  const student = new Student({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password

  });
  // Student.findOne({
  //   username: req.body.username,
  //   password: req.body.password,
  // }, function(err, student) {
  // try{
  // if (err) {
    student.save(function(err){
    if (!err){
      var email= student.email;
      let details ={
        from: "aishwaryaauti19@gmail.com",
        to: email,
        subject: "About Account register",
        text: "Account Created  Successful"
      }

      mailTransporter.sendMail(details,(err)=>{
        if(err){
          console.log("error", err);
        }
        else{
          console.log("Successful")
        }
      })
        res.redirect("/Login");
    }
  })
});

app.post("/representiveRegister", function(req, res){
genPassword();
console.log(password);
  const representive = new Representive({
    email: req.body.email,
    role: req.body.role,
    password: password
  });
  //console.log(password);
  representive.save(function(err){
    if (!err){

      var email= representive.email;
      var pass= representive.password;
      role= representive.role;
      console.log(role);
      let details ={
        from: "aishwaryaauti19@gmail.com",
        to: email,
        subject: "About Account register",
        html:"<h2> Hii! There</h2><h3>Your account creates Successfullly on GPP Events as " +role+ " Representives.<br>Remeber Your Username and password<br>Username: "+email+"<br>Password: "+pass+"."
      }

      mailTransporter.sendMail(details,(err)=>{
        if(err){
          console.log("error", err);
        }
        else{

          console.log("Successful")
        }
      })
        res.render("home", {items: defaultItems3});
    }
  });
});


app.get("/representiveRegister",function(req,res){
  res.render("AdminLogin");
});

app.get("/Login",function(req,res){
  res.render("Login", {success:''});
});

app.post("/Login", function(req, res) {
  Student.findOne({
    username: req.body.username,
    password: req.body.password,
  }, function(err, student) {
    if (!err) {
      if (student) {
        res.render("home", {items: defaultItems1});

        var email= student.email;
        let details ={
          from: "aishwaryaauti19@gmail.com",
          to: email,
          subject: "About Login",
          text: "Login Successful"
        }

        mailTransporter.sendMail(details,(err)=>{
          if(err){
            console.log("error", err);
          }
          else{
            console.log("Successful")
          }
        })
      }
    }
  })

  Admin.findOne({
    username: req.body.username,
    password: req.body.password,
  }, function(err, student) {
    if (!err) {
      if (student) {
        res.render("home", {items: defaultItems3});
      }
    }
  })

  Representive.findOne({
    email : req.body.username,
    password: req.body.password,
  }, function(err, representive) {
   try{
    if (!err) {
      if (representive) {
        if(role=="Student"){
           console.log("Student Login")
           res.render("home", {items: defaultItems2});
        }
      else{
        console.log("Teacher Login")
        res.render("home" , {items: defaultItems4});
      }


        var email= representive.email;
        let details ={
          from: "aishwaryaauti19@gmail.com",
          to: email,
          subject: "About Login",
          html: "<h2>Hii There!!</h2><h3>You have Successfullly Login on GPP Events"
        }

        mailTransporter.sendMail(details,(err)=>{
          if(err){
            console.log("error", err);
          }
          else{
            console.log("Successful")
          }
        })
      }
    }
    throw BreakError;
  }
  catch(BreakError){
        res.render("Login", {success:"Inavlid username and password"})

    }
  })
});




// ********************** Admin Dashboard *******************************
app.get("/adminDashboard",function(req,res){
  Media.find({},function(err, medias){
 		if (err) {
 			console.log(err);
 			res.status(500).send('An error occurred', err);
 		}
 		else {
      TeacherRepresentative.find({},function(err, teachers){
        if (err) {
          console.log(err);
          res.status(500).send('An error occurred', err);
        }
        else {
          StudentRespresentative.find({},function(err, students){
            if (err) {
              console.log(err);
              res.status(500).send('An error occurred', err);
            }
            else {
              StudentVolunteer.find({},function(err,volunteers){
                if (err) {
                  console.log(err);
                  res.status(500).send('An error occurred', err);
                }
                else {
                  res.render('adminDashboard',{ items: medias,teachers:teachers,students:students,volunteers:volunteers });
                }
              })
            }
          })
          }
      });
 		}
 	});


});







//setting the Server
app.listen(3000,function(){
  console.log("Server started on port 3000");
});
