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
//const saltRounds = process.env.SALT_ROUNDS;



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
        // chages decrypt the outerlayer(public) -> then inner layer(aes)
          decrypttionWithPrivateKey(privateKey, data.buffer);
          decUID = cryptoJS.AES.decrypt(data.uid,'123').toString(cryptoJS.enc.Utf8);
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


// decryption using private key

function decrypttionWithPrivateKey(privateKey, data){
    const textToChars = text => text.split('').map(c => c.charCodeAt(0));
    const applySaltToChar = code => textToChars(privateKey).reduce((a,b) => a ^ b, code);
    return encoded => encoded.match(/.{1,2}/g)
      .map(hex => parseInt(hex, 16))
      .map(applySaltToChar)
      .map(charCode => String.fromCharCode(charCode))
      .join('');
     
}


const privateKey =` -----BEGIN RSA PRIVATE KEY-----
 MIICXAIBAAKBgQC5dF1rwfRwDrvv+4NYxHI25a4Nuyh2VWUUzCZDyUMA4DGCY7cu
 w30eeEZ11hrTkZU6S6tcXC53mTkihUP0fZEZj6AtfQgjQpzS9DTeXnvHJ3fUngce
 /ZP0aZSSTFsAWhRAyKtM8Uo0O4D3r9xfLT9jdaye4Y+sROUXQgAluqo+8QIDAQAB
 AoGBALRZgoRJgSH8Yi32JPyNRhk28TXvPWEemIdKJSgksGFIpT0NJdZ3S9T22Ga9
 ySbYXAvuDH5sMtAiFNsKSFSaTCCr+I0tgDJ9q5o1ZOXCwPWgiaTuzjYu7+ISfVPh
 43Do4GIje17KgaC0r9/q8SlWPRz1Kxgpi8RfZzfmBPOHMdOFAkEA5t2x/myhaLXC
 4mEYSiKO4krwntzi6F5VvPbXnwq/foF1UWB6+zr/opeXZrnuWiFKMrhuIEvqlzKN
 PyMbI8WCIwJBAM2lCfoNjhhEMh+sLhETc4LpbWJUgdEyjAXiCF0/BKxhHY+ephc0
 ORlNCZe9/hepZy51zUX6hwJR8WKwFGCvmdsCQC7cu3+wn0b49jkrilmqECThH1yv
 66NNWswDsxsGfH56Ws0M74nFnRRs/v+MKFTFQyFujHQj1NeiHEe/oYeuVM8CQCFA
 b3WMXY6U8FnouGYwc/wWDIbazUbrWnLVEq8pMnNBHMuNRqP34MezijqMERr4XGPJ
 zpBjKxN39oUTnafonQMCQAMwxHB2u6sPIomAHRpcVLNRmNP7TIftA50mQhRHDtoB
 DsQQw/zEk5i/CGnqq1Y3f98inhE52hg4GKcoSKGNx94=
 -----END RSA PRIVATE KEY-----`

