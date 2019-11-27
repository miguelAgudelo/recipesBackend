'use strict'
const validator = require('validator');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);

const controller = {
    save: (req, res) => {
        const params = req.body;
        let validate_name = false;
        let validate_email = false;
        let validate_password = false;

        try{
            validate_name = !validator.isEmpty(params.name);
            validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
            validate_password = !validator.isEmpty(params.password) && validator.isByteLength(params.password,{min:8});
        }catch(err){
            return res.status(200).send({
                status: 'error',
                message: 'Faltan datos por enviar !!!'
            });
        }
        var query = User.findOne({'email': params.email});

        console.log(query.user);
        if(query.user){
            return res.status(200).send({
                status: 'error',
                message: 'el correo ya exite!!'
            });
        }else if(validate_name && validate_email && validate_password){
            let user = new User();
            user.name = params.name;
            user.email = params.email;
            bcrypt.hash(params.password, salt, function(err, hash) {
                if(err){
                    return res.status(404).send({
                        status: 'error',
                        message: 'no pudo ser registrado !!!'
                    });
                }
                user.password = hash
                user.save((err, userStored) => {

                    if(err || !userStored){
                        return res.status(404).send({
                            status: 'error',
                            message: 'no pudo ser registrado !!!'
                        });
                    }
    
                    // Devolver una respuesta 
                    return res.status(200).send({
                        status: 'success',
                        message: 'usted se ha registrado con exito!!'
                    });
    
                });
            });
            

        }else{
            return res.status(200).send({
                status: 'error',
                message: 'Los datos no son válidos !!!'
            });
        }

    },
    


};  // end controller

module.exports = controller;