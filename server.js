const express = require('express');
const fetch = require('node-fetch');

const app = express();
const port = 3000; // 사용할 포트 번호

app.use(express.static('public')); // public 폴더의 정적 파일을 제공

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

app.post('/save-diary', async (req, res) => {
  try {
    const { diaryText } = req.body;

    if (!diaryText) {
      return res.status(400).json({ success: false, message: "일기 내용이 비어있습니다." });
    }

    const filePath = 'text/diary.txt';

    await fs.appendFile(filePath, diaryText + '\n');

    res.json({ success: true });
  } catch (error) {
    console.error("오류가 발생했습니다: ", error);
    res.status(500).json({ success: false });
  }
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
    res.json(result.document.sentiment);
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});