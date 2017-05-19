var express = require('express');
var router = express.Router();
var MongoClient= require('mongodb').MongoClient;
var DB_CONN_STR = 'mongodb://10.31.155.64:27017/happy';
var async = require('async');
router.get('/',function(req,res,next){

    var pageNo = req.query.pageNo,
        pageNo = pageNo?pageNo:1,
        pageSize = 12,
        count = 0,
        totalPages = 0;
        var start=(pageNo-1)*12;
        var end=start+pageSize;


	  var findData=function(db,callback){
            	 var conn = db.collection('music');
            	async.parallel([
                function(callback){
                    conn.find({}).toArray(function(err,results){
                        if(err){
                            return;
                        }else{
                            
                            totalPages = Math.ceil(results[0].song_list.length/pageSize);
                            count = results[0].song_list.length;
                            callback(null,'');
                        }
                    })
                },
                function(callback){
                     conn.find({}).toArray(function(err,results){
                     	 if(err){
                     	 	return;
                     	 }else{
                     	 	callback(null,results)
                     	 }	 	
                     })
                       
                }
            ],function(err,results){
            	var arr=results[1][0].song_list.slice(start,end);
                 console.log(arr)
                callback(arr);
            })
            		 	
            }	

            MongoClient.connect(DB_CONN_STR,function(err,db){
            if(err){
                return;
            }else{
                findData(db,function(results){

                   console.log(results)
                    console.log(pageNo,totalPages,count)
                    res.render('music',{
                        pageNo:pageNo,
                        totalPages:totalPages,
                        list:results,
                        count:count
                    })
                    db.close();
                })
            }
        }) 


})

router.get('/content',function(req,res,next){
	var id=req.query.id
	
	
	       MongoClient.connect(DB_CONN_STR,function(err,db){
                var conn = db.collection('music');
                conn.find({}).toArray(function(err,results){
                	  console.log(results)

                		 var subject=results[0].song_list//数组
                		 console.log('subject',subject[0])
                		 for(var i=0;i<subject.length;i++){
                		 	
                		 	 if(subject[i].artist_id==id){
                		 	 	res.render('content',{container:subject[i]})
                		 	 }
                		 }

                })

	       })

		 	
})















module.exports = router;
