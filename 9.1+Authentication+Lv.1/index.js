import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: 'postgres',
  password: 'admin',
  database: 'authentication',
  host: "localhost",
  port: 5432,
});

db.connect();

async function signUp(email, password) {
  await db.query(`
    INSERT INTO users
    (email, password)
    VALUES ($1, $2)`, [email, password]);
}

async function authenticate(email, password) {
  const response = await db.query("SELECT * FROM users WHERE email=$1", [email]);
  if (response.rowCount === 0)
    return -1;
  else
    if (response.rows[0].password === password)
      return 1
    else
      return 0
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.post("/register", async (req, res) => {
  const email = req.body.username;
  const password = req.body.password;
  try {
    await signUp(email, password);
    res.render("secrets.ejs");
  } catch (err) {
    console.error("Error: ", err.stack);
    res.redirect("/login");
  }
});

app.post("/login", async (req, res) => {
  const email = req.body.username;
  const password = req.body.password;
  const auth = await authenticate(email, password);
  if (auth === 1)
    res.render("secrets.ejs");
  else if (auth === 0)
    res.send("Incorrect password");
  else
    res.send("Email does not exist");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
