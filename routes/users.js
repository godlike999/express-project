var express = require('express');
var router = express.Router();
var path = require('path');

var MongoClient = require('mongodb').MongoClient; // 引入mongodbClient客户端连接模块
var DB_CONN_STR = 'mongodb://10.31.155.64:27017/happy'; // 设置连接字符串


/* GET users listing. */
router.get('/', function(req, res, next) {
  // res.send('respond with a resource'); // render和send的区别是什么
});
//登录表单提交后执行的逻辑（执行完之后url重定向）
router.post('/login', function(req, res, next) {

  MongoClient.connect(DB_CONN_STR, function(err, db) { // 利用客户端连接模块进行connect连接操作
    if (err) {
      console.log(err);
      return;
    } else { // 如果连接成功，则执行下面代码 

      var conn = db.collection('user');
      //表单中传来的数据（表单中的name）
      var email = req.body.email;
      var password = req.body.password;

      var data = {
        email: email,
        password: password
      };
      conn.find(data).toArray(function(err, results) {
        if (err) {
          console.log(err)
          return;
        } else {

          if (results.length > 0) {
            //console.log('login success');
            req.session.email = results[0].email; //若登录信息匹配则存入session
            res.redirect('/');
          } else { //账号或密码错误
            res.send('<script>alert("账号或密码错误 请重新登录");location.href="/login"</script>')
          }
          //关闭数据库连接
          db.close();
        }
      });


    }
  })


})

router.post('/register', function(req, res, next) {
  MongoClient.connect(DB_CONN_STR, function(err, db) { // 利用客户端连接模块进行connect连接操作
    if (err) {
      console.log(err);
      return;
    } else { // 如果连接成功，则执行下面代码 

      var conn = db.collection('user');

      var email = req.body.email;
      var password = req.body.password;

      conn.save({
        email: email,
        password: password
      }, function(err, results) {
        res.redirect('/login');
      })


    }
  })

})

module.exports = router;