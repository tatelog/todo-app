const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const DATA_FILE = path.join(__dirname, 'data/todos.json');

app.use(cors());
app.use(express.json());

const readTodos = () => JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')).todos;
const writeTodos = (todos) => fs.writeFileSync(DATA_FILE, JSON.stringify({ todos }, null, 2));

app.get('/api/todos', (req, res) => res.json(readTodos()));

app.post('/api/todos', (req, res) => {
  const todos = readTodos();
  const todo = { id: Date.now().toString(), title: req.body.title, completed: false, createdAt: new Date().toISOString() };
  todos.push(todo);
  writeTodos(todos);
  res.json(todo);
});

app.patch('/api/todos/:id/toggle', (req, res) => {
  const todos = readTodos();
  const todo = todos.find(t => t.id === req.params.id);
  if (todo) { todo.completed = !todo.completed; writeTodos(todos); }
  res.json(todo);
});

app.delete('/api/todos/:id', (req, res) => {
  const todos = readTodos().filter(t => t.id !== req.params.id);
  writeTodos(todos);
  res.json({ success: true });
});

app.listen(3001, () => console.log('API server running on http://localhost:3001'));
