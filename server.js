/**
 * Created by ishi on 7/14/16.
 */
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var path = require('path');

var app = express();
var port  = 5000;
app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, './public')));
app.set('views', path.join(__dirname, './views'));

app.use(function(req, res, next) {
    console.log(`request method --> ${req.method} requested url is ${req.url}`);
    next();
});

/* ===========================================================*/
// This is how we connect to the mongodb database using mongoose -- "basic_mongoose" is the name of
//   our db in mongodb -- this should match the name of the db you are going to use for your project.
mongoose.connect('mongodb://localhost/animal_mongoose');

// creating schema using mongoose
var Schema = mongoose.Schema;
// mongoose schema
var AnimalSchema = new Schema({
    name: {type: String},
    description: {type: String}
}, {timestamps: true});

mongoose.model('Animal', AnimalSchema); // We are setting this Schema in our Models as 'User'
var Animal = mongoose.model('Animal'); // We are retrieving this Schema from our Models, named 'User'
/* ===========================================================*/

// display all mongoose
app.get('/', function (req, res, next) {
    Animal.find({},function (err, animals) {
        if(err){
            console.log('something went wrong');
        } else {
            console.log('got data successfully from database');
            console.log(animals);
            res.render('index', {animals, title: "Mongoose Dashboard"});
        }
    });
});

// render add mongoose page
app.get('/mongoose/new', function (req, res, next) {
    res.render('new', {Animal, title: "Mongoose Dashboard"});
});

// edit specific mongoose animal
app.post('/mongoose/:id/edit' , function (req, res, next) {
    var id = req.params.id;
    Animal.findById(id, function (err, animal) {
        if(err) {
            console.log('something went wrong');
        } else {
           console.log('edit animal') ;
           res.render('editAnimal', {animal, title: "Mongoose Dashboard"});
        }
    });
});

// display one mongoose
app.get('/mongoose/:id', function (req, res, next) {
    var id = req.params.id;
    Animal.findOne(id, function (err, animal) {
        if(err) {
            console.log('something went wrong');
        } else{
            console.log('Found animal');
            res.render('showOne', {animal, title: "Mongoose Dashboard"})
        }
    });
});


// creating custome id here to insert into DB auto id is too big


// inserting data into DB here.
app.post('/insert',function (req, res, next) {
    console.log(req.body.name, req.body.desc);

    var data = {
        name: req.body.name,
        description: req.body.desc
    };

    // create a new animal with the name and age corresponding to those from req.body
    var animal = new Animal(data);
    // Try to save that new Animal to the database (this is the method that actually inserts into the db) and run a callback function with an error (if any) from the operation.
    animal.save(function(err) {
        // if there is an error console.log that something went wrong!
        if(err) {
            console.log('something went wrong');
        } else { // else console.log that we did well and then redirect to the root route
            console.log('successfully added a Animal!');
            res.redirect('/');
        }
    });
});

app.post('/update/:id', function (req, res, next) {
    var id  = req.params.id;
    Animal.findById(id, function (err, animal) {
        if(err) {
            console.log('something went wrong');
        } else {
            animal.name = req.body.name;
            animal.desc = req.body.desc;

            animal.save();
        }
        res.redirect('/');
    });
});

app.post('/mongoose/:id/destroy', function (req, res, next) {
    var id = req.params.id;
    Animal.findByIdAndRemove(id).exec();
    res.redirect('/')
});

app.post('/mongoose/destroy-all', function (req, res, next) {
    Animal.remove({}, function (err) {
        if(err) {
            console.log('something went wrong');
        } else {
            console.log('All animals deleted successfully!');
        }
    });
    res.redirect('/')
});

app.get('*', function (req, res) {
    res.send("500 Bad request");
});

// this selects our port and listens
// note that we're now storing our app.listen within
// a variable called server. this is important!!
var server = app.listen(5000, function() {
    console.log("listening on port 5000");
});

module.exports = app;