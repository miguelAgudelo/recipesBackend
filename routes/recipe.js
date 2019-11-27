'use strict'

var express = require('express');
var RecipeController = require('../controllers/recipe');
var AuthController = require('../controllers/auth');
var UserController = require('../controllers/user');
var router = express.Router();

var multipart = require('connect-multiparty');
var md_upload = multipart({ uploadDir: './upload/recipes'});
var protectedRoute = require('../middleware/protectRoute')
// Rutas útiles

router.get('/recipes/:search?', RecipeController.getRecipes);
router.get('/recipe/:id', RecipeController.getRecipe);
router.get('/get-image/:image', RecipeController.getImage);


//protectedRoute
router.get('/verify',protectedRoute, (req,res) => {
    return res.status(200).send({
        message: 'pass'
    });
});
router.post('/save',protectedRoute, RecipeController.save);
router.put('/save/:id',protectedRoute, RecipeController.update);
router.delete('/recipe/:id',protectedRoute, RecipeController.delete);
router.post('/upload-image/:id?',protectedRoute, md_upload, RecipeController.upload);
router.get('/misrecipe/:search?',protectedRoute, RecipeController.getMisRecipe);
//
router.post('/auth', AuthController.login);
router.post('/user', UserController.save);

module.exports = router;