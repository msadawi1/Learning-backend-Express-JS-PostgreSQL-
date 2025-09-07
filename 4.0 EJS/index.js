import express from "express";

const app = express();
const port = 3000;
const d = new Date();
let day = 0;

app.get("/", (req, res) => {
    res.render("index.ejs", {day_index: day});
})

app.listen(3000, () => {
    console.log("App running on port " + port);
})