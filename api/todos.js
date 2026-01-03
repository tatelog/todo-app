const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join('/tmp', 'todos.json');

const readTodos = () => {
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '{"todos":[]}');
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')).todos;
};
const writeTodos = (todos) => fs.writeFileSync(DATA_FILE, JSON.stringify({ todos }, null, 2));

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id, action } = req.query;

  if (req.method === 'GET' && !id) {
    return res.json(readTodos());
  }
  if (req.method === 'POST' && !id) {
    const todos = readTodos();
    const todo = { id: Date.now().toString(), title: req.body.title, completed: false, createdAt: new Date().toISOString() };
    todos.push(todo);
    writeTodos(todos);
    return res.json(todo);
  }
  if (req.method === 'PATCH' && id && action === 'toggle') {
    const todos = readTodos();
    const todo = todos.find(t => t.id === id);
    if (todo) { todo.completed = !todo.completed; writeTodos(todos); }
    return res.json(todo);
  }
  if (req.method === 'DELETE' && id) {
    const todos = readTodos().filter(t => t.id !== id);
    writeTodos(todos);
    return res.json({ success: true });
  }
  res.status(404).json({ error: 'Not found' });
};
