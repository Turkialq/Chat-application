require("dotenv").config();
const express = require("express");
const http = require('http');
const app = express();
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const cryptoJS = require('crypto-js');
const saltRounds = process.env.SALT_ROUNDS;



const Schema = mongoose.Schema;


//Verifying front-end

app.use(express.static("public"));
app.use(express.json());
app.use(bodyParser.urlencoded({extended:true}));

//Database setup

mongoose.connect('mongodb+srv://Turki:Taylorswift12@cluster0.ptkvk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'
).then(() => {
    server.listen(process.env.PORT || 3000, () => {
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
        } else if(foundUser == null) {
            res.sendFile(__dirname+"/public/error.html");

        } else {
            bcrypt.compare(userPassword, foundUser.password, function(err, result) {
                if(result == true) {
                    let name = req.body.select;
                    console.log(name);
                    if (name === "sender") {
                        res.redirect("/sender");
                    }
                    if(name === "receiver") {
                        res.redirect("/receiver");
                    }                    
                } else {
                    res.sendFile(__dirname+"/public/error.html");

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

    bcrypt.hash(req.body.password,10, function(err, hash){
        const dbData = new userPasswordModel({
            email: userEmail,
            password: hash,
            name: userName
        });
        dbData.save(err => {
            if(err) {
                console.log(err);
            } else {
                res.redirect("/");
            }

        });
    });
});
app.get("/sender", (req,res) => {
	res.sendFile(__dirname+ "/public/sender.html");
});

app.get("/receiver", (req, res) => {
	res.sendFile(__dirname + "/public/receiver.html");
});

// Sockets and Filesharing and Decryption the data in the server side.

io.on("connection", function(socket){
	socket.on("sender-join",function(data){
        let decUID = cryptoJS.AES.decrypt(data.uid,'123').toString(cryptoJS.enc.Utf8);
		socket.join(decUID);
	});
	socket.on("receiver-join",function(data){
		socket.join(data.uid);
		socket.in(data.sender_uid).emit("init", data.uid);
	});
	socket.on("file-meta",function(data){
		socket.in(data.uid).emit("fs-meta", data.metadata);
	});
	socket.on("fs-start",function(data){
		socket.in(data.uid).emit("fs-share", {});
	});
	socket.on("file-raw",function(data){
		socket.in(data.uid).emit("fs-share", data.buffer);
	})
});



