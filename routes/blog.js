const e = require('express');
const express = require('express');

const router = express.Router();

const db = require('../data/database');

router.get('/', (req, res) => {
    res.redirect('/posts');
})

router.get('/posts', async (req, res) => {
    const query = `SELECT posts.id as postId, title, summary, body, name 
    FROM posts JOIN authors ON authors.id = posts.author_id`;
    const [posts] = await db.query(query);

    res.render('posts-list', { posts });

})

router.get('/posts/:id', async (req, res) => {
    const query = `
    SELECT posts.id as postId, title, summary, body, name, date, email
    FROM posts JOIN authors ON authors.id = posts.author_id 
    WHERE posts.id = ?
`;
    const [post] = await db.query(query, [req.params.id]);
    const postData = {
        ...post[0],
        date: post[0].date.toGMTString(),
        readableDate: post[0].date.toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    // res.send(postData);
    if (post.length === 0) {
        return res.status(404).render('404');
    }

    res.render('post-detail', { post: postData })

})

router.get('/new-post', async (req, res) => {
    const [authors] = await db.query("SELECT * FROM authors");
    res.render('create-post', { authors });
})

router.post('/posts', async (req, res) => {
    const data = [
        req.body.title,
        req.body.summary,
        req.body.content,
        req.body.author
    ];
    await db.query("INSERT INTO posts (title, summary, body, author_id) VALUES(?)", [data]);
    res.redirect('/posts');
});

router.get('/edit-post/:id', async (req, res) => {
    const id = req.params.id;
    const query = `
    SELECT posts.id as postId, title, summary, body, name, date, author_id as authorId
    FROM posts JOIN authors ON authors.id = posts.author_id 
    WHERE posts.id = ${id}
    `;
    const [post] = await db.query(query);
    res.render('update-post', { post: post[0] })
});

router.post('/update-post/:id', async (req, res) => {
    const query = `UPDATE posts SET title = '${req.body.title}', summary = '${req.body.summary}', body = '${req.body.content}', date = now() WHERE id = ${req.body.postId}`;

    await db.query(query);
    res.redirect('/posts');
});

router.post('/delete-post/:id', async (req, res) => {
    const query = `DELETE FROM posts WHERE id= ?`;
    await db.query(query, [req.params.id]);
    res.redirect('/posts');
})

module.exports = router;