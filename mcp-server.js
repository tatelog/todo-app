#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const DATA_FILE = path.join(__dirname, 'data/todos.json');
const readTodos = () => JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')).todos;
const writeTodos = (todos) => fs.writeFileSync(DATA_FILE, JSON.stringify({ todos }, null, 2));

const tools = {
  list_todos: () => ({ todos: readTodos() }),
  add_todo: ({ title }) => {
    const todos = readTodos();
    const todo = { id: Date.now().toString(), title, completed: false, createdAt: new Date().toISOString() };
    todos.push(todo);
    writeTodos(todos);
    return todo;
  },
  complete_todo: ({ id }) => {
    const todos = readTodos();
    const todo = todos.find(t => t.id === id || t.id.endsWith(id));
    if (todo) { todo.completed = true; writeTodos(todos); return todo; }
    return { error: 'not found' };
  },
  delete_todo: ({ id }) => {
    const todos = readTodos();
    const idx = todos.findIndex(t => t.id === id || t.id.endsWith(id));
    if (idx >= 0) { const [removed] = todos.splice(idx, 1); writeTodos(todos); return removed; }
    return { error: 'not found' };
  }
};

const send = (msg) => { process.stdout.write(JSON.stringify(msg) + '\n'); };

const handle = (msg) => {
  const { id, method, params } = msg;
  if (method === 'initialize') {
    return send({ jsonrpc: '2.0', id, result: { protocolVersion: '2024-11-05', capabilities: { tools: {} }, serverInfo: { name: 'todo-mcp', version: '1.0.0' } } });
  }
  if (method === 'tools/list') {
    return send({ jsonrpc: '2.0', id, result: { tools: [
      { name: 'list_todos', description: 'List all todos', inputSchema: { type: 'object', properties: {} } },
      { name: 'add_todo', description: 'Add a new todo', inputSchema: { type: 'object', properties: { title: { type: 'string' } }, required: ['title'] } },
      { name: 'complete_todo', description: 'Mark todo as complete', inputSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] } },
      { name: 'delete_todo', description: 'Delete a todo', inputSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] } }
    ] } });
  }
  if (method === 'tools/call') {
    const fn = tools[params.name];
    const result = fn ? fn(params.arguments || {}) : { error: 'unknown tool' };
    return send({ jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] } });
  }
  if (method === 'notifications/initialized') return;
  send({ jsonrpc: '2.0', id, error: { code: -32601, message: 'Method not found' } });
};

const rl = readline.createInterface({ input: process.stdin });
rl.on('line', (line) => { try { handle(JSON.parse(line)); } catch {} });
