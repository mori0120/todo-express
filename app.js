'use strict'
const express = require('express')
let todos = [
    { id: 1, title: 'ネーム', completed: false },
    { id : 2, title: '下書き', completed: true }
]
const app  = express()

app.use(express.json())

// ToDo listの取得
app.get('/api/todos', (req, res) => {
    if(!req.query.completed){
        return res.json(todos)
    }
    const completed = req.query.completed === 'true'
    res.json(todos.filter(todo => todo.completed === completed))
})

// ToDo ID値を管理する変数
let id = 2

// ToDo 新規登録
app.post('/api/todos', (req, res, next)=>{
    const { title } = req.body
    if(typeof title !== 'string' || !title){
        const err = new Error('title is required')
        err.statusCode = 400
        return next(err)
    }
    // ToDo作成
    const todo = { id: id+=1, title, completed: false}
    todos.push(todo)
    // ステータスコード201を返す
    res.status(201).json(todo)
})

// 5-1 指定されたIDのToDoを取得するためのミドルウェア
app.use('/api/todos/:id(\\d+)', (req, res, next) => {
    const targetId = Number(req.params.id);
    const todo = todos.find(todo => todo.id === targetId);
    if(!todo){
        const err = new Error('ToDo not found');
        err.statusCode = 404;
        return next(err);
    }
    req.todo = todo;
    next();
})

// 5-2 ToDoのCompletedの設定・解除
app.route('/api/todos/:id(\\d+)/completed')
    .put((req,res) => {
        req.todo.completed = true;
        res.json(req.todo);
    })
    .delete((req,res)=>{
        req.todo.completed = false;
        res.json(req.todo);
    })

// 5-3 ToDoの削除
app.delete('/api/todos/:id(\\d+)', (req, res) => {
    todos = todos.filter(todo => todo !== req.todo);
    res.status(204).end();
})

// エラーハンドリングミドルウェア
app.use((err, req, res, next)=>{
    console.error(err)
    res.status(err.statusCode || 500).json({ error: err.message })
})


app.listen(3000)

// Next.jsによるルーティングのため以下を追記
const next = require('next');
const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });

nextApp.prepare().then(
    () => app.get('*', nextApp.getRequestHandler()),
    err => {
        console.error(err);
        process.exit(1);
    }
)