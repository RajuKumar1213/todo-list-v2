const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require("lodash");

mongoose.connect("mongodb://localhost:27017/todoListDB");

const app = express();

app.set('view engine', 'ejs');

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));



const itemSchema = new mongoose.Schema({
    name: String
});


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

const listSchema = {
    name: String,
    items: [itemSchema]
}

const List = mongoose.model("list", listSchema);



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
    const listName = req.body.list;

    const newItem = new Item({
        name: itemName
    });

    if (listName === "Today") {
        newItem.save();
        res.redirect("/");
    }
    else {
        List.findOne({ name: listName }, function (err, foundList) {
            foundList.items.push(newItem);
            foundList.save();
            res.redirect("/" + listName);
        })
    }





})

app.post("/delete", function (req, res) {
    const checkbox_id = req.body.checkbox;
    const listName = req.body.listName;



    if(listName === "Today"){
        Item.findByIdAndRemove(checkbox_id, function (err) {
            if (err) {
                console.log(err);
            }
            else {
                console.log("item removed successfully");
            }
            res.redirect("/");
        });

    }
    else {
        List.findOneAndUpdate({name : listName}, {$pull : {items : {_id : checkbox_id}}} , function(err , foundList){
            if(!err){
                res.redirect("/" + listName);
            }
        })
    }

});


app.get("/:customListName", function (req, res) {
    customListName = _.capitalize(req.params.customListName);


    List.findOne({ name: customListName }, function (err, foundList) {
        if (!err) {
            if (!foundList) {
                // create a new 

                const list = new List({
                    name: customListName,
                    items: defaultItem
                })
                list.save();
                res.redirect("/" + customListName);
            }
            else {
                // show an existing list
                res.render("index", { listTitle: foundList.name, newListItems: foundList.items });

            }
        }

    })

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


