var express = require("express");
var router 	= express.Router();

var tutorDAO 	= require("../DAO/tutorDAO");
var publicDAO = require("../DAO/publicDAO");

var publicFun = require("./publicFun");

var g_vars 		=	require("../helper/variable");


/* 导师默认页面：发布的所有课题的状态 */
router.get("/",(req,res)=>{
	publicFun.hasPower(req,res,g_vars.ID_TUTOR);

	var user = req.session.user,
			data = {
				title 		: "tutor index",
				username 	: user.username,
				identity 	: user.identity, 
				nav_active 	: 2,

				breadcrumbs : "流程管理 >> 查看课题进度",

				prompt_text	: [
					"1、 显示所有发布课题的进度。",
					"2、 点击 “历史进度” 查看已经完成的进程 。"
				]
			};

	tutorDAO.getList(user.id,(result)=>{
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

/* 渲染发布课题的页面 */
router.get("/publish",(req,res)=>{
	publicFun.toLogin(req,res);
	var user = req.session.user;

	var pro_id = req.query.id;

	var data = {
		title 		: "publish project",
		username 	: user.username,
		identity 	: user.identity,

		nav_active: 1,

		breadcrumbs:"流程管理 >> 发布课题",

		prompt_text : [
			"1、 导师发布课题所针对的专业限定在导师所在学院中;",
			"2、 在课题的任务书阶段结束之前,导师可以修改课题信息;"
		],

		pro_info 	: null,

		pro_type  : g_vars.PRO_TYPE,

		pro_nature: g_vars.PRO_NATURE,

		major_info: null
	};

	publicDAO.getMajor(user.id,(major_info)=>{
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

/* 发布课题数据 */
router.post("/publish_project",(req,res)=>{

	publicFun.hasPower(req,res,g_vars.ID_TUTOR);

	var data = req.body,
			fun;
	data.tutor_id = req.session.user.id;

	// 修改数据
	if(data.pro_id != undefined){
		fun = tutorDAO.updateProject;
	}
	// 插入新数据
	else{
		fun = tutorDAO.publishPro;
	}
	tutorDAO.checkProjectName(data.pro_name,(exist)=>{
		if(exist.length == 0 || exist[0].pro_id == data.pro_id){
			fun(data,(result)=>{
				if(result.affectedRows > 0){
					res.json({ok:true});
				}else{
					res.json({ok:false});
				}
			});
		}
		else{
			res.json({ok:false,nameErr:true});
		}
	})
});

/* 导师提交任务评价 */
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

router.get("/assess",(req,res)=>{
	var user = req.session.user;
	publicFun.hasPower(req,res,g_vars.ID_TUTOR);
	var data = {
				title 		: "考核卡片",
				username 	: user.username,
				identity 	: user.identity, 
				nav_active 	: 9,

				breadcrumbs : "流程管理 >> 考核卡片"
			};
	tutorDAO.getAssessList(user.id,(result)=>{
		if(result.length == 0){
			result = [];
		}
		publicFun.formatProjectType(result);
		data.pro_info = result;
		res.render("score_assess_list",data);
	})
});

/* 考核卡片填写页面 */
router.get("/assess_detail",(req,res)=>{
	publicFun.toLogin(req,res);

	var pro_id = req.query.id,
			user = req.session.user;

	if(user.identity == g_vars.ID_STUDENT){
		pro_id = user.pro_id;
	}
	if(pro_id == undefined){
		res.render("index",data);
	}
	var data = {
				title 		: "考核卡片",
				username 	: user.username,
				identity 	: user.identity, 
				nav_active 	: 9,

				breadcrumbs : "流程管理 >> 考核卡片"
			};

	tutorDAO.getAssess(pro_id,(result)=>{
		if(result.length == 0){
			return;
		}
		result = result[0];
		
		result.score_info = publicFun.getScoreLevel(result); 
		result.file_name = publicFun.getFileName(result.annex_path);
		
		data.pro_info = result;
		res.render("score_assess",data);
	});
});

router.post("/upload_assess",(req,res)=>{
	var info = req.body;
	info.pro_id = info.id;
	if(req.session.user.identity != g_vars.ID_TUTOR){
		res.json({ok:false});
	}
	tutorDAO.updateAssess(info,(result)=>{
		if(result.affectedRows == 0){
			res.json({ok:false});
		}
		res.json({ok:true});
	});
});

module.exports = router;