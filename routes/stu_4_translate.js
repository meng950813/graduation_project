var express = require('express');
var router = express.Router();
var g_vars = require("../helper/variable");

var publicDAO = require("../DAO/publicDAO");

var stuDAO = require("../DAO/stuDAO");

var publicFun = require("./publicFun");

/* 外文翻译阶段 ： */
router.get("/", (req, res)=>{

	publicFun.hasPower(req,res,g_vars.ID_STUDENT);

	var user = req.session.user;

	var data = {
			title 			: "translate",
			username 		: user.stu_name,
			identity 		: user.identity,
			nav_active 	: g_vars.PROCESS_TRANSLATE,

			breadcrumbs : "流程管理 >> 文献综述或外文翻译",
			prompt_text	: [
				"1、 学生能够查看指导教师课题任务书之后，才可以上传外文翻译。",
				"2、 外文翻译确定上传后需等待指导教师的审核，只有审核通过后，才算完成外文翻译。"
			],

			detail_path : "/translate/detail",
			pro_info 		: {
				pro_name	: user.pro_name,
				pro_type	: user.pro_type+"、"+g_vars.PRO_TYPE[user.pro_type],
				pro_nature: user.pro_nature+"、"+g_vars.PRO_NATURE[user.pro_nature],
				tutor_name: user.tutor_name,
				status    : null
			}
		};

		stuDAO.showTranslate(user.pro_id,(result)=>{

			if(result.length != 0){
				data.pro_info.status = result[0].status;
			}
			res.render("stu_process",data);
		});

});

/* 外文翻译详情 */
router.get("/detail",function(req, res){

	publicFun.hasPower(req,res,g_vars.ID_STUDENT);

	var user = req.session.user;
	var pro_id = req.query.pro_id?req.query.pro_id:user.pro_id; 

	var data = {
			title 			: "this is translate detail",
			username 		: user.stu_name,
			identity 		: user.identity,
			nav_active 	: g_vars.PROCESS_TRANSLATE,
			breadcrumbs : "流程管理 >> 文献综述或外文翻译",
			
			readonly		: "",

			pro_info		: {},

			tutor_num : user.tutor_num,
			tutor_name: user.tutor_name,

			file_tip	: "外文翻译原文：",
			annex_tip	: "外文翻译："
		};

	publicDAO.getDetail(pro_id,g_vars.PROCESS_TRANSLATE,function(result){

		// 未查到信息 ==> 未上传
		if(result.length == 0){
			data.pro_info = {
				id 					: 0,
				file_path		: null,
				annex_path	: null,
				comments		: ""
			};
		}
		else{
			data.pro_info = result[0];
			// 如果审核通过，所有文本框置为readonly
			if(data.pro_info.status == 1){
				data.readonly = " readonly='readonly' ";
			}
			data.pro_info.file_name = publicFun.getFileName(data.pro_info.file_path);
			data.pro_info.annex_name = publicFun.getFileName(data.pro_info.annex_path);
			(!result[0].comments) && (data.pro_info.comments = "");

		}
		res.render("stu_4_translate_detail",data);
	})
});

/* 上传/修改 外文翻译内容 */
router.post("/upload",function(req,res){

	publicFun.hasPower(req,res,g_vars.ID_STUDENT);

	var info = req.body,
			user = req.session.user;

	info.pro_id 	= user.pro_id;
	info.tutor_id = user.tutor_id;

	stuDAO.uploadTranslate(info,(result)=>{
		// console.dir(result);
		if(result.affectedRows != 0){
			res.json({ok:true});
		}else{
			res.json({ok:false});
		}
	});
});

module.exports = router;