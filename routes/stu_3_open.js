var express = require('express');
var router = express.Router();
var g_vars = require("../helper/variable");

var publicDAO = require("../DAO/publicDAO");

var stuDAO = require("../DAO/stuDAO");

var publicFun = require("./publicFun");

/* 开题报告阶段 ： */
router.get("/", (req, res)=>{

	publicFun.hasPower(req,res,g_vars.ID_STUDENT);

	var data = {
			title 			: "open",
			nav_active 	: g_vars.PROCESS_OPEN,

			breadcrumbs : "流程管理 >> 开题报告",
			prompt_text	: [
				"1、 学生能够查看指导教师课题任务书之后，才可以在线填写开题报告。",
				"2、 开题报告确定提交后需等待指导教师的审核，只有审核通过后，才算完成开题。"
			],

			detail_path : "/open/detail"
		};

	publicFun.renderProcess(req,res,data);
});

/* 开题报告详情 */
router.get("/detail",function(req, res){

	publicFun.toLogin(req,res);

	var user = req.session.user;
	var pro_id = req.query.id?req.query.id:user.pro_id; 

	var data = {
			title 			: "this is task detail",
			username 		: user.username,
			identity 		: user.identity,
			nav_active 	: g_vars.PROCESS_OPEN,
			breadcrumbs : "流程管理 >> 开题报告",

			readonly		: "",

			pro_info		: {},

			tutor_num : user.tutor_num,
			tutor_name: user.tutor_name
		};

	publicDAO.getDetail(pro_id,g_vars.PROCESS_OPEN,function(result){

		// 未查到信息 ==> 未上传
		if(result.length == 0){
			data.pro_info = {
				id 					: 0,
				meaning 		: "",
				problem 		: "",
				research_content 		: "",
				methods 		: "",
				file_path		: null,
				comments		: "",
			};
		}
		else{
			data.pro_info = result[0];
			// 如果审核通过，所有文本框置为readonly
			if(data.pro_info.status == 1 || user.identity != g_vars.ID_STUDENT){
				data.readonly = " readonly='readonly' ";
			}
			data.pro_info.file_name = publicFun.getFileName(data.pro_info.file_path);
			(result[0].comments == null) && (data.pro_info.comments = "");

		}
		res.render("stu_3_open_detail",data);
	})
});

/* 上传/修改 开题报告内容 */
router.post("/upload",function(req,res){

	publicFun.hasPower(req,res,g_vars.ID_STUDENT);

	var info = req.body,
			user = req.session.user;

	info.pro_id 	= user.pro_id;
	info.tutor_id = user.tutor_id;

	stuDAO.uploadOpenTopic(info,(result)=>{
		if(result.affectedRows != 0){
			res.json({ok:true});
		}else{
			res.json({ok:false});
		}
	});
});

module.exports = router;