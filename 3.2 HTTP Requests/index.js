import express from "express";
const app = express();
const port = 3000;

app.listen(3000, () => {
    console.log(`Running server on port ${port}`);
})

app.get("/", (req, res) => {
    res.send('Homepage');
})
app.get("/contact", (req, res) => {
    res.send('Contact');
})
app.get("/about", (req, res) => {
    res.send('About');
})