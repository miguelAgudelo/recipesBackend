'use strict'

const validator = require('validator');
const fs = require('fs');
const path = require('path');

const Recipe = require('../models/recipe');
const User = require('../models/user');

var express = require('express');
var jwt = require('jsonwebtoken');
var config = require('../configs/config');
var app = express();
app.set('mykey', config.jwtkey);


var controller = {


    save: (req, res) => {
        
        
        let params = req.body.recipe;
        let userinfo =jwt.verify(req.body.user, app.get('mykey'));
        //console.log(userinfo)


        let validate_name = false;
        let validate_description = false;

        try{
            validate_name = !validator.isEmpty(params.name);
            validate_description = !validator.isEmpty(params.description);
            //let validate_ingrediente = !validator.isEmpty(params.ingredients);

        }catch(err){
            return res.status(200).send({
                status: 'error',
                message: 'Faltan datos por enviar !!!'
            });
        }

        User.findOne({'recipes.name': params.name},(err,Response) => {
            console.log(Response)
            if(err | Response !== null){
                return res.status(200).send({
                    status: 'error',
                    message: 'el coctel ya esta registrado!!'
                });
            }else{
                User.findOne({'email': userinfo.useremail,'name':userinfo.username},((err,userStored)=>{
                    if(err || !userStored){
                        return res.status(200).send({
                            status: 'error',
                            message: 'usuario no existe!!'
                        });
                    }
                    if(validate_name && validate_description){
                    
                        //Crear el objeto a guardar
                        let recipe = new Recipe().schema;
            
                        // Asignar valores
                        recipe.name = params.name;
                        recipe.description = params.description;
                        recipe.ingredients = params.ingredients;
                        recipe.instruccions = params.instruccions;
                        recipe.image = null;
                        recipe.note = params.note;
        
                        User.updateOne({'email': userinfo.useremail,'name':userinfo.username},{$push: { 'recipes': recipe }},(err,recipeStored)=> {
                        // Guardar el recipe
                            
                            if(err || !recipeStored){
                                return res.status(404).send({
                                    status: 'error',
                                    message: 'la receta no se ha guardado !!!'
                                });
                            }
                            //console.log(recipeStored)
                            User.aggregate( 
                                [ 
                                    { $match : {"email":userinfo.useremail} },{ $project : { "recipes" : 1 } }, { $unwind : "$recipes" }
                                ], (err,recipes) =>{
                                    if(err || !recipes){
                                        return res.status(404).send({
                                            status: 'error',
                                            message: 'la receta no se ha guardado !!!'
                                        });
                                    }
                                    // Devolver una respuesta 
                                    return res.status(200).send({
                                        status: 'success',
                                        recipe: recipes[recipes.length-1].recipes
                                    });
                                }
                            );
                            
                            
            
                        });
            
                    }else{
                        return res.status(200).send({
                            status: 'error',
                            message: 'Los datos no son válidos !!!'
                        });
                    }
                }));
            }
        })
   
        

        
       
    },

    getRecipes: (req, res) => {


        var query = User.find({}).select('recipes email -_id');

        // Find
        query.sort('-_id').exec((err, recipes) => {

            if(err){
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al devolver las recetas !!'
                });
            }

            if(!recipes){
                return res.status(404).send({
                    status: 'error',
                    message: 'No hay recetas para mostrar !!'
                });
            }
            const recipesArray = recipes.filter((r) => {
                        return r.recipes.length > 0
                    }).map((r) => {
                        let recipesWemail = r.recipes.map((v) => {
                            const o = {'_id':v._id , 'name': v.name , 'image': v.image , 'description': v.description, 'author': r.email};
                            return o
                        })
                    
                        return recipesWemail 
                    })
            const recipeResponse = [];
            for(let rr of recipesArray){
                for(let r of rr)
                    recipeResponse.push(r)
            }
            return res.status(200).send({
                status: 'success',
                recipes: recipeResponse
            });

        });
    },

    getMisRecipe: (req, res) => {

        const token = req.headers['access-token'];
        let userinfo = jwt.verify(token, app.get('mykey'));
        //console.log(userinfo)


        const query = User.find({"email": userinfo.useremail}).select('recipes email -_id');
        //console.log("adadaadd")
        // Find
        query.sort('-_id').exec((err, recipes) => {
            //console.log(recipes)
            if(err){
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al devolver las recetas !!'
                });
            }

            if(!recipes){
                return res.status(404).send({
                    status: 'error',
                    message: 'No hay recetas para mostrar !!'
                });
            }
            const recipesArray = recipes.filter((r) => {
                        return r.recipes.length > 0
                    }).map((r) => {
                        let recipesWemail = r.recipes.map((v) => {
                            const o = {'_id':v._id , 'name': v.name , 'image': v.image , 'description': v.description, 'author': r.email};
                            return o
                        })
                        return recipesWemail 
                    })
            const recipeResponse = [];
            for(let rr of recipesArray){
                for(let r of rr)
                    recipeResponse.push(r)
            }
            return res.status(200).send({
                status: 'success',
                recipes: recipeResponse
            });

        });
    },

    getRecipe: (req, res) => {

        // Recoger el id de la url
        var recipeId = req.params.id;
        
        // Comprobar que existe
        if(!recipeId || recipeId == null){
            return res.status(404).send({
                status: 'error',
                message: 'No existe la receta !!'
            });
        }

        // Buscar la receta
        User.findOne({"recipes._id":recipeId},{"recipes.$":1,"date":1,"name":1} ,(err, recipe) => {
            if(err || !recipe){
                return res.status(404).send({
                    status: 'error',
                    message: 'No existe la receta !!'
                });
            }
            //seguro trae algo malofilter
            //console.log(recipe.recipes)
            //console.log(recipeId)
            // const re = []
            // for(let r of recipe.recipes){
                
            //     if(r._id == recipeId){
            //         re.push(r)
            //     }
            // }
           
            // Devolverlo en json
            console.log(recipe)
            return res.status(200).send({
                status: 'success',
                recipe: recipe.recipes[0],
                publication : {author:recipe.name,date:recipe.date}
            });

        });
    },

    update: (req, res) => {
        // Recoger el id del articulo por la url
        var recipeId = req.params.id;

        // Recoger los datos que llegan por put
        var params = req.body;

        // Validar datos
        try{
            var validate_name = !validator.isEmpty(params.name);
            var validate_description = !validator.isEmpty(params.description);
        }catch(err){
            return res.status(200).send({
                status: 'error',
                message: 'Faltan datos por enviar 2 !!!'
            }); 
        }
        
        User.findOne({'recipes._id': { $ne : recipeId},'recipes.name': params.name}, async (err,Response) => {
            console.log(Response)
            if(err | Response !== null){

                return res.status(200).send({
                    status: 'error',
                    message: 'el coctel ya esta registrado!!'
                });
                
            }else{
                if(validate_name && validate_description){
                    console.log(params.image)
                    if(params.image === null || params.image === undefined){
                        const recipeImg = await User.findOne({"recipes._id": recipeId},{ "recipes.image": 1 });
                        console.log("imagen:")
                        console.log(recipeImg)
                        params.image = recipeImg.recipes[0].image;
                    }
                    await User.findOneAndUpdate({'recipes._id': recipeId},{ $set : {'recipes.$':params}},{ new: true }, (err, recipeUpdated) => {
                        if(err){
                            return res.status(500).send({
                                status: 'error',
                                message: 'Error al actualizar !!!'
                            });
                        }
        
                        if(!recipeUpdated){
                            return res.status(404).send({
                                status: 'error',
                                message: 'No existe la receta !!'
                            });
                        }
                        
                        const ru = recipeUpdated.recipes.filter(r => r.name === params.name ? r : null)
                        //console.log(ru)
                        return res.status(200).send({
                            status: 'success',
                            recipe: ru[0]
                        });
                        
                    });
                }else{
                    // Devolver respuesta
                    return res.status(200).send({
                        status: 'error',
                        message: 'La validación no es correcta !!!'
                    });
                }
            }
        });
    },

    delete: (req, res) => {
        // Recoger el id de la url
        var recipeId = req.params.id;
        // Find and delete
        const token = req.headers['access-token'];
        let userinfo = jwt.verify(token, app.get('mykey'));
        console.log(recipeId)
        User.findOneAndUpdate({email: userinfo.useremail},{$pull: { "recipes" : { _id: recipeId } } }, (err, recipeRemoved) => {
            if(err){
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al borrar !!'
                });
            }
            console.log(recipeRemoved)
            if(!recipeRemoved){
                return res.status(404).send({
                    status: 'error',
                    message: 'No se ha borrado la receta, posiblemente no exista !!'
                });
            }

            return res.status(200).send({
                status: 'success',
                recipe: recipeRemoved
            });

        }); 
    },

    upload: (req, res) => {
        // Configurar el modulo connect multiparty router/article.js (hecho)

        // Recoger el fichero de la petición
        var file_name = 'Imagen no subida...';

        if(!req.files){
            return res.status(404).send({
                status: 'error',
                message: file_name
            });
        }

        // Conseguir nombre y la extensión del archivo
        var file_path = req.files.file0.path;
        var file_split = file_path.split('\\');

        // * ADVERTENCIA * EN LINUX O MAC
        // var file_split = file_path.split('/');

        // Nombre del archivo
        var file_name = file_split[2];

        // Extensión del fichero
        var extension_split = file_name.split('\.');
        var file_ext = extension_split[1];

        // Comprobar la extension, solo imagenes, si es valida borrar el fichero
        if(file_ext != 'png' && file_ext != 'jpg' && file_ext != 'jpeg' && file_ext != 'gif'){
            
            // borrar el archivo subido
            fs.unlink(file_path, (err) => {
                return res.status(200).send({
                    status: 'error',
                    message: 'La extensión de la imagen no es válida !!!'
                });
            });
        
        }else{
             // Si todo es valido, sacando id de la url
            var recipeId = req.params.id;
           
            if(recipeId){
                // Buscar el recipe, asignarle el nombre de la imagen y actualizarlo
               //console.log(recipeId)
                User.updateOne({'recipes._id': recipeId},{'$set':{'recipes.$.image': file_name}}, {new:true}, (err, recipeUpdated) => {

                    if(err || !recipeUpdated){
                        return res.status(200).send({
                            status: 'error',
                            message: 'Error al guardar la imagen de articulo !!!'
                        });
                    }

                    return res.status(200).send({
                        status: 'success',
                        recipe: recipeUpdated
                    });
                });
             }else{
                return res.status(200).send({
                    status: 'success',
                    image: file_name
                });
             }
            
        }   
    }, // end upload file

    getImage: (req, res) => {
        var file = req.params.image;
        var path_file = './upload/recipes/'+file;

        fs.exists(path_file, (exists) => {
            if(exists){
                return res.sendFile(path.resolve(path_file));
            }else{
                return res.sendFile(path.resolve('./upload/recipes/coctelera.jpg'));
            }
        });
    },

    search: (req, res) => {
        // Sacar el string a buscar
        var searchString = req.params.search;

        // Find or
        Article.find({ "$or": [
            { "title": { "$regex": searchString, "$options": "i"}},
            { "content": { "$regex": searchString, "$options": "i"}}
        ]})
        .sort([['date', 'descending']])
        .exec((err, articles) => {

            if(err){
                return res.status(500).send({
                    status: 'error',
                    message: 'Error en la petición !!!'
                });
            }
            
            if(!articles || articles.length <= 0){
                return res.status(404).send({
                    status: 'error',
                    message: 'No hay articulos que coincidan con tu busqueda !!!'
                });
            }

            return res.status(200).send({
                status: 'success',
                articles
            });

        });
    }

};  // end controller

module.exports = controller;