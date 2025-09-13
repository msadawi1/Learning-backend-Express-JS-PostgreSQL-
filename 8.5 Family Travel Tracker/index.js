import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: "admin",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let currentUserId = 1;
let users = [];

async function checkVisisted() {
  const result = await db.query(
  `SELECT country_code 
  FROM visits
  JOIN countries ON countries.id = visits.country_id
  WHERE user_id=$1`,
  [currentUserId]  
  );
  let countries = [];
  result.rows.forEach((country) => {
    countries.push(country.country_code);
  });
  return countries;
}
app.get("/", async (req, res) => {
  const countries = await checkVisisted();
  console.log("User ID: ", currentUserId);
  try {
    const result = await db.query("SELECT * FROM users")
    console.log(result.rows);
    users = result.rows;
  } catch (err) {
    console.log("Error: ", err.stack);
  }
  const current_user = users.find((user) => user.id===currentUserId)
  const color = current_user.color;
  res.render("index.ejs", {
    countries: countries,
    total: countries.length,
    users: users,
    color: color,
  });
});

app.post("/add", async (req, res) => {
  const input = req.body["country"];
  const countries = await checkVisisted();
  const current_user = users.find((user) => user.id === currentUserId)
  const color = current_user.color;
  try {
    const result = await db.query(
      "SELECT id FROM countries WHERE country_name ILIKE '%' || $1 || '%';",
      [input]
    );
    const data = result.rows[0];
    const countryID = data.id;
    try {
      await db.query(
        "INSERT INTO visits VALUES ($1, $2)",
        [currentUserId, countryID]
      );
      res.redirect("/");
    } catch (err) {
      console.log(err);
      res.render("index.ejs", {
        countries: countries,
        total: countries.length,
        users: users,
        color: color,
        error: "Country has already been added, Try again.",
      });
    }
  } catch (err) {
    console.log(err);
    res.render("index.ejs", {
      countries: countries,
      total: countries.length,
      users: users,
      color: color,
      error: "Country name does not exist, Try again.",
    });
  }
});

app.post("/user", async (req, res) => {
  const is_add = req.body["add"];
  const user_id = req.body["user"];
  if(is_add) {
    res.render("new.ejs");
  }
  else if(user_id) {
    currentUserId = parseInt(user_id);
    res.redirect("/");
  }
  else {
    res.status(400).send("Invalid form submission");
  }
});

app.post("/new", async (req, res) => {
  const user_name = req.body["name"];
  const user_color = req.body["color"];
  try {
    const response = await db.query("INSERT INTO users (name, color) VALUES ($1, $2) RETURNING id", [user_name, user_color]);
    currentUserId = response.rows[0]['id'];
  } catch (err) {
    console.log("Error executing query: ", err.stack);
  }
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
