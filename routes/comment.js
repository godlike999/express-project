var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var DB_CONN_STR = 'mongodb://10.31.155.64:27017/happy';
var async = require('async');

router.get('/', function(req, res, next) { // 这个路由请求模式是get // controller
    
});

// 评论form表单提交后执行的逻辑（执行完后重定向）
router.post('/submit', function(req, res, next) {
    var email = req.session.email; //session中有登录信息且没过期
    var id = req.query.id;
    var pageNo=req.query.pageNo;
    if (email) {
        var title = req.body.title;
        var content = req.body.content;


        var insertData = function(db, callback) {
            var conn = db.collection('comment');
            var data = {
                id:id,
                title: title,
                content: content
            };
            conn.insert(data, function(err, results) {
                if (err) return;
                callback(results);
            })
        }


        MongoClient.connect(DB_CONN_STR, function(err, db) {
            if (err) {
                return;
            } else {
                insertData(db, function(results) {
                    res.redirect('/movie_detail?id='+id+'&pageNo='+pageNo);
                    db.close();
                })
            }
        })

    } else { //session中无登录信息时 url转到登录页面
        res.send('<script>alert("session过期，重新登录");location.href="/login"</script>')
    }
})

//评论列表页（页面中每次点击上一页或下一页都会改变URL）
router.get('/list', function(req, res) {
    var email = req.session.email;

    //if(email){
    var pageNo = req.query.pageNo, //页码先从url中获取
        pageNo = pageNo ? pageNo : 1, //url中无页码信息则页数为1
        pageSize = 5,
        count = 0,
        totalPages = 0;



    var findData = function(db, callback) {
        var conn = db.collection('comment');

        // 其实要做2件事，一件是查询列表数据，一件统计总记录

        async.parallel([
            function(callback) {
                conn.find({}).toArray(function(err, results) {
                    if (err) {
                        return;
                    } else {

                        totalPages = Math.ceil(results.length / pageSize);


                        count = results.length;
                        callback(null, '');
                    }
                })
            },
            function(callback) { //根据页码从数据库获取数据（在页面循环展示）
                conn.find({}).sort({
                    _id: -1
                }).skip((pageNo - 1) * pageSize).limit(pageSize).toArray(function(err, results) {
                    if (err) {
                        return;
                    } else {
                        callback(null, results);
                        //console.log(results, 111111111111111111);
                    }
                })
            }
        ], function(err, results) {
            callback(results[1]);
            //console.log(results[1], 1111);
        })


    }


    MongoClient.connect(DB_CONN_STR, function(err, db) {
        if (err) {
            return;
        } else {
            findData(db, function(results) {


                //console.log(pageNo,totalPages,count)
                res.render('list', {
                    pageNo: pageNo,
                    totalPages: totalPages,
                    list: results,
                    count: count
                })
                db.close();
            })
        }
    })



    //}
})


module.exports = router;