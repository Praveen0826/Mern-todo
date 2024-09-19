
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const cors = require("cors");

// Middleware
app.use(express.json()); // Parse incoming JSON requests
app.use(cors()); // Enable CORS

// Creating the schema
const todoschema = new mongoose.Schema({
    title: {
        type: String,
        required: true, // Ensures that the title is required
    },
    description: String,
});

// Creating the model
const todomodel = mongoose.model('Todo', todoschema);

// Connecting mongoose
mongoose.connect("mongodb://127.0.0.1:27017/mern")
    .then(() => {
        console.log("db connected");
    })
    .catch((err) => {
        console.log(err);
    });

// POST request to create a new todo
app.post("/todos", async (req, res) => {
    const { title, description } = req.body;

    // Check if title is provided
    if (!title) {
        return res.status(400).json({ message: "Title is required" });
    }

    try {
        const newTodo = new todomodel({ title, description });
        await newTodo.save(); // Save to the database
        res.status(201).json(newTodo); // Return the new todo
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
});

// GET request to fetch all todos
app.get("/todos", async (req, res) => {
    try {
        const todos = await todomodel.find(); // Fetch all todos from the database
        res.json(todos);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
});


app.put("/todos/:id", async (req, res) => {
    const { title, description } = req.body;
    const id = req.params.id;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
    }

    try {
        const updatedTodo = await todomodel.findByIdAndUpdate(
            id,
            { title, description },
            { new: true }
        );

        if (!updatedTodo) {
            return res.status(404).json({ message: "Todo not found" });
        }

        res.json(updatedTodo);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
});



app.delete("/todos/:id", async (req, res) => {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
    }

    try {
        const deletedTodo = await todomodel.findByIdAndDelete(id);
        if (!deletedTodo) {
            return res.status(404).json({ message: "Todo not found" });
        }
        res.status(204).end();
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
});

// Start the server
const port = 8000;
app.listen(port, () => {
    console.log("The server is running on port " + port);
});
