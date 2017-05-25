var express = require('express');
var router = express.Router();
var g_vars = require("../helper/variable");

var publicDAO = require("../DAO/publicDAO");

var stuDAO = require("../DAO/stuDAO");

var publicFun = require("./publicFun");

/* 判断当前阶段 */
// router.get("/",(req,res,next)=>{
// 	publicFun.hasPower(req,res,g_vars.ID_STUDENT);

// 	var user = req.session.user;

// 	// 定向到学生当前进度的页面
// 	res.location( getNowProcess(user.pro_process) );
// });

/* 选题阶段 ： */
router.get("/", (req,res,next)=>{
	publicFun.hasPower(req,res,g_vars.ID_STUDENT);

	var user = req.session.user;

	var data = {
			title 			: "this is choose",
			username 		: user.username,
			identity 		: user.identity,
			nav_active 	: g_vars.PROCESS_SELECT,
			breadcrumbs : " 流程管理 >> 选择课题",
			pro_info 		: []
		};
	// session 中 pro_id 为null : 当前处于选课阶段
	if(user.project_id == null){
		// console.log("show all project： ");
		// 显示所有可选课题
		stuDAO.showAllPro(user.stu_id,user.major_id,(result)=>{
			// console.dir(result);
			publicFun.formatProjectType(result);
			data.pro_info = result;
			res.render("stu_1_choose",data);
		});
	}
	// 已选择课题，显示该课题内容
	else{
		stuDAO.showChoosePro(user.pro_id,(result)=>{
			publicFun.formatProjectType(result);
			data.pro_info = result;
			res.render("stu_1_choose",data);
		});
	}
});

/* 选题,根据session中的stu_id 及传来的pro_id,*/
router.post("/choosePro",(req,res,next)=>{
	console.log("this choose project");

	publicFun.hasPower(req,res,g_vars.ID_STUDENT);
	console.log("this choose project");
	
	var pro_info 	= req.body,
			user_info = req.session.user;

	stuDAO.choosePro(user_info,pro_info,function(result){
		console.log("now in stuDAO "+ result);
		/* 插入失败 */
		if(result == undefined){
			res.json({ok:false});
		}else{
			res.json({ok:true});
		}
	});
});
module.exports = router;