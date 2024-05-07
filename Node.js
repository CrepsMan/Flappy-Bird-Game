const express = require('express');
const fs = require('fs');

const app = express();

app.post('/saveScores', (req, res) => {
    const newScore = req.body.score;
    fs.appendFileSync('scores.txt', newScore + '\n');
    res.sendStatus(200);
});

app.get('/loadScores', (req, res) => {
    const scores = fs.readFileSync('scores.txt', 'utf8').split('\n');
    res.json(scores);
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});