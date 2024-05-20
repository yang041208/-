const express = require('express');
const app = express();
const marked = require('marked');
app.use(express.json()); 
app.use(express.urlencoded({ extended: false }))

const mongoose = require('mongoose');
mongoose.connect('mongodb://my-mongo/yzn');

const yznSchema = new mongoose.Schema({  
  title: String,  
  description: String,  
  markdown: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type : Date , default: Date.now },
  html: type: String
}); 
yznSchema.pre('validate', function(next) {
  if (this.markdown) {
    this.html = marked (this.markdown)
  }
  next()
})
  
// 定义 User 的 schema  
const UserSchema = new mongoose.Schema({    
  username: String,    
  password: String  
});  
  
// 创建 User 模型  
const User = mongoose.model('User', UserSchema);  
  
const yzn = mongoose.model('yzn', yznSchema);  
  
app.use(express.static('public'));

app.set('view engine', 'ejs');

//登陆界面
app.get('/', async (req, res) => {
  res.render('checkin')
})

app.get('/Blog/:userid', async (req, res) => {
    const userid=req.params.userid;
    const all = await yzn.find({ author: userid }); 
    res.render('all',{yzns:all , userid:userid})
})

//登陆后的后端处理
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
//readmore的后端处理
app.get('/readmore/:userid/:id', async (req, res) => {
        const userid = req.params.userid;  
        const article = await yzn.findOne({ _id: req.params.id });
    res.render('readmore', { article: article, userid: userid });  
})
//博客的增加
app.get('/new/:userid', (req, res) => {
  res.render('new',{user_id:req.params.userid});
})

app.post('/new', async (req,res) => {
    const one = new yzn({ title: req.body.title, description: req.body.description,author: req.body.user_id,markdown:req.body.markdown });
    await one.save();
    res.render('display', {yzn : one})
})

const methodOverride = require('method-override')
app.use(methodOverride('_method'))

//博客的删除
app.delete('/:userid/:id', async (req, res) => {
  userid=req.params.userid
  await yzn.deleteMany({ _id: req.params.id });
  const redirectUrl = `/Blog/${userid}`;
  res.redirect(redirectUrl);
})

//博客的修改

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

app.listen(12339);