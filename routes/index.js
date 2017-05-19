var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var DB_CONN_STR = 'mongodb://10.31.155.64:27017/happy';
var async = require('async');
// 图片上传需要的模块
var multiparty = require('multiparty');
var fs = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) { // 这个路由请求模式是get // controller
  // {} 是model
  var pageNo = req.query.pageNo, //页码先从url中获取
    pageNo = pageNo ? pageNo : 1, //url中无页码信息则页数为1
    pageSize = 6,
    count = 0,
    totalPages = 0;
  var start = (pageNo - 1) * 5;
  var end = start + pageSize;


  var findData = function(db, callback) {
    var conn = db.collection('movie');
    var arr = [];
    // 其实要做2件事，一件是查询列表数据，一件统计总记录

    async.parallel([
      function(callback) {
        conn.find({}).toArray(function(err, results) {
          if (err) {
            return;
          } else {

            totalPages = Math.ceil(results[0].subjects.length / pageSize);


            count = results[0].subjects.length;
            callback(null, results);
          }
        })
      }
    ], function(err, results) {

      arr = results[0][0].subjects.slice(start, end);
      console.log(arr);
      callback(arr);
      // console.log(results[0][0].subjects);
    })


  }


  MongoClient.connect(DB_CONN_STR, function(err, db) {
    if (err) {
      return;
    } else {
      findData(db, function(results) {


        //console.log(pageNo,totalPages,count)
        res.render('index', {
          pageNo: pageNo,
          totalPages: totalPages,
          list: results,
          count: count,
          email: req.session.email
        })
        db.close();
      })
    }
  })



  /*res.render('index', {
    email: req.session.email
  });*/ // render渲染 index是模板文件名称 {title:'Express'}是对象，是数据
  // 将数据渲染到index.ejs这个模板里
});

router.get('/login', function(req, res, next) {
  res.render('login', {});
})

router.get('/register', function(req, res, next) {
  res.render('register', {});
})
router.get('/movie_detail', function(req, res, next) {
  var id = req.query.id;
  var pageNo = req.query.pageNo, //页码先从url中获取
      pageNo = pageNo ? pageNo : 1, //url中无页码信息则页数为1
      pageSize = 10,
      count = 0,
      totalPages = 0;
      console.log(pageNo,555)
  MongoClient.connect(DB_CONN_STR, function(err, db) { // 利用客户端连接模块进行connect连接操作
    if (err) {
      console.log(err);
      return;
    } else { // 如果连接成功，则执行下面代码 

      var conn_detail = db.collection('movie_detail');
      var conn_comment = db.collection('comment');
      var data = {
        id: id
      };

      async.parallel([
        function(callback) {
              conn_detail.find(data).toArray(function(err, results) {
                if (err) {
                  console.log(err)
                  return;
                } else {
                  /*console.log(results[0]);
                  res.render('movie_detail', {
                    email: req.session.email,
                    obj: results[0]
                  });

                  //关闭数据库连接
                  db.close();*/
                   callback(null,results);
                }
              });
        },
        function(callback) {
            conn_comment.find(data).toArray(function(err, results) {
                if (err) {
                    return;
                } else {

                    totalPages = Math.ceil(results.length / pageSize);
                    totalPages=totalPages<1?1:totalPages;

                    count = results.length;
                    callback(null, '');
                }
            })
        },
        function(callback) { //根据页码从数据库获取数据（在页面循环展示）
            conn_comment.find(data).sort({
                _id: -1
            }).skip((pageNo - 1) * pageSize).limit(pageSize).toArray(function(err, results) {
                if (err) {
                    return;
                } else {
                    callback(null, results);
                    //console.log(results, 111111111111111111);
                }
            })
        }],
        function(err, results) {
            //console.log(pageNo,totalPages,count,results[2],00000)
            res.render('movie_detail', {
              email: req.session.email,
              obj: results[0][0],
              id:id,
              pageNo: pageNo,
              totalPages: totalPages,
              list: results[2],
              count: count
            })
            db.close();
        })

      


    }
  })

})

router.post('/search', function(req, res, next) {
var search=req.body.search;
 
MongoClient.connect(DB_CONN_STR, function(err, db) { // 利用客户端连接模块进行connect连接操作
    if (err) {
      console.log(err);
      return;
    } 
    else {
     var conn = db.collection('movie');
        conn.find().toArray(function(err, results) {
          if (err) {
            console.log(err)
            return;
          } else {
            
            for(var i=0;i<results[0].subjects.length;i++){
              if(search==results[0].subjects[i].title){
                
              res.redirect('/movie_detail?id='+results[0].subjects[i].id);
              }
            }
            
            db.close();
          }
        });

    }
  })
})


router.post('/uploadImg', function(req, res, next) {
  var form = new multiparty.Form();
  // 设置编码
  form.encoding = 'utf-8';
  //设置文件存储路径
  form.uploadDir = './uploadtemp';
  // 设置文件的大小
  form.maxFilesSize = 2 * 1024 * 1024; // 2M

  form.parse(req, function(err, fileds, files) {
    var uploadurl = './images/upload/'; //最终文件传到这个目录下
    file = files['filedata'];
    originalFilename = file[0].originalFilename;
    tmpPath = file[0].path;

    var timestamp = new Date().getTime(); // 建立时间戳
    uploadurl += timestamp + originalFilename; //重新设置文件的文件名及路径
    newPath = './public/' + uploadurl; // 重终重组文件存储路径

    var fileReadStream = fs.createReadStream(tmpPath);
    var fileWriteStream = fs.createWriteStream(newPath);
    fileReadStream.pipe(fileWriteStream); //通过管道符进行操作的连接
    fileWriteStream.on('close', function() {
      fs.unlinkSync(tmpPath); // 删除临时目录下的文件
      res.send('{"err":"","msg":" ' + uploadurl + ' "}')
    })

  })

})


//注销登录后重定向
router.get('/logout', function(req, res, next) {
  // 方法一
  // req.session.email = undefined;
  // res.redirect('/');

  // 方法二
  req.session.destroy(function(err) {
    res.redirect('/');
  })
})



module.exports = router;