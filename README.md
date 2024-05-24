#新生项目课程：云计算环境下的博客系统开发
## 实验概述

1. 实验名称：云计算环境下的博客系统开发
  
2. 实验目的：在已提供的服务器环境下创建一个个人博客系统
  
3. 实验环境：


## 实验内容
1.利用html来完成界面的基础结构
2.用css来完成博客的样式设计
3.利用javascript来实现博客的各种交互
  
## 实验步骤
1.先用html写出基础的登陆与博客界面首页
2.建立用户与博客的数据库，储存所需的数据
3.用JavaScript来实现登陆和博客的增删查改等基础功能
4.进一步添加readkmore ，markdown和日期等功能
5.用css装饰各个页面。

 
##### 数据库结构
```mermaid
graph LR
  blog[blog]-->ar[articles]-..->title
  ar-..->description
  ar-..->markdown
  ar-..->author
  blog-->user[users]-..->username
  user-..->password
  ```
##### 代码说明
登陆功能
```js
app.get('/', async (req, res) => {
  res.render('checkin')
})

app.post('/checkin', async (req, res) => {  
  try {  
    const { username, password } = req.body;  

    // 在数据库中查找用户  
    const user = await User.findOne({ username });  
  
    // 如果没有找到用户，返回错误  
    if (!user) {
        alert("用户不存在")

      return res.status(401).json({ error: 'Invalid credentials' });  
        window.location.href="/"
    }  
  
    // 如果密码验证失败，也返回错误  
    if (!(password==user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });  
    }  
  
    // 如果用户和密码都正确，显示相应的博客界面   
    const all = await yzn.find({ author: user._id }).sort({ createdAt: 'desc' }); 
    res.render('all',{yzns:all , userid:user._id})
  } catch (error) {  
    console.error('Error:', error);  
    res.status(500).json({ error: 'Internal server error' });  
  }  
});
```
进入网站后，显示登陆界面，通过表单提交用户输入的用户名与密码，向后端发送一个post请求。在后端将提交的数据与数据库中的用户信息进行比较，登陆成功后，通过find函数筛选出author等于该用户id的博客，渲染该用户的个人博客界面。  

添加博客与用户注册
```js
app.get('/new/:userid', (req, res) => {
  res.render('new',{user_id:req.params.userid});
})

app.post('/new', async (req,res) => {
    const one = new yzn({ title: req.body.title, description: req.body.description,author: req.body.user_id,markdown:req.body.markdown });
    await one.save();
    res.render('display', {yzn : one})
})

//注册界面
app.get('/register', async (req, res) => {
  res.render('register')
})

//注册后的后端处理
app.post('/register', async (req, res) => {  
    const { username, password } = req.body;  
    // 检查用户名是否已存在
    const existingUser = await User.findOne({ username });  
    if (existingUser) {  
        return res.status(400).send('Username already exists');  
    }  
    const one = new User({ username: username, password: password });  
    try {  
        await one.save();  
        res.redirect('/'); // 注册成功，重定向到主页  
    } catch (error) {  
        console.error('Error saving user:', error);  
        res.status(500).send('Internal Server Error'); // 保存用户时出错，发送 500 错误  
    }  
});
```
点击博客系统首页的new按钮后，向server.js发送一个指向'/new/:userid'的get请求，然后通过表单提交新博客的数据，在后端接收到提交的数据后，将其存储在数据库中，再渲染display文件展示新增加的博客。在此过程中，须注意的是通过URL与渲染的方式传递了用户的id给博客的author，以实现在展示博客系统首页时找到与用户对应的博客内容。  注册功能与添加博客类似，只是新增的数据库模型不同。

  修改与删除功能
 ```js
  app.get('/edit/:id', async (req, res) => {
    const one = await yzn.findOne({ _id: req.params.id });
    res.render('edit', {yzn: one })
})

app.put('/:id', async (req, res) => {
    let data = {}
    data.title = req.body.title
    data.description = req.body.description
    data.markdown = req.body.markdown
    data.userid = req.body.user_id

    const one = await yzn.findOne({ _id: req.params.id });
    if (one != null) {
        one.title = data.title;
        one.description = data.description;
        one.markdown = data.markdown;
        await one.save();       
    }  
    res.redirect(`/readmore/${data.userid}/${req.params.id}`)
})

//删除博客
app.delete('/:userid/:id', async (req, res) => {
  userid=req.params.userid
  await yzn.deleteMany({ _id: req.params.id });
  const redirectUrl = `/Blog/${userid}`;
  res.redirect(redirectUrl);
})

```
在点击修改按钮后，向后端发送get请求，同时通过URL将要修改的博客id传递给后端，在接收到get请求后渲染修改页面，将修改后的博客内容通过表单提交给后端，同时同样通过URL将要修改的博客id传递给后端，在接收到post请求后，利用findone函数与传递的博客id找到要修改的博客，将其中的数据改为表单提交的数据，即实现了修改功能。删除功能与之类似，但省去了通过表单提交数据的部分吗，在找到要删除的博客后直接用deleteMany函数删除该博客。  

  readmore功能
  ```js
    app.get('/readmore/:userid/:id', async (req, res) => {
        const userid = req.params.userid;  
        const article = await yzn.findOne({ _id: req.params.id });
    res.render('readmore', { article: article, userid: userid });  
})

<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" type="text/css" href="/css/bootstrap.min.css" />
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Blog</title>
</head>

<body>
<div class="container">
  <h1 class="mb-1"><%= article.title %></h1>
  <div class="card-subtitle text-muted mb-2">
    <%= article.createdAt.toLocaleDateString() %>
  </div>
    <a href="/Blog/<%= userid %>" class="btn btn-secondary">All Articles</a>
    <a href="/edit/<%= article._id %>" class="btn btn-info">Edit</a>
    <div>
      <%- article.html%>
  </div>
  </div>
</body>
</html>
```
在首页点击readmore按钮后，向后端发送一个get请求，并通过URL传递用户与博客的id，渲染readmore界面，通过博客id找到要展示详情的博客，然后显示该博客中的相关数据。给这个页面添加了all article与edit按钮以返回博客系统首页或编辑该博客。  
  
  
## 实验结果
成功在云计算环境下开发了博客系统，并实现了用户注册、登录、文章发布等基本功能。

## 实验总结与心得=
本次实验成功地在云计算环境下开发了一个博客系统，让我熟悉了html,css和JavaScript等语法的运用。此外，这次实验也让我认识到了持续学习和自我提升的重要性。
在实验过程中，我遇到了许多我难以解决的难题，再经过不断的学习后才得以解决。最后，我要感谢老师和同学们的指导和帮助。在实验过程中，他们给予了我很多宝贵
的建议和支持，让我能够顺利完成实验任务。这次实验不仅让我获得了实践经验，也让我感受到了团队合作的力量和学习的乐趣。
| 工作量统计表 | 基础功能 | 新增功能1 | 新增功能2 | 新增功能3 | 新增功能4  | 新增功能5  |
| --- | --- | --- | --- | --- | --- | --- |
| 描述  | 对博客系统中博文的增删改查操作 | 博客系统CSS美化 | 增加markdown输入框 | 登录页面的制作 | 注册页面的制作 | 登录功能和注册功能的实现 |
| 学时  | 8   | 3   | 3   | 2   | 3   | 10   |


