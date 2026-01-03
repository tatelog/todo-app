#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data/todos.json');
const readTodos = () => JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')).todos;
const writeTodos = (todos) => fs.writeFileSync(DATA_FILE, JSON.stringify({ todos }, null, 2));

const [,, cmd, ...args] = process.argv;

const commands = {
  list: () => {
    const todos = readTodos();
    if (!todos.length) return console.log('タスクがありません');
    todos.forEach(t => console.log(`[${t.completed ? 'x' : ' '}] ${t.id.slice(-4)} - ${t.title}`));
  },
  add: () => {
    const title = args.join(' ');
    if (!title) return console.log('使用法: todo add <タイトル>');
    const todos = readTodos();
    const todo = { id: Date.now().toString(), title, completed: false, createdAt: new Date().toISOString() };
    todos.push(todo);
    writeTodos(todos);
    console.log(`追加: ${title}`);
  },
  done: () => {
    const id = args[0];
    if (!id) return console.log('使用法: todo done <ID>');
    const todos = readTodos();
    const todo = todos.find(t => t.id.endsWith(id));
    if (todo) { todo.completed = true; writeTodos(todos); console.log(`完了: ${todo.title}`); }
    else console.log('タスクが見つかりません');
  },
  delete: () => {
    const id = args[0];
    if (!id) return console.log('使用法: todo delete <ID>');
    const todos = readTodos();
    const idx = todos.findIndex(t => t.id.endsWith(id));
    if (idx >= 0) { const [removed] = todos.splice(idx, 1); writeTodos(todos); console.log(`削除: ${removed.title}`); }
    else console.log('タスクが見つかりません');
  },
  help: () => console.log('コマンド: list, add <タイトル>, done <ID>, delete <ID>')
};

(commands[cmd] || commands.help)();
