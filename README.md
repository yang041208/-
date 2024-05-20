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
进入网站后，显示登陆界面，通过表单提交用户输入的用户名与密码，向后端发送一个post请求。在后端将提交的数据与数据库中的用户信息进行比较，登陆成功后，渲染该用户的个人博客界面。
## 实验结果
成功在云计算环境下开发了博客系统，并实现了用户注册、登录、文章发布等基本功能。

## 实验总结与心得=
本次实验成功地在云计算环境下开发了一个博客系统，让我熟悉了html,css和JavaScript等语法的运用。此外，这次实验也让我认识到了持续学习和自我提升的重要性。
在实验过程中，我遇到了许多我难以解决的难题，再经过不断的学习后才得以解决。最后，我要感谢老师和同学们的指导和帮助。在实验过程中，他们给予了我很多宝贵
的建议和支持，让我能够顺利完成实验任务。这次实验不仅让我获得了实践经验，也让我感受到了团队合作的力量和学习的乐趣。



