var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Recipe= require('./recipe')
var RecipeSchema = Recipe.schema
var UserSchema = Schema({
    name: String,
    email: String,
    password: String,
    date: { type: Date, default: Date.now },
    recipes: [RecipeSchema],
});

module.exports = mongoose.model('User', UserSchema);