var express = require('express');
var router = express.Router();
var g_vars = require("../helper/variable");

var publicDAO = require("../DAO/publicDAO");

var stuDAO = require("../DAO/stuDAO");

var publicFun = require("./publicFun");

/* 任务书阶段 ： */
router.get("/", (req, res)=>{
	publicFun.hasPower(req,res,g_vars.ID_STUDENT);

	var data = {
			title 			: "this is task",
			nav_active 	: g_vars.PROCESS_TASK,

			breadcrumbs : "流程管理 >> 任务书",
			prompt_text	: [
				"1、 任务书由指导教师在学生开题前填写。任务书是纲领性材料，学生需根据指导教师的任务书来完成自己的毕业设计（论文）。"
			],

			detail_path	: "/task/detail"
		};
	publicFun.renderProcess(req,res,data);
});

/* 任务书详情 */
router.get("/detail",function(req, res){
	publicFun.toLogin(req,res);

	var user = req.session.user;
	var pro_id = req.query.id?req.query.id:user.pro_id; 

	var data = {
			title 			: "this is task detail",
			username 		: user.stu_name,
			identity 		: user.identity,
			nav_active 	: g_vars.PROCESS_TASK,
			breadcrumbs : "流程管理 >> 任务书",
			
			readonly		: "",

			pro_info		: {},

			tutor_num : user.tutor_num,
			tutor_name: user.tutor_name
		};

	publicDAO.getDetail(pro_id,g_vars.PROCESS_TASK,function(result){

		// 未查到信息 ==> 未上传
		if(result.length == 0){
			data.pro_info = {
				id 						: 0,
				task_aims 		: "",
				task_works 		: "",
				task_process	: "",
				task_reference: "",
				status 				: 0,
				file_path 		: null,
				comments			: ""
			};
		}
		else{
			data.pro_info = result[0];
			// 如果审核通过 或 用户不是学生，所有文本框置为readonly
			if(data.pro_info.status == 1 || user.identity != g_vars.ID_STUDENT){
				data.readonly = " readonly='readonly' ";
			}
			// data.pro_info.id = data.pro_info.task_id; 
			data.pro_info.file_name = publicFun.getFileName(data.pro_info.file_path);
			(result[0].comments == null) && (data.pro_info.comments = "");
		}
		res.render("stu_2_task_detail",data);
	})
});

/* 上传/修改 任务书内容 */
router.post("/upload",function(req,res){

	publicFun.hasPower(req,res,g_vars.ID_STUDENT);

	var info = req.body,
			user = req.session.user;

	info.task_id  = info.id;
	info.pro_id 	= user.pro_id;
	info.tutor_id = user.tutor_id;

	stuDAO.uploadTask(info,(result)=>{
		if(result.affectedRows != 0){
			res.json({ok:true});
		}else{
			res.json({ok:false});
		}
	});
});

module.exports = router;