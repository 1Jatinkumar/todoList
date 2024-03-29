//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose= require("mongoose");
const _ = require('lodash');

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static("public"));


// mongoose connect
mongoose.connect("mongodb+srv://admin-jatin:jatin145@cluster0.5e8l9dk.mongodb.net/todolistDB");
// mongoose schema

const itemsSchema = {
  name: String
};
const Item = mongoose.model("Item", itemsSchema);

const item1= new Item({name: "welcome to your todo list"});
const item2= new Item({name: "hit the + button to add"});
const item3= new Item({name: "hit checkbox to delete"});
const defaultItems = [item1, item2, item3]




const listSchema= {
  name: String,
  items: [itemsSchema]
}
const List  = mongoose.model("List", listSchema);





app.get("/", function(req, res) {

  Item.find(function(err, items){
    if(items.length===0){

      Item.insertMany(defaultItems, function(err){
        if(err){console.log(err);}
        else{console.log("default items added to database");}
      });res.render("/");
    }

    else{
      res.render("list", {listTitle: "Today", newListItems: items});
    }
  });
});



app.get("/:listName", function(req, res){
  const customListName= _.capitalize(req.params.listName);

  List.findOne({name:customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        const list= new List({name:customListName, items: defaultItems});
        list.save();
        res.redirect("/"+customListName);
      }
      else{
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });
});



app.post("/", function(req, res){
  const itemName= req.body.newItem;

  const listName= req.body.list;
  const item= new Item({
    name: itemName
  });

  if(listName==="Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});



app.post("/delete", function(req, res){
  const deleteedItemID= req.body.checkbox;
  const listName= req.body.listname;

  // console.log(listname);

  if(listName==="Today"){
    Item.findByIdAndRemove(deleteedItemID, function(err){
      if(err){console.log(err);}
      else{
        console.log("data deleted form Today list");
        res.redirect("/");
      }
    });
  }
  else{
    List.findOneAndUpdate({name:listName}, {$pull:{items:{_id:deleteedItemID}}}, function(err, foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }
});

app.get("/about", function(req, res){
  res.render("about");
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}


app.listen(port, function() {
  console.log("Server started successfully");
});
