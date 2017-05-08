const MYSQL = require("mysql");
const MYSQL_CONFIG = require("./mysql_config");

var pool = MYSQL.createPool({
	host : MYSQL_CONFIG.HOST,
	user : MYSQL_CONFIG.USER,
	password : MYSQL_CONFIG.PWD,
	database : MYSQL_CONFIG.DATABASE,
	port : MYSQL_CONFIG.PORT
});

var query = function(sql, params, callback){
	// 获取连接
	pool.getConnection(function(err, conn){

		if(err){
			callback(err,null,null);
			return;
		}
		
		conn.query(sql,params,function(qErr,values,fields){
			// 事件驱动回调
			callback(qErr,values,fields);
		});
	
		// 释放连接
		conn.release();
	});
};

module.exports = query;