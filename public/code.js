// changes bundle this file
let receiverID;
const socket = io();
const crypto = require('crypto');


// Generate room id 
function generateID(){
	return `${Math.trunc(Math.random()*999)}-${Math.trunc(Math.random()*999)}-${Math.trunc(Math.random()*999)}`;
}
// sends encrypted room id to the server
document.querySelector("#sender-start-con-btn").addEventListener("click",function(){
	let joinID = generateID();
	document.querySelector("#join-id").innerHTML = `
		<b>Room ID</b>
		<span>${joinID}</span>
	`;// changes here
	 let enJoinID = CryptoJS.AES.encrypt(joinID,'123').toString();
	socket.emit("sender-join", {
		uid:enJoinID,
		datameta:encryptionWithPublicKey(publicKey, joinID)
	});


});
// after sending it change the screens
socket.on("init",function(uid){
	receiverID = uid;
	document.querySelector(".join-screen").classList.remove("active");
	document.querySelector(".fs-screen").classList.add("active");
});

// breaking the file in chunks
document.querySelector("#file-input").addEventListener("change",function(e){
	let file = e.target.files[0];
	if(!file){
		return;		
	}
	let reader = new FileReader();
	reader.onload = function(e){
		let buffer = new Uint8Array(reader.result);

		let el = document.createElement("div");
		el.classList.add("item");
		el.innerHTML = `
				<div class="progress">0%</div>
				<div class="filename">${file.name}</div>
		`;
		document.querySelector(".files-list").appendChild(el);
		
		shareFile({
			filename: file.name,
			total_buffer_size:buffer.length,
			buffer_size:1024,
		}, buffer, el.querySelector(".progress"));
	}
	reader.readAsArrayBuffer(file);
});
function shareFile(metadata,buffer,progress_node){
	socket.emit("file-meta", {
		uid:receiverID,
		metadata:metadata
	});
	
	socket.on("fs-share",function(){
		let chunk = buffer.slice(0,metadata.buffer_size);
		buffer = buffer.slice(metadata.buffer_size,buffer.length);
		progress_node.innerText = Math.trunc(((metadata.total_buffer_size - buffer.length) / metadata.total_buffer_size * 100));
		if(chunk.length != 0){
			socket.emit("file-raw", {
				uid:receiverID,
				buffer:chunk
			});
		} else {
			console.log("Sent file successfully");
		}
	});
};


// encrypt with public key

function encryptionWithPublicKey(publicKey, data) {
    
    const bufferData = Buffer.from(data, 'utf8');

   return crypto.publicEncrypt(publicKey, bufferData);
}


const publicKey = `-----BEGIN RSA PUBLIC KEY-----
MIGJAoGBALl0XWvB9HAOu+/7g1jEcjblrg27KHZVZRTMJkPJQwDgMYJjty7DfR54
RnXWGtORlTpLq1xcLneZOSKFQ/R9kRmPoC19CCNCnNL0NN5ee8cnd9SeBx79k/Rp
lJJMWwBaFEDIq0zxSjQ7gPev3F8tP2N1rJ7hj6xE5RdCACW6qj7xAgMBAAE=
-----END RSA PUBLIC KEY-----`
