import express from "express";
import bodyParser from "body-parser";
import pg from "pg";


const app = express();
const port = 3000;
const db = new pg.Client({
  user: 'postgres',
  host: 'localhost',
  database: 'world',
  password: 'admin',
  port: 5432
});


db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

async function getCountries() {
  let visited_countries = [];
  let country_codes = [];
  try {
    const response = await db.query("SELECT country_code FROM visited_countries")
    visited_countries = response.rows;
    visited_countries.forEach(country => {
      country_codes.push(country.country_code);
    });
  } catch (err) {
    console.log(err.stack)
  }
  return country_codes;
}

app.get("/", async (req, res) => {
  const country_codes = await getCountries();
  console.log(country_codes);
  res.render("index.ejs", { countries: country_codes, total: country_codes.length })
});

app.post("/add", async (req, res) => {
  const visited_country = req.body.country;
  const country_codes = await getCountries();
  try {
    const pattern = `%${visited_country}%`;
    const result = await db.query(
      "SELECT country_code FROM countries WHERE country_name ILIKE $1",
      [pattern]
    );
    const data = result.rows[0];
    const country_code = data['country_code'];
    try {
      await db.query(
        "INSERT INTO visited_countries (country_code) VALUES ($1)",
        [country_code]
      );
      res.redirect("/");
    }
    catch (error) {
      res.render("index.ejs", { 
        countries: country_codes,
        total: country_codes.length,
        error: "Country has been already added, try again",
      });
    }
  } catch (err) {
    console.log("Error: ", err.stack);
    res.render("index.ejs", { 
      countries: country_codes,
      total: country_codes.length,
      error: "Country name does not exist, try again"
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
