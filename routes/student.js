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
/*router.get("/choose",(req,res,next)=>{
	publicFun.hasPower(req,res,g_vars.ID_STUDENT);

	var user = req.session.user;
	var data = {};

	// session 中 pro_id 为null : 当前处于选课阶段
	if(user.pro_id === null){
		// // 标志
		// data.pro_id == null;

		// 显示所有可选课题
		stuDAO.showAllPro(user.major_id,(result)=>{
			formatResult(result);
			data.result = result;
		});
	}
	// 已选择课题，显示该课题内容
	else{
		stuDAO.showChoosePro(user.pro_id,(result)=>{
			formatResult(result);
			data.result = result;
		});
	}
	data.public = {
		username 	: user.stu_name,
		identity 	: user.identity,
		nav_active : 1
	};
	res.render("stu_choose",data)
})*/

// function getNowProcess(pro_process){
// 	switch(pro_process){
// 		case g_vars.PROCESS_SELECT:
// 			return "/choose";
// 		case g_vars.PROCESS_TASK:
// 			return "/task";
// 		case g_vars.PROCESS_OPEN:
// 			return "/open";
// 		case g_vars.PROCESS_TRANSLATE:
// 			return "/translate";
// 		case g_vars.PROCESS_MIDDLE:
// 			return "/middle";
// 		case g_vars.PROCESS_DRAFT:
// 			return "/draft";
// 		case g_vars.PROCESS_PAPER:
// 			return "/paper";
// 		case g_vars.PROCESS_REPLY:
// 			return "/reply";
// 	}
// }

/**
 * 将获取的课题类型及性质转换为可读文字
 *
 * @param {[type]} result [查询结果]
 */
// function formatResult(result){
// 	// for(var i in result){
// 	// 	result[i].pro_type = result[i].pro_type +"、" +g_vars.PRO_TYPE[result[i].pro_type];
// 	// 	result[i].pro_nature = result[i].pro_nature +"、" +g_vars.PRO_NATURE[result[i].pro_nature];
// 	// }
// }