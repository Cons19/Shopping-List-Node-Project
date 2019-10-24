const mongoose = require("mongoose");

const List = mongoose.model("shopping_list", {
    item: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    quantity: {
        type: Number,
        required: true,
        trim: true,
        default: 0, 
        validate(value) {
            if(value < 0) {
                throw new Error("Quantity must be a positive number");
            }
        }
    }
});

module.exports = List;