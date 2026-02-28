const express = require('express');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors());

const categoriesRouter = require('./routes/categories');
const notesRouter = require('./routes/notes');
const tagsRouter = require('./routes/tags');  // 新增

app.use('/api/categories', categoriesRouter);
app.use('/api/notes', notesRouter);
app.use('/api/tags', tagsRouter);  // 新增

app.get('/', (req, res) => {
  res.send('Hello from My-Yui backend!');
});

module.exports = app;