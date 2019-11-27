var express = require('express');
var jwt = require('jsonwebtoken');
var config = require('../configs/config');
var app = express();
app.set('mykey', config.jwtkey);
const protectedRoute = express.Router(); 
protectedRoute.use((req, res, next) => {
    const token = req.headers['access-token'];
	
    if (token) {
      jwt.verify(token, app.get('mykey'), (err, decoded) => {      
        if (err) {
          return res.json({ mensaje: 'Token inválida' });    
        } else {
          req.decoded = decoded;    
          next();
        }
      });
    } else {
      res.send({ 
          mensaje: 'Token no proveída.' 
      });
    }
 });

 module.exports = protectedRoute;