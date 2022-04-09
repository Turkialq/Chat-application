require("dotenv").config();
const express = require("express");
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const passport = require("passport");
const localStrategy = require("passport-local");
const saltRounds = process.env.SALT_ROUNDS;


const Schema = mongoose.Schema;
const app = express();


app.use(express.static("public"));
app.use(express.json());
app.use(bodyParser.urlencoded({extended:true}));

//Database setup

mongoose.connect('mongodb+srv://Turki:Taylorswift12@cluster0.ptkvk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'
).then(() => {
    app.listen(process.env.PORT || 3000, () => {
        console.log("Server is up on port 3000");
    });
}).catch(err => {
    console.log("Database Failed To Connect"+err);
});

const userPasswordSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    }
}, {timestamps: true});

const userPasswordModel = mongoose.model('userPasswordModel', userPasswordSchema);


//  Loging routes
app.get("/", (req, res) => {
    res.sendFile("/Users/turkialqahtani/Desktop/CSS-info-project/public/login.html" );
});
// Login and Database checking
app.post("/",async(req, res)   =>  {
    let userEmail = req.body.email;
    let userPassword = req.body.password;
    userPasswordModel.findOne({email: userEmail}, (error, foundUser) =>{
        if(error) {
            console.log(error);
        } else {
            bcrypt.compare(userPassword, foundUser.password, function(err, result) {
                if(result == true) {
                    res.send("User auth is done... implementing next phase(FileShring)");
                    
                } else {
                    console.log("Incorrect password..");
                }
            });
        }
    });
});

app.get("/signup", (req, res) => {
    res.sendFile("/Users/turkialqahtani/Desktop/CSS-info-project/public/signup.html");
});

// Sign up the user and uploads to Database with hashed passwords
app.post("/signup", async (req, res) => {
    let userName = req.body.name;
    let userEmail = req.body.email;
    let userPassword = req.body.password;

    bcrypt.hash(userPassword, saltRounds, (error, result) => {
        const dbData = new userPasswordModel({
            email: userEmail,
            password: result,
            name: userName
        });
        dbData.save()
        .then(result => {
        res.redirect("/");
        })
        .catch(error => {
        console.log(error);
        });
    });

});



