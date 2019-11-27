
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var IngredientSchema = Schema({name:String,medida:String,cant:String});
var RecipeSchema = Schema({
    name: String,
    description: String,
    date: { type: Date, default: Date.now },
    image: String,
    note: String,
    ingredients: [IngredientSchema],
    instruccions: [String]
});


module.exports = mongoose.model('Recipe', RecipeSchema);