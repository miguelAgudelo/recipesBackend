'use strict'
var express = require('express');
var jwt = require('jsonwebtoken');
var config = require('../configs/config');
var app = express();
const User = require('../models/user');
app.set('mykey', config.jwtkey);
const bcrypt = require('bcryptjs');

var controller = {

    login: (req, res) => {
        User.findOne({ email: req.body.email},(err, user) => {
            if(err || !user){
                return res.status(200).send({
                    status: 'error',
                    message: 'datos incorrectos !! si no esta registrado hagalo'
                });
            }
            bcrypt.compare(req.body.password, user.password, function(err, response) {
                if(err || !response){
                    return res.status(200).send({
                        status: 'error',
                        message: 'datos incorrectos !! si no esta registrado hagalo'
                    });
                }
                console.log(response)
                const payload = {
                    check: true,
                    username: user.name,
                    useremail: user.email
                };
                const token = jwt.sign(payload, app.get('mykey'), {
                    expiresIn: 14400
                });
                return res.status(200).send({
                    status: 'success',
                    message: 'Autentificación correcta',
                    userInfo: { token: token}
                });
            });
        });

    },


};  // end controller

module.exports = controller;