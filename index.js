'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const contentTypesNew = require('./content_types');
const urlHelper = require('url');

var assetsDir = './public';
var contentTypes = contentTypesNew();

var fileExists = (req, res) => {
	return new Promise (( resolve, reject ) => {
		let filePath = path.join (assetsDir, urlHelper.parse (req.url).pathname);
		fs.exists (filePath, ( result )=> {
			if (result) {
				resolve ([ req, res, filePath ]);
			} else {
				reject ();
			}
		});
	});
};

var readFile = (arr) => {
	let req = arr[ 0 ];
	let res = arr[ 1 ];
	let filePath = arr[ 2 ];
	return new Promise (( resolve, reject ) => {
		fs.readFile (filePath, ( err, text )=> {
			if (err) {
				reject ();
			}
			resolve ([ req, res, filePath, text ]);
		});
	});
};


var response = (req, res) => {
	return fileExists (req, res).then (readFile).then (( arr )=> {
			let filePath = arr[ 2 ];
			let text = arr[ 3 ];
			let contentType = contentTypes[ path.extname (filePath).replace (/\./, '') ];
			res.writeHead (200, {'Content-Type': contentType});
			res.write (text.toString ());
			res.end ();
		},
		()=> {
			res.writeHead (404);
			res.end ();
		});
};

var errorResponse = (err, socket) => {
	socket.end ('HTTP/1.1 400 Bad Request\r\n\r\n');
};

const server = http.createServer(response);

server.on('clientError', errorResponse);
server.listen(8001);


