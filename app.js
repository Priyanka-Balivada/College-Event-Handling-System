const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const store = require("./middleware/multer");
const fs = require('fs');
const bodyParser = require("body-parser");
const nodemailer = require('nodemailer');
const dateTime = require('node-datetime');
const notifier = require('node-notifier');
require('dotenv').config();
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
require('dotenv').config();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieParser());

let Pusher = require('pusher');
let pusher = new Pusher({
  appId: process.env.APP_ID,
  key: process.env.KEY,
  secret: process.env.SECRET,
  cluster: process.env.CLUSTER
})

const value = 1;

// database
const DBusername=process.env.USERNAME;
const DBpassword=process.env.PASSWORD;
mongoose.connect("mongodb+srv://"+DBusername+":"+DBpassword+"@cluster0.fpfvpl9.mongodb.net/EventDB");
// mongoose.connect("mongodb://localhost:27017/EventDB");

//schemas

const mediaSchema = new mongoose.Schema({
  filename: {
    type: String,
    unique: true,
    required: true
  },
  contentType: {
    type: String,
    required: true
  },
  imageBase64: {
    type: String,
    required: true
  },
  description: {
    type: String
  }
});

const respresentativeSchema = new mongoose.Schema({
  filename: {
    type: String,
    unique: true,
    required: true
  },
  contentType: {
    type: String,
    required: true
  },
  imageBase64: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  post: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  mobile: {
    type: Number,
    required: true
  }
});


const resultSchema = new mongoose.Schema({
  filename: {
    type: String,
    unique: true,
    required: true
  },
  contentType: {
    type: String,
    required: true
  },
  imageBase64: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  post: {
    type: String,
    required: true
  },
  competition: {
    type: String,
    required: true
  }
});

//models
const Media = mongoose.model('media', mediaSchema);
const StudentRespresentative = mongoose.model('studentRespresentative', respresentativeSchema);
const StudentVolunteer = mongoose.model('studentVolunteer', respresentativeSchema);
const TeacherRepresentative = mongoose.model('teacherRepresentative', respresentativeSchema);
const Result = mongoose.model('result', resultSchema);

//routes

// ************************** Event Gallery *********************************

app.get("/", function(req, res) {
  retrieveMedia("Login", res,"General");
});

app.get("/UploadMedia", function(req, res) {
  res.render("uploadMedia");
});

app.post("/UploadMedia", store.array('medias', 20), function(req, res, next) {
  const files = req.files;


  if (!files) {
    const error = new Error('Please choose files');
    error.httpStatusCode = 400;
    return next(error);
  }

  //convert images into base64 encoding

  let imgArray = files.map(function(file) {
    let img = fs.readFileSync(file.path)

    return encode_image = img.toString('base64');
  })

  let result = imgArray.map(function(src, index) {
    //create object to store media into the collection
    var images = {
      filename: files[index].originalname,
      contentType: files[index].mimetype,
      imageBase64: src,
      description: req.body.description
    }

    let media = new Media(images);

    media.save(function(err, media) {
      if (!err) {
        console.log("Upload Successful");
      } else {
        console.log("Upload Unsuccessful");
      }
    });

  })

  res.redirect("/teacherRepresentativeDashboard#Media");

  //res.json(imgArray);
});


app.get("/DeleteMedia", function(req, res) {
  Media.find({}, function(err, items) {
    if (err) {
      console.log(err);
      res.status(500).send('An error occurred', err);
    } else {
      res.render('DeleteMedia', {
        items: items
      });
    }
  })


  //res.render('DisplayMedia', { items: items });

});

app.post("/DeleteMedia", function(req, res) {
  console.log(req);
  var deleteID = req.body.delete;
  console.log(deleteID);
  Media.findByIdAndRemove(deleteID, function(err) {
    if (!err) {
      console.log("Successfully deleted checked item");
      res.redirect("/teacherRepresentativeDashboard#Media");
    }
  });
});


// ********************************** Student Representatives ***************************

app.get("/UploadStudentRepresentatives", function(req, res) {
  res.render("uploadRepresentatives", {
    path: "/UploadStudentRepresentatives"
  });
});

app.post("/UploadStudentRepresentatives", store.array('pics', 1), function(req, res, next) {
  const files = req.files;

  if (!files) {
    const error = new Error('Please choose files');
    error.httpStatusCode = 400;
    return next(error);
  }

  //convert images into base64 encoding

  let imgArray = files.map(function(file) {
    let img = fs.readFileSync(file.path)

    return encode_image = img.toString('base64');
  })

  let result = imgArray.map(function(src, index) {
    //create object to store media into the collection
    var images = {
      filename: files[index].originalname,
      contentType: files[index].mimetype,
      imageBase64: src,
      name: req.body.name,
      post: req.body.post,
      email: req.body.email,
      mobile: req.body.mobile
    }

    let studentRespresentative = new StudentRespresentative(images);

    studentRespresentative.save(function(err, media) {
      if (!err) {
        console.log("Upload Successful");
      } else {
        console.log("Upload Unsuccessful");
      }
    });

  })

  res.redirect("/adminDashboard#StudRepre");

});


app.get("/DisplayStudentRespresentative", function(req, res) {
  StudentRespresentative.find({}, function(err, items) {
    if (err) {
      console.log(err);
      res.status(500).send('An error occurred', err);
    } else {
      StudentVolunteer.find({}, function(err, items1) {
        if (err) {
          console.log(err);
          res.status(500).send('An error occurred', err);
        } else {
          res.render('coordinators', {
            items: items,
            volunteers: items1
          });
        }
      })
    }
  })
});

app.get("/UpdateStudentRepresentatives", function(req, res) {
  StudentRespresentative.find({}, function(err, items) {
    if (err) {
      console.log(err);
      res.status(500).send('An error occurred', err);
    } else {
      res.render('updateRepresentatives', {
        path: "/UpdateStudentRepresentatives",
        items: items
      });
    }
  })


  //res.render('DisplayMedia', { items: items });

});

app.post("/UpdateStudentRepresentatives", function(req, res) {
  if (req.body.hasOwnProperty("edit")) {
    StudentRespresentative.findOne({
      _id: req.body.edit
    }, function(err, representative) {
      if (!err) {
        res.render("editRepresentatives", {
          path: "/editStudentRepresentatives",
          student: representative
        });
      }
    });

  } else {
    var deleteID = req.body.delete;
    console.log(deleteID);
    StudentRespresentative.findByIdAndRemove(deleteID, function(err) {
      if (!err) {
        console.log("Successfully deleted checked item");
        res.redirect("/adminDashboard#StudRepre");
      }
    });
  }
});

app.post("/editStudentRepresentatives", store.array('pics', 1), function(req, res, next) {
  const files = req.files;

  if (!files) {
    const error = new Error('Please choose files');
    error.httpStatusCode = 400;
    return next(error);
  }

  //convert images into base64 encoding

  let imgArray = files.map(function(file) {
    let img = fs.readFileSync(file.path)

    return encode_image = img.toString('base64');
  })

  let result = imgArray.map(function(src, index) {
    //create object to store media into the collection
    var images = {
      filename: files[index].originalname,
      contentType: files[index].mimetype,
      imageBase64: src,
      name: req.body.name,
      post: req.body.post,
      email: req.body.email,
      mobile: req.body.mobile
    }

    // let studentRespresentative=new StudentRespresentative(images);

    StudentRespresentative.updateOne({
        _id: req.body.update
      },
      images,
      function(err, media) {
        if (!err) {
          console.log("Upload Successful");
        } else {
          console.log("Upload Unsuccessful");
        }
      });
    res.redirect("/adminDashboard#StudRepre");
  })

});


// ********************************** Volunteers ***************************************

app.get("/UploadVolunteer", function(req, res) {
  res.render("uploadRepresentatives", {
    path: "/UploadVolunteer"
  });
});

app.post("/UploadVolunteer", store.array('pics', 1), function(req, res, next) {
  const files = req.files;

  if (!files) {
    const error = new Error('Please choose files');
    error.httpStatusCode = 400;
    return next(error);
  }

  //convert images into base64 encoding

  let imgArray = files.map(function(file) {
    let img = fs.readFileSync(file.path)

    return encode_image = img.toString('base64');
  })

  let result = imgArray.map(function(src, index) {
    //create object to store media into the collection
    var images = {
      filename: files[index].originalname,
      contentType: files[index].mimetype,
      imageBase64: src,
      name: req.body.name,
      post: req.body.post,
      email: req.body.email,
      mobile: req.body.mobile
    }

    let studentVolunteer = new StudentVolunteer(images);

    studentVolunteer.save(function(err, media) {
      if (!err) {
        console.log("Upload Successful");
      } else {
        console.log("Upload Unsuccessful");
      }
    });

  })

  res.redirect("/adminDashboard#StudRepre");

});


app.get("/DisplayVolunteer", function(req, res) {
  StudentVolunteer.find({}, function(err, items) {
    if (err) {
      console.log(err);
      res.status(500).send('An error occurred', err);
    } else {
      res.redirect("/DisplayStudentRespresentative");
    }
  })
});

app.get("/UpdateVolunteer", function(req, res) {
  StudentVolunteer.find({}, function(err, items) {
    if (err) {
      console.log(err);
      res.status(500).send('An error occurred', err);
    } else {
      res.render('updateRepresentatives', {
        path: "/UpdateVolunteer",
        items: items
      });
    }
  })


  //res.render('DisplayMedia', { items: items });

});

app.post("/UpdateVolunteer", function(req, res) {
  if (req.body.hasOwnProperty("edit")) {
    StudentVolunteer.findOne({
      _id: req.body.edit
    }, function(err, representative) {
      if (!err) {
        res.render("editRepresentatives", {
          path: "/editVolunteer",
          student: representative
        });
      }
    });

  } else {
    var deleteID = req.body.delete;
    console.log(deleteID);
    StudentVolunteer.findByIdAndRemove(deleteID, function(err) {
      if (!err) {
        console.log("Successfully deleted checked item");
        res.redirect("/adminDashboard#StudRepre");
      }
    });
  }
});

app.post("/editVolunteer", store.array('pics', 1), function(req, res, next) {
  const files = req.files;

  if (!files) {
    const error = new Error('Please choose files');
    error.httpStatusCode = 400;
    return next(error);
  }

  //convert images into base64 encoding

  let imgArray = files.map(function(file) {
    let img = fs.readFileSync(file.path)

    return encode_image = img.toString('base64');
  })

  let result = imgArray.map(function(src, index) {
    //create object to store media into the collection
    var images = {
      filename: files[index].originalname,
      contentType: files[index].mimetype,
      imageBase64: src,
      name: req.body.name,
      post: req.body.post,
      email: req.body.email,
      mobile: req.body.mobile
    }

    // let studentRespresentative=new StudentRespresentative(images);

    StudentVolunteer.updateOne({
        _id: req.body.update
      },
      images,
      function(err, media) {
        if (!err) {
          console.log("Upload Successful");
        } else {
          console.log("Upload Unsuccessful");
        }
      });
    res.redirect("/adminDashboard#StudRepre");
  })

});


// **************************** Teacher Representative **************************************

app.get("/UploadTeacherRepresentatives", function(req, res) {
  res.render("uploadRepresentatives", {
    path: "/UploadTeacherRepresentatives"
  });
});

app.post("/UploadTeacherRepresentatives", store.array('pics', 1), function(req, res, next) {
  const files = req.files;

  if (!files) {
    const error = new Error('Please choose files');
    error.httpStatusCode = 400;
    return next(error);
  }

  //convert images into base64 encoding

  let imgArray = files.map(function(file) {
    let img = fs.readFileSync(file.path)

    return encode_image = img.toString('base64');
  })

  let result = imgArray.map(function(src, index) {
    //create object to store media into the collection
    var images = {
      filename: files[index].originalname,
      contentType: files[index].mimetype,
      imageBase64: src,
      name: req.body.name,
      post: req.body.post,
      email: req.body.email,
      mobile: req.body.mobile
    }

    let teacherRespresentative = new TeacherRepresentative(images);

    teacherRespresentative.save(function(err, media) {
      if (!err) {
        console.log("Upload Successful");
      } else {
        console.log("Upload Unsuccessful");
      }
    });

  })

  res.redirect("/adminDashboard#TeacherRepre");

});


app.get("/DisplayTeacherRespresentative", function(req, res) {
  TeacherRepresentative.find({}, function(err, items) {
    if (err) {
      console.log(err);
      res.status(500).send('An error occurred', err);
    } else {
      res.render('teacherRepresentatives', {
        items: items
      });
    }
  })
});

app.get("/UpdateTeacherRepresentatives", function(req, res) {
  TeacherRepresentative.find({}, function(err, items) {
    if (err) {
      console.log(err);
      res.status(500).send('An error occurred', err);
    } else {
      res.render('updateRepresentatives', {
        path: "/UpdateTeacherRepresentatives",
        items: items
      });
    }
  })


  //res.render('DisplayMedia', { items: items });

});

app.post("/UpdateTeacherRepresentatives", function(req, res) {
  if (req.body.hasOwnProperty("edit")) {
    TeacherRepresentative.findOne({
      _id: req.body.edit
    }, function(err, representative) {
      if (!err) {
        res.render("editRepresentatives", {
          path: "/editTeacherRepresentatives",
          student: representative
        });
      }
    });

  } else {
    var deleteID = req.body.delete;
    console.log(deleteID);
    TeacherRepresentative.findByIdAndRemove(deleteID, function(err) {
      if (!err) {
        console.log("Successfully deleted checked item");
        res.redirect("/adminDashboard#TeacherRepre");
      }
    });
  }
});

app.post("/editTeacherRepresentatives", store.array('pics', 1), function(req, res, next) {
  const files = req.files;

  if (!files) {
    const error = new Error('Please choose files');
    error.httpStatusCode = 400;
    return next(error);
  }

  //convert images into base64 encoding

  let imgArray = files.map(function(file) {
    let img = fs.readFileSync(file.path)

    return encode_image = img.toString('base64');
  })

  let result = imgArray.map(function(src, index) {
    //create object to store media into the collection
    var images = {
      filename: files[index].originalname,
      contentType: files[index].mimetype,
      imageBase64: src,
      name: req.body.name,
      post: req.body.post,
      email: req.body.email,
      mobile: req.body.mobile
    }

    TeacherRepresentative.updateOne({
        _id: req.body.update
      },
      images,
      function(err, media) {
        if (!err) {
          console.log("Upload Successful");
        } else {
          console.log("Upload Unsuccessful");
        }
      });
    res.redirect("/adminDashboard#TeacherRepre");
  })

});


// **************************************************** Login ***********************************************

//Mail tranfer
let mailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "aishwaryaauti19@gmail.com",
    pass: "hsafxfwvgkaipnkl"
  }
})

//Craeting a password
var password = "";
var role;
var login, user;
const BreakError = {};
const Break = {};

function genPassword() {
  var chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var passwordLength = 6;

  for (var i = 0; i <= passwordLength; i++) {
    var randomNumber = Math.floor(Math.random() * chars.length);
    password += chars.substring(randomNumber, randomNumber + 1);
  }
  console.log(password)
}

//Student database
const studentSchema = {
  username: {
    type: String,
    unique: true
  },
  email: {
    type: String,
    unique: true
  },
  mobile_no: {
    type: Number,
    required: true
  },
  password: String
};

const Student = mongoose.model("Student", studentSchema);


//Admin database
const adminSchema = {
  username: String,
  password: String
};

const Admin = mongoose.model("Admin", adminSchema);

const adminProfileSchema = {
  title: String,
  link: String
};

const AdminProfile = mongoose.model("AdminProfile", adminProfileSchema);



//Representive database
const representiveSchema = {
  email: {
    type: String,
    unique: true
  },
  password: String,
  role: String
};

const Representive = mongoose.model("Representive", representiveSchema);


// ****************files*********************

app.post("/Studentregister", function(req, res) {
  const student = new Student({
    username: req.body.username,
    email: req.body.email,
    mobile_no: req.body.mobile_no,
    password: req.body.password


  });

  student.save(function(err) {
    if (!err) {
      var email = student.email;
      let details = {
        from: "aishwaryaauti19@gmail.com",
        to: email,
        subject: "About Account register",
        text: "Account Created  Successful"
      }

      mailTransporter.sendMail(details, (err) => {
        if (err) {
          console.log("error", err);
        } else {
          console.log("Successful")
        }
      })
      res.redirect("/Login");
      notifier.notify("Account Created Successfullly !!!!!!");
    }
  })
});


app.post("/representiveRegister", function(req, res) {
  genPassword();
  console.log(password);
  const representive = new Representive({
    email: req.body.email,
    role: req.body.role,
    password: password
  });

  representive.save(function(err) {
    if (!err) {

      var email = representive.email;
      var pass = representive.password;
      role = representive.role;
      console.log(role);
      let details = {
        from: "aishwaryaauti19@gmail.com",
        to: email,
        subject: "About Account register",
        html: "<h2> Hii! There</h2><h3>Your account creates Successfullly on GPP Events as " + role + " Representives.<br>Remeber Your Username and password<br>Username: " + email + "<br>Password: " + pass + "."
      }

      mailTransporter.sendMail(details, (err) => {
        if (err) {
          console.log("error", err);
        } else {

          console.log("Successful")
        }
      })
      retrieveMedia("profile", res);

      res.redirect("/adminDashboard#Account");
      notifier.notify('Representive Account Created Suucessfully !!!!!!');
    }
  });
});


//Delete Representive Account
app.post("/deleteAccount", function(req, res) {
  Representive.findOneAndDelete({
    email: req.body.deleteAccount,
  },function(err,res) {
        if(!err){
          if (res) {
            console.log("Successfully deleted Account");
            notifier.notify('Representative Account Deleted Suucessfully !!!!!!');
      }else {
            console.log("Not deleted");
            notifier.notify('Invalid Credentials');
          }
        }

      });

      res.redirect("/adminDashboard#Account");

    });



app.get("/Login", function(req, res) {
  res.render("Login", {
    success: ''
  });
});




var check = false;
app.post("/Login", function(req, res) {
  Student.findOne({
    username: req.body.username,
    password: req.body.password,
  }, function(err, student) {
    if (!err) {
      if (student) {
        check = true;

        retrieveMedia("profile", res, "Student");
        login = "Student";
        user = student.username;
        var email = student.email;

        let details = {
          from: "aishwaryaauti19@gmail.com",
          to: email,
          subject: "About Login",
          text: "Login Successful"
        }

        mailTransporter.sendMail(details, (err) => {
          if (err) {
            console.log("error", err);
          } else {
            console.log("Successful")
          }
        })
      }
    }
  })

  Admin.findOne({
    username: req.body.username,
    password: req.body.password,
  }, function(err, admin) {
    if (!err) {
      if (admin) {
        check = true;

        retrieveMedia("profile", res, "Admin");
        login = "Admin";

      }
    }
  })

  Representive.findOne({
    email: req.body.username,
    password: req.body.password,
  }, function(err, representive) {
    if (!err) {
      if (representive) {
        check = true;
        if (role == "Student") {
          console.log("Student Login")

          retrieveMedia("profile", res, "sRepresentive");
          login = "sRepresentive";
        } else {
          console.log("Teacher Login")

          retrieveMedia("profile", res, "tRepresentive");
          login = "tRepresentive";

        }


        var email = representive.email;
        let details = {
          from: "aishwaryaauti19@gmail.com",
          to: email,
          subject: "About Login",
          html: "<h2>Hii There!!</h2><h3>You have Successfullly Login on GPP Events"
        }

        mailTransporter.sendMail(details, (err) => {
          if (err) {
            console.log("error", err);
          } else {
            console.log("Successful")
          }
        })
      }
    }
    if (check == false) {
      res.render("Login");
      notifier.notify("Invalid Credentials !!!!!!");
    } else {
      check = false;
    }


  })
});

// ********************** Admin Dashboard *******************************
app.get("/adminDashboard", function(req, res) {
  Media.find({}, function(err, medias) {
    if (err) {
      console.log(err);
      res.status(500).send('An error occurred', err);
    } else {
      TeacherRepresentative.find({}, function(err, teachers) {
        if (err) {
          console.log(err);
          res.status(500).send('An error occurred', err);
        } else {
          StudentRespresentative.find({}, function(err, students) {
            if (err) {
              console.log(err);
              res.status(500).send('An error occurred', err);
            } else {
              StudentVolunteer.find({}, function(err, volunteers) {
                if (err) {
                  console.log(err);
                  res.status(500).send('An error occurred', err);
                } else {
                  res.render('adminDashboard', {
                    items: medias,
                    teachers: teachers,
                    students: students,
                    volunteers: volunteers
                  });
                }
              })
            }
          })
        }
      });
    }
  });


});


// **************************** StudentRepresentative Dashboard *****************
app.get("/studentRepresentativeDashboard",function(req,res){
 dashBoardRender("studentRepresentativeDashboard",res);
})

// ******************************* TeacherRepresentative Dashboard **************************
app.get("/teacherRepresentativeDashboard", function(req, res) {
  dashBoardRender("teacherRepresentativeDashboard",res);
});

// ************************ render dashboard page *************************
function dashBoardRender(page,res){
  Media.find({}, function(err, medias) {
    if (err) {
      console.log(err);
      res.status(500).send('An error occurred', err);
    } else {
      TeacherRepresentative.find({}, function(err, teachers) {
        if (err) {
          console.log(err);
          res.status(500).send('An error occurred', err);
        } else {
          StudentRespresentative.find({}, function(err, students) {
            if (err) {
              console.log(err);
              res.status(500).send('An error occurred', err);
            } else {
              StudentVolunteer.find({}, function(err, volunteers) {
                if (err) {
                  console.log(err);
                  res.status(500).send('An error occurred', err);
                }else{
                  PostEvent.find({}, function(err, events) {
                    if (err) {
                      console.log(err);
                      res.status(500).send('An error occurred', err);
                    }else {
                  Result.find({},function(err,results){
                      if(err){
                        console.log(err);
                      }else{
                        Poll.find({},function(err,polls){
                          if(err){
                            console.log(err);
                          }else{
                            res.render(page, {
                              items: medias,
                              teachers: teachers,
                              students: students,
                              volunteers: volunteers,
                              events: events,
                              results: results,
                              polls:polls
                            });
                          }
                      })
                      }
                  })
                }
              })
                }
            })
            }
          })
        }
      });
    }
  });


}
// *************************************** Current Event *********************************
app.get("/currentEvent", function(req, res) {
  Result.find({}, function(err, results) {
    if (err) {
      console.log(err);
      res.status(500).send('An error occurred', err);
    } else {
      Poll.find({}, function(err, polls) {
        if (!err) {
          PostEvent.find({}, function(err, postEvents) {
            if (!err) {
              res.render("currentEvent", {
                postEvents: postEvents,
                key: pk,
                polls: polls,
                results: results
              });
            }
          })
        }
      });
    }
  })
});

// ********************************************* Polls *******************************************
const pollSchema = new mongoose.Schema({
  topic: String,
  choices: [{
    value: String,
    votes: Number
  }]
});

const Poll = mongoose.model('poll', pollSchema);

app.get("/pollForm",function(req,res){
  res.render("pollForm");
})

app.post("/pollForm", function(req, res) {
  const poll = new Poll({
    topic: req.body.pollTopic,
    choices: [{
        value: req.body.pollOption1,
        votes: 0
      },
      {
        value: req.body.pollOption2,
        votes: 0
      },
      {
        value: req.body.pollOption3,
        votes: 0
      },
      {
        value: req.body.pollOption4,
        votes: 0
      }
    ]
  });

  poll.save(function(err) {
    if (!err) {
      console.log("saved");
      console.log(req.body.pollTitle);
    }
  });

  if(req.body.page=="studentRepresentativeDashboard"){
    res.redirect("/teacherRepresentativeDashboard#Poll");
  }else{
    res.redirect("/studentRepresentativeDashboard#Poll");
  }
});

app.post("/DeletePoll",function(req,res){
  Poll.findByIdAndRemove(req.body.delete, function(err) {
    if (!err) {
      console.log("Successfully deleted checked item");

      if(req.body.page=="studentRepresentativeDashboard"){
        res.redirect("/teacherRepresentativeDashboard#Poll");
      }else{
        res.redirect("/studentRepresentativeDashboard#Poll");
      }

    }
  });
})

app.post('/:pollId/vote', (req, res, next) => {
  const choice = req.body.choice;
  var pollEvent;



  Poll.findById({
    _id: req.params.pollId
  }, function(err, poll) {
    if (!err) {
      pollEvent = poll.choices[choice].votes;
      poll.choices[choice].votes = pollEvent + 1;
      console.log(poll.choices[choice].value);
      console.log(poll.choices[choice].votes);

      poll.save(function(err, media) {
        if (!err) {
          console.log("Vote Successful");
        }
      });
    }
  })

  let payload = {
    pollId: req.params.pollId,
    choice: choice
  };
  pusher.trigger('poll-events', 'vote', payload, req.body.socketId);

  res.send("/currentEvent#poll")


});


app.get("/pollResults", function(req, res) {

  Poll.find({}, function(err, polls) {
    if (!err) {
      res.render("pollDemo", {
        polls: polls
      });
      // res.render("pollDemo");
      // {polls:polls}
    }
  })






})

// **************************************** Result ***********************************************


app.get("/UploadResult", function(req, res) {
  res.render("editResult");
});

app.post("/UploadResult", store.array('pics', 1), function(req, res, next) {
  uploadResult(req, Result, next);
  res.redirect("/teacherRepresentativeDashboard#Result");
});

app.post("/DeleteResult", store.array('pics', 1), function(req, res, next) {
  Result.findByIdAndRemove(req.body.delete, function(err) {
    if (!err) {
      console.log("Successfully deleted checked item");
      res.redirect("/teacherRepresentativeDashboard#Result");
    }
  });
});



// ************************* Functions *************************************************
function retrieveMedia(link, res, account) {
  Media.find({}, function(err, items) {
    if (err) {
      console.log(err);
      res.status(500).send('An error occurred', err);
    } else {
      res.render('index', {
        items: items,
        buttonTitle: link,
        buttonLink: "/" + link
      });
    }
  })
  login = account;
}

function uploadResult(req, collection, next) {
  const files = req.files;

  if (!files) {
    const error = new Error('Please choose files');
    error.httpStatusCode = 400;
    return next(error);
  }

  //convert images into base64 encoding

  let imgArray = files.map(function(file) {
    let img = fs.readFileSync(file.path)

    return encode_image = img.toString('base64');
  })

  let result = imgArray.map(function(src, index) {
    //create object to store media into the collection
    var images = {
      filename: files[index].originalname,
      contentType: files[index].mimetype,
      imageBase64: src,
      name: req.body.name,
      post: req.body.post,
      competition: req.body.competition
    }

    let media = new collection(images);

    media.save(function(err, media) {
      if (!err) {
        console.log("Upload Successful");
      } else {
        console.log("Upload Unsuccessful");
      }
    });

  })
}

// ***************************previousEvent**********************************
var dt = dateTime.create();
var eventTitle;
var eventDescription;

const previousEventSchema = {
  title: String,
  content: String
}

const PreviousEvent = mongoose.model("previousEvent", previousEventSchema);

app.get("/previousEvent", function(req, res) {
  var currentDate = dt.format('Y-m-d');
  var currentTime = dt.format('H:M');

  timeCheck();

  function timeCheck() {
    PostEvent.find({}, function(err, postEvent) {
      if (!err) {
        var eventCount = postEvent.length;

        for (i = 0; i < eventCount; i++) {
          // if (postEvent[i].time <= currentTime & postEvent[i].date <= currentDate) {
          if (postEvent[i].date < currentDate) {
            previousEvent();
          } else {
            console.log("Not Found");
          }
        }

      }
    });
  }
  PreviousEvent.find({}, function(err, previousEvents) {
    if (!err) {
      res.render("previousEvent", {
        previousEvents: previousEvents
      });
    }
  })

})

function previousEvent() {
  PostEvent.findOne({}, function(err, postEvent) {
    if (!err) {
      if (postEvent) {
        console.log("previousEvent()");
        eventTitle = postEvent.title;
        eventDescription = postEvent.content;

        console.log(eventTitle);
        console.log(eventDescription);

        const previousEvent = new PreviousEvent({
          title: eventTitle,
          content: eventDescription
        });

        previousEvent.save(function(err) {
          if (!err) {
            console.log("saved");

          }
        });
      }
    }
  });

  PostEvent.findOne({
    title: eventTitle,
  }, function(err, postEvent) {
    if (!err) {
      PostEvent.deleteOne({
        title: eventTitle
      }, function(err) {
        if (!err) {
          console.log("Successfully deleted checked item");

        } else {
          console.log("Not deleted checked item");
        }
      });
    }
  });

}



app.get("/deleteEvent", function(req, res) {
  res.render("deleteEvent");
})

app.post("/deleteEvent", function(req, res) {
  PreviousEvent.findOne({
    title: req.body.eventDelete,
  }, function(err, previousEvent) {
    if (!err) {
      var deleteEvent = req.body.eventDelete;
      console.log(deleteEvent);
      PreviousEvent.deleteOne({
        title: deleteEvent
      }, function(err) {
        if (!err) {
          console.log("Successfully deleted checked item");

        } else {
          console.log("Not deleted checked item");
        }
      });
    }
  });
});


app.post("/eventDelete", function(req, res) {
  console.log(req);
  var deleteID = req.body.delete;
  PostEvent.findByIdAndRemove(deleteID, function(err) {
    if (!err) {
      console.log("Successfully deleted checked item");
      res.redirect("/teacherRepresentativeDashboard#EventUpdates");
    }
  });
});
// ***************************previousEvent**********************************
const postEventSchema = {
  title: String,
  content: String,
  date: String,
  time: String,
  amount: Number
}

const PostEvent = mongoose.model("PostEvent", postEventSchema);

// ******************post Event********************

var eventMail;
app.get("/calender",function(req,res){
  res.render("calender");
})

app.post("/calender", function(req, res) {
  const postEvent = new PostEvent({
    title: req.body.eventName,
    content: req.body.subject,
    date: req.body.date,
    time: req.body.time,
    amount: req.body.eventAmount
  })
  postEvent.save(function(err) {
    if (!err) {
      console.log("saved");
      eventEmail();
      if(req.body.page=="studentRepresentativeDashboard"){
        res.redirect("/teacherRepresentativeDashboard");
      }else{
        res.redirect("/studentRepresentativeDashboard");
      }
      notifier.notify("Successfully Upload Event !!!!!!");
    }
  });

});

function eventEmail() {
  Student.find({}, function(err, student) {
    if (!err) {
      if (student) {

        var empty = student.length;

        for (i = 0; i < empty; i++) {

          eventMail = student[i].email;
          console.log(eventMail);
          console.log("found");
          let details = {
            from: "aishwaryaauti19@gmail.com",
            to: eventMail,
            subject: "About Event Post",
            html: "<h2> Hii! There</h2><h3>We have posted a new event for you. Go check imditely</h3>"
          }

          mailTransporter.sendMail(details, (err) => {
            if (err) {
              console.log("error", err);
            } else {

              console.log("Successful")
            }
          })
        }
      }
    }
  });
}




// ******************post Event********************


//profile
app.get("/profile", function(req, res) {
  if (login == "Student") {
    Media.find({}, function(err, items) {
      if (err) {
        console.log(err);
        res.status(500).send('An error occurred', err);
      } else {
        res.render('index', {
          items: items,
          buttonTitle: "Logout",
          buttonLink: "/"
        });
      }
    })
          }else if (login == "Admin") {
      res.redirect("/adminDashboard");
    }


     else if (login == "tRepresentive") {
            res.redirect("/teacherRepresentativeDashboard");

  } else if (login == "sRepresentive") {

            res.redirect("/studentRepresentativeDashboard");

        }
   else
    res.render("partials/Error");
});





//6523 2630 1503 0603
//////Event register"
var pk = "pk_test_51LBCdhSJJli55MaJrdI0WLbQphpZHv1iky4IatMfOz64chMH7ieT5THTLSjz68sfDAM7IPBsugs9WyLQpjYxESLm00m9kWoSAt";
var sk = "sk_test_51LBCdhSJJli55MaJvF20ePBL6Sk1LmKTpw7TuZYmBpQHPivUe49hnMWDR9VSTe1CqYSfKdHWReufQj1VVa1ICQqi00WlK4PfOj";
var stripe = require('stripe')('sk');
var eventAmount;


const eventRegisterSchema = {
  name: String,
  mobile_no: Number,
  email: String,
  event: String
}

const EventRegister = mongoose.model("EventRegister", eventRegisterSchema);

//View participant Candidate

app.post("/participant", function (req, res){
  var postid= req.body.register;
  console.log(postid);
  EventRegister.find({event:postid}, function(err, eventRegister) {
    if (err) {
      console.log(err);

    } else{
      if(eventRegister){
        console.log(eventRegister);
      res.render("participantCandidates", {
        eventRegisters: eventRegister
      })
    }else{
      console.log("No data");
    }
    }
})
});



app.post('/payment', function(req, res) {

  Student.findOne({
    email: req.body.stripeEmail,
  }, function(err, student) {
    if (!err) {
      if (student) {
       var eventID = req.body.eventID;
        var username= student.username;
         var email= student.email;
         var mobile_no= student.mobile_no;
        const eventRegister = new EventRegister({
          name: username,
          email: email,
          mobile_no: mobile_no,
          event: eventID
        });
        eventRegister.save(function(err) {
          if (!err) {
            console.log("Succefully saved");
            notifier.notify("Event Register Successfully!!!!!!");
          }
        })
      }
    }
  })

  res.redirect("/currentEvent#event")

})

//Contact
app.get("/contact", function(req,res){
  res.render("Contact");
})

app.post("/contact", function(req,res){
  console.log("Successfully send");
  res.redirect("Contact");
})

//Quiz
app.get("/quiz", function(req,res){
  res.render("quiz");
})
//Logout
app.get("/logout", function(req, res){

  delete req.session;
  //req.logout();
  res.redirect("/Login");
})


//setting the Server
app.listen(3000, function() {
  console.log("Server started on port 3000");
});
