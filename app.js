const express = require("express");
const path = require("path");
const bodyParser = require('body-parser');
require("./db/mongoose");
const List = require("./models/list");

const app = express();
const port = process.env.PORT || 3000;

const pathToDirectory = path.join(__dirname, './public');

app.use(express.static(pathToDirectory));
app.use(express.json());
app.use(bodyParser.urlencoded({extended : true}));

app.get("", (req, res) => {
    res.send("testing!");
});

app.get("/getAll", async (req, res) => {
    try {
        const results = await List.find({});
        res.json({
            status: 200,
            list: results
        });
    } catch(e) {
        res.status(500).send();
    }
    
});

app.post("/create", (req, res) => {
    console.log(req.body);
    const list = new List(req.body);

    List.find({ item: req.body.item}, (err, docs) => {
        if(!docs.length) {
            list.save().then(() => {
                res.json({
                    status: 201,
                    message: 'Element succesfully added to the shopping list!',
                    list
                });
            }).catch((e) => {
                res.json({
                    status: 400,
                    message: 'There was an error! Element could not be added to the shopping list!',
                    error: e
                });
            });
        } else {
            res.json({
                status: 405,
                message: 'The item is already in the shopping list!'
            });
        }
    });
});

app.delete("/delete/:item", (req, res) => {
    console.log(req.body);
    List.deleteOne({ item: req.params.item }).then(deletedUser => {
        console.log(deletedUser);
        res.json({
            status: 200,
            message: "Succesfully deleted!"
        });
    }).catch((err) => {
        res.json({
            status: 400,
            message: "Deletion failed!",
            error: err
        });
    });
});

app.put("/update/:item", (req, res) => {
    console.log(req.body);
    const item = req.body.item;
    const quantity = req.body.quantity;

    List.findOneAndUpdate({ item: req.params.item }, { item, quantity }).then(updatedUser => {
        console.log(updatedUser);
        res.json({
            status: 200,
            message: "Succesfully updated!"
        });
    }).catch((err) => {
        res.json({
            status: 400,
            message: "Update failed!",
            error: err
        });
    });
});

app.delete("/deleteAll", async (req, res) => {
    try {
        const removeAll = await List.remove({});
        res.json({
            status: 200,
            removed: removeAll
        });
    } catch(e) {
        res.status(500).send();
    }
});


app.listen(port, () => {
    console.log("Server is up on port " + port);
});