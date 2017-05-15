var express = require("express");
var router 	= express.Router();

var tutorDAO 	= require("../DAO/tutorDAO");
var publicDAO = require("../DAO/publicDAO");

var publicFun = require("./publicFun");

var g_vars 		=	require("../helper/variable");


/* 导师默认页面：发布的所有课题的状态 */
router.get("/",(req,res)=>{
	console.log("this is tutor ");
	publicFun.hasPower(req,res,g_vars.ID_TUTOR);

	var user = req.session.user,
			data = {
				title 		: "tutor index",
				username 	: user.tutor_name,
				identity 	: user.identity, 
				nav_active 	: 2,

				breadcrumbs : "流程管理 >> 查看课题进度",

				prompt_text	: [
					"1、 显示所有发布课题的进度。",
					"2、 点击 “历史进度” 查看已经完成的进程 。"
				]
			};

	tutorDAO.getList(user.tutor_id,(result)=>{
		if(result.length == 0){
			console.log("empty list project ");
			return;
		}
		
		publicFun.formatProjectType(result);
		
		for(var i in result){
			result[i].process_list = publicFun.getProcessList(result[i].pro_process);
		}		
		data.pro_info = result;

		res.render("tutor_pro_list",data);
	});
});

/* 发布课题 */
router.get("/publish",(req,res)=>{
	publicFun.toLogin(req,res);
	var user = req.session.user;

	var pro_id = req.query.id;

	var data = {
		title 		: "publish project",
		username 	: user.tutor_name,
		identity 	: user.identity,

		nav_active: 1,

		breadcrumbs:"流程管理 >> 发布课题",



		pro_info 	: null,

		pro_type  : g_vars.PRO_TYPE,

		pro_nature: g_vars.PRO_NATURE,

		major_info: null
	};

	publicDAO.getMajor(user.tutor_id,(major_info)=>{
		if(major_info.length <= 0){
			console.log("can not get major info");
			return;
		}
		data.major_info = major_info;
		
		// 传入 pro_id 表示修改课题，先获取该课题信息
		if(pro_id != undefined){
			tutorDAO.getProject(pro_id,(result)=>{
				data.pro_info = result[0];
				res.render("tutor_publish_project",data);
			});
		}else{
			res.render("tutor_publish_project",data);
		}

	})

});


/* 导师提交评价 */
router.post('/review',(req,res)=>{
	var data = req.body,
			fun;
	switch(parseInt(data.type,10)){
		case g_vars.PROCESS_TASK:
			fun = tutorDAO.dealTask;
			break;
		case g_vars.PROCESS_OPEN:
			fun = tutorDAO.dealOpen;
			break;
		case g_vars.PROCESS_TRANSLATE:
			fun = tutorDAO.dealTranslate;
			break;
		case g_vars.PROCESS_MIDDLE:
			fun = tutorDAO.dealMiddle;
			break;
		case g_vars.PROCESS_DRAFT:
			fun = tutorDAO.dealDraft;
			break;
		case g_vars.PROCESS_PAPER:
			fun = tutorDAO.dealPaper;
			break;
		default:
			console.log("参数错误" + data.type);
			res.json({ok:false});
			break;
	}
	data.pro_id = data.id;
	fun(data,(result)=>{
		// 成功
		if(result.affectedRows > 0){
			res.json({ok:true});
		}
		else{
			res.json({ok:false});
		}
	})
});

module.exports = router;