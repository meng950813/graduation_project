var express = require("express");
var router 	= express.Router();

var tutorDAO 	= require("../DAO/tutorDAO");
var publicDAO = require("../DAO/publicDAO");

var publicFun = require("./publicFun");

var g_vars 		=	require("../helper/variable");


/* 管理员模块 */

/* 默认进入登录界面 */
router.get("/",(req,res)=>{
	res.redirect("/master/login");
});

router.get("/login",(req,res)=>{
	res.render("master_login");	
});

router.post("/dologin",(req,res,next)=>{
	var info = req.body;
	var pwd = publicFun.encrypt(info.pwd);
	publicDAO.login(info.usernum,g_vars.ID_MASTER,(result)=>{
		/* 返回结果为空 ==> 账号不正确，未查到数据 */
		if(result.length == 0){
			res.json({userError:true});
			return;
		}
		result = result[0];
		// 查找到信息  密码不正确
		if(result.password != pwd){
			res.json({pwdError:true});
			return;
		}
		/* 保存信息到 session */
		req.session.user = {
			username 	: result.tutor_name,
			num   : result.man_num,
			level : result.level,
			college: result.college,
			identity:g_vars.ID_MASTER
		};
		res.json({success:g_vars.SUCCESS,url:"/master/index"});
	});
});


router.get("/index",(req,res)=>{
	console.log(req.session.user);
	publicFun.toLogin(req,res);

	var user = req.session.user;
	var data = {
				title 		: "后台管理",
				username 	: user.username,
				identity 	: user.identity, 
				nav_active: 1,
				level 		: user.level,
				college 	: user.college,

				breadcrumbs : "后台管理 >> 首页"
			};
	res.render("master_index",data);
});

module.exports=router;