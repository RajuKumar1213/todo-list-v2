const express = require("express");
const bodyParser = require("body-parser");
// const ejs = require("ejs");s
const mongoose = require("mongoose");
// const date = require(__dirname+ "/date.js");

mongoose.connect("mongodb://localhost:27017/todoListDB");

const app = express();

app.set('view engine', 'ejs');

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));


const itemSchema = new mongoose.Schema({
    name: String
});

const listSchema = new mongoose.Schema({
    name : String,
    items : [itemSchema]
})

const Item = mongoose.model("item", itemSchema);



const item1 = new Item({
    name: "Welcome to your todolist!"
});

const item2 = new Item({
    name: "Hit the + button to add a new item."
});

const item3 = new Item({
    name: "<-- Hit this to delete an item."
})

const defaultItem = [item1, item2, item3];



app.get("/", function (req, res) {

    Item.find({}, function (err, foundItems) {

        if (err) {
            console.log(err);
        }
        else if (foundItems.length === 0) {
            Item.insertMany(defaultItem, function (err) {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log("Successfully saved to the database.");
                }
            });
            res.redirect("/");
        }
        else {
            res.render("index", {
                listTitle: "Today",
                newListItems: foundItems
            });

        }
    });

})

app.post("/", function (req, res) {
    const itemName = req.body.newItem;

    const newItem = new Item ({
        name : itemName
    });

    newItem.save();

    res.redirect("/");

})

app.post("/delete" , function(req, res){
    const checkbox_id = req.body.checkbox;
    
    Item.findByIdAndRemove(checkbox_id , function(err){
        if(err){
            console.log(err);
        }
        else {
            console.log("item removed successfully");
        }
        res.redirect("/");
    });
});


app.get("/:customListName" , function(req , res){
    const customListName  = req.params.customListName;

})

app.get("/work", function (req, res) {
    res.render("index", { listTitle: "Work List", newListItems: workItmes });
})

app.get("/about", function (req, res) {
    res.render("about");
})

app.get("/contact", function (req, res) {
    res.render("contact");
})

app.listen(3000, function () {
    console.log("Server is running at port 3000");
})


