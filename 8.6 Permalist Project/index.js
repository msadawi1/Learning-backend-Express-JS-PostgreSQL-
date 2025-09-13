import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "permalist",
  password: "admin",
  port: 5432,
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let items = [];
async function getItems(date) {
  try {
    const response = await db.query("SELECT * FROM items WHERE date=$1", [date]);
    if(response.rows) {
      console.log(response.rows);
      items = response.rows;
    }
    else
      items = [];
  } catch (err) {
    console.log("Error fetching items: ", err.stack);
    items = [];
  }
}


async function addItem(item, date) {
  try {
    const res = await db.query(`
      INSERT INTO items
      (title, date)
      VALUES ($1, $2)
      RETURNING *`, [item, date]);
    console.log(res.rows);
  } catch (err) {
    console.log("Error adding item: ", err.stack);
  }
}

async function editItem(id, value) {
  try {
    const res = await db.query(`
      UPDATE items
      SET title=$1
      WHERE id=$2
      RETURNING *`, [value, id]);
    console.log(res.rows);
  } catch (err) {
    console.log("Error updating item: ", err.stack);
  }
}

async function deleteItem(id) {
  try {
    await db.query(`
      DELETE FROM items
      WHERE id=$1
      `, [id]);
  } catch (err) {
    console.log("Error deleting item: ", err.stack);
  }
}


app.get("/", async (req, res) => {
  const date = new Date();
  let currentDate = date.toISOString().split('T')[0];
  if (req.query['date']) {
    currentDate = req.query['date'];
  }
  await getItems(currentDate);
  res.render("index.ejs", {
    listTitle: currentDate,
    listItems: items,
  });
});

app.post("/add", (req, res) => {
  const item = req.body.newItem;
  if(item.length > 0)
    addItem(item, req.body.date);
  res.redirect(`/?date=${req.body.date}`);
});

app.post("/edit", async (req, res) => {
  const id = req.body['updatedItemId'];
  const title = req.body['updatedItemTitle'];
  if(!id || !title)
    res.status(400).send("Error: missing " + (id ? "title" : "id"));
  await editItem(id, title);
  res.redirect(`/?date=${req.body.date}`);
});

app.post("/delete", async (req, res) => {
  const id = req.body['deleteItemId'];
  if(!id)
    res.status(400).send("Error: missing id");
  await deleteItem(id);
  res.redirect(`/?date=${req.body.date}`);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
