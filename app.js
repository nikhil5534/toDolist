//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose =require("mongoose");
const app = express();
const _=require("lodash");

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://Nikhil-admin:Ayush220603@cluster0.xc17dpn.mongodb.net/toDolistDb");
const itemSchema = new mongoose.Schema({
    name:String
})
const Item =mongoose.model("Item",itemSchema);

        const item1 =  new Item({
            name:"Welcome to toDolist"
        });
        const item2 =  new Item({
            name:"Hit the + button  to add to new items"
        });
        const item3 =  new Item({
            name:"<-- Hit this to delete an item"
        });

const workItems = [];
const defaultItems =[item1,item2,item3];
const listSchema={
  name:String,
  items:[itemSchema]   
};
const List =mongoose.model("List",listSchema)
app.get("/", function(req, res) {
    const foundItems = Item.find({})
    .then(foundItems =>{
    if (foundItems.length ===0) {
      Item.insertMany(defaultItems);
      res.redirect("/");
    } 
    else {
      res .render("list",{listTitle: "Today" ,newListItems: foundItems});
    }
    
    });

});
app.get("/:costumListName",function(req,res){
  const costumListName = _.capitalize([req.params.costumListName]);
  List.findOne({name:costumListName})
  .then(foundList =>{
      if (!foundList) {
        const list =  new List({
          name:costumListName,
          items:defaultItems
        });
        list.save();
        res.redirect("/"+ costumListName);
      }
      else{
        res.render("list",{listTitle:foundList.name ,newListItems: foundList.items});
      }
  })
})
app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName= req.body.list;
  const item = new Item({
    name:itemName
  });
  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name:listName})
    .then(foundList =>{
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);       
    });
  }
});
app.post("/delete",function(req,res){
  const checkedItemId= req.body.checkbox;
  const listName = req.body.listName;
  if (listName=== "Today") {
     Item.findByIdAndRemove(checkedItemId)
  .then(err => {
      console.log(err);
      res.redirect("/")
  })
  } else {
    List.findOneAndUpdate({name: listName},{$pull:{items:{_id :checkedItemId}}})
    .then(err =>{
      if (!err) {
        res.redirect("/"+listName);   
      }
  });
}
});
app.get("/about", function(req, res){
  res.render("about");
});
app.listen(process.env.PORT||3000,function(){
  console.log("Server running at port 3000");
});