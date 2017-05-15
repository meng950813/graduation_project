var express = require('express');
var router = express.Router();
var g_vars = require("../helper/variable");

var publicDAO = require("../DAO/publicDAO");

var stuDAO = require("../DAO/stuDAO");

var publicFun = require("./publicFun");

/* 中期检查阶段 ： */
router.get("/", (req, res)=>{

	publicFun.hasPower(req,res,g_vars.ID_STUDENT);

	var data = {
			title 			: "middle",
			nav_active 	: g_vars.PROCESS_MIDDLE,

			breadcrumbs : "流程管理 >> 中期检查",
			prompt_text	: [
				"1、 外文翻译完成之后，才可以上传中期检查。",
				"2、 中期检查确定上传后需等待指导教师的审核，只有审核通过后，才算完成中期检查。"
			],

			detail_path : "/middle/detail"
		};
	publicFun.renderProcess(req,res,data);

});

/* 中期检查详情 */
router.get("/detail",function(req, res){

	publicFun.toLogin(req,res);

	var user = req.session.user;
	var pro_id = req.query.id?req.query.id:user.pro_id; 

	var data = {
			title 			: "this is middle detail",
			username 		: user.stu_name,
			identity 		: user.identity,
			nav_active 	: g_vars.PROCESS_MIDDLE,
			breadcrumbs : "流程管理 >> 中期检查",
			
			readonly		: "",

			pro_info		: {},

			tutor_num : user.tutor_num,
			tutor_name: user.tutor_name
		};

	publicDAO.getDetail(pro_id,g_vars.PROCESS_MIDDLE,function(result){

		// 未查到信息 ==> 未上传
		if(result.length == 0){
			data.pro_info = {
				id 				: 0,
				plan			: "",
				finished	: "",
				problem		: "",
				comments	: "",
				file_path : null
			};
		}
		else{
			data.pro_info = result[0];
			// 如果审核通过，所有文本框置为readonly
			if(data.pro_info.status == 1 || user.identity != g_vars.ID_STUDENT){
				data.readonly = " readonly='readonly' ";
			}
			data.pro_info.file_name = publicFun.getFileName(data.pro_info.file_path);
			(!result[0].comments) && (data.pro_info.comments = "");

		}
		res.render("stu_5_middle_detail",data);
	})
});

/* 上传/修改 中期检查内容 */
router.post("/upload",function(req,res){

	publicFun.hasPower(req,res,g_vars.ID_STUDENT);

	var info = req.body,
			user = req.session.user;

	info.pro_id 	= user.pro_id;
	info.tutor_id = user.tutor_id;

	stuDAO.uploadMiddle(info,(result)=>{
		// console.dir(result);
		if(result.affectedRows != 0){
			res.json({ok:true});
		}else{
			res.json({ok:false});
		}
	});
});

module.exports = router;