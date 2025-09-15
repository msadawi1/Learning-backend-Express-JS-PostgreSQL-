import express from "express";
import bodyParser from "body-parser";

let id_counter = 0;
const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

function Post(title, description, author, coverURL) {
    this.id = id_counter++;
    this.title = title;
    this.description = description;
    this.author = author;

    const today = new Date();
    this.date = today.getDate() + " " + monthNames[today.getMonth()] + " " + today.getFullYear();

    this.views = 0;
    this.likes = 0;
    this.authorField = "Writer";
    this.postCoverPicture = coverURL;
}
var blogPosts = [];

const top_n = 3;
const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// Homepage route
app.get("/", (req, res) => {
    res.render("index.ejs", { posts: blogPosts.slice(0, top_n).reverse() });
})

app.get("/post/:id", (req, res) => {
    const postID = Number(req.params.id);    
    const post = blogPosts[postID];
    if (!post) {
        return res.status(404).send("Post Not Found.");
    }
    post.views += 1;
    const suggested_posts = blogPosts.filter((post_to_filter) =>  post !== post_to_filter);
    suggested_posts.reverse();
    res.render("view-post.ejs", { post: post, suggested_posts: suggested_posts});
})

// Create webpage (get)
app.get("/create", (req, res) => {
    res.render("create.ejs");
})

// Help webpage (Get)
app.get("/help", (req, res) => {
    res.render("help.ejs");
})

// About webpage
app.get("/about", (req, res) => {
    res.render("about.ejs");
})

// Create webpage (after submit)
app.post("/create", (req, res) => {
    const new_post = new Post(req.body['title'], req.body['description'], req.body['name'], req.body['thumbnail'])
    blogPosts.push(new_post);
    res.redirect(`/post/${new_post.id}`);
})

// Help webpage (after send)
app.post("/help", (req, res) => {
    res.render("help.ejs", {method: req.method, message: "Successfully sent your email! We will get backt to you soon."});
})

app.post("/like-post/:id", (req, res) => {
    const postID = req.params.id;
    const post = blogPosts[postID];
    if (!post)
        res.status(404).send("Post not found");
    post.likes += 1;
    res.redirect("/post/" + postID);
});

app.listen(port, () => {
    console.log("Server running on port " + port);
})