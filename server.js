const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const fetch = require('node-fetch');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

const db = new sqlite3.Database('diary.db3', (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    db.run(`CREATE TABLE IF NOT EXISTS diaries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT,
      sentiment TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
  }
});

app.post('/save', (req, res) => {
  const content = req.body.content;
  const sentiment = req.body.sentiment;
  db.run(`INSERT INTO diaries (content, sentiment) VALUES (?, ?)`, [content, sentiment], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json({ message: 'Diary saved successfully.', id: this.lastID });
  });
});


app.get('/analyze', async (req, res) => {
  const text = req.query.text;

  if (!text) {
    res.status(400).json({ error: "Text is missing or empty." });
    return;
  }
  const client_id = "y1ck9saui7";
  const client_secret = "Zki1wo2TCX22tbhpcyZqAqESshpaATDiuhoiYlCl";
  const url = "https://naveropenapi.apigw.ntruss.com/sentiment-analysis/v1/analyze";
  const headers = {
    "X-NCP-APIGW-API-KEY-ID": client_id,
    "X-NCP-APIGW-API-KEY": client_secret,
    "Content-Type": "application/json",
  };
  const data = {
    content: text.slice(0, Math.min(text.length, 900)),
  };
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(data),
    });
    const result = await response.json();
    
    // Respond with the sentiment analysis result
    res.json({ sentiment: result.document.sentiment });
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});

app.get('/capsule', async (req, res) => {
  try {
    const rows = await executeQuery('SELECT * FROM diaries');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
});

function executeQuery(query) {
  return new Promise((resolve, reject) => {
    db.all(query, [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});