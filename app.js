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