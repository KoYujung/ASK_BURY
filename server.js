const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

const storage = multer.diskStorage({
  destination: path.join(__dirname, 'public', 'text'), // 경로 수정
  filename: (req, file, cb) => {
      cb(null, 'diary.txt');
  }
});

const upload = multer({ storage: storage });

app.post('/upload', upload.single('inputDiary'), (req, res) => {
  if (!req.file) {
    res.status(400).send('File is missing.');
    return;
  }

  // 파일 업로드 완료 후 파일 처리를 여기서 수행
  processUploadedFile(req.file.path, (err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error processing file.');
      return;
    }

    res.send('File saved successfully.');
  });
});

function processUploadedFile(filePath, callback) {
  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) {
      callback(err);
      return;
    }

    console.log('Read file successfully:', data); // 추가된 로그

    if (!data) {
      callback(new Error('File content is empty.'));
      return;
    }

    const newFilePath = path.join(__dirname, 'public', 'text', 'diary.txt'); // 경로 수정

    fs.writeFile(newFilePath, data, (writeErr) => {
      if (writeErr) {
        callback(writeErr);
      } else {
        callback(null);
      }
    });
  });
}

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

app.get('/analyze', async (req, res) => {
  const text = req.query.text;

  if (!text) {
    res.status(400).json({ error: "Text is missing or empty." });
    return;
  }

  const client_id = "your_client_id"; // 수정: 실제 네이버 API 클라이언트 ID
  const client_secret = "your_client_secret"; // 수정: 실제 네이버 API 클라이언트 시크릿
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
    res.json(result.document.sentiment);
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});
