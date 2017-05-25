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
			title 			: "paper",
			nav_active 	: g_vars.PROCESS_PAPER,

			breadcrumbs : "流程管理 >> 论文正稿",

			prompt_text	: [
				"1、 在完成论文草稿后，可递交设计（论文）。",
				"2、 设计（论文）由两部分组成，其中设计（论文）文件必须上传，附件可选。",
				"3、 只有单击“确认提交”按钮，论文才最终提交，等待指导教师的审核。",
				"4、 指导教师审核通过后，才可以进入下个流程。",
				"5、 如果论文定稿通过教师审核通过之后，还需要修改，则可以在“特殊情况处理—论文定稿修改”菜单功能页面进行修改，修改后需要教师在特殊情况处理审核"
			],

			detail_path : "/paper/detail"
		};

	publicFun.renderProcess(req,res,data);
		
});

/* 详情 */
router.get("/detail",function(req, res){

	publicFun.toLogin(req,res);

	var user = req.session.user;
	var pro_id = req.query.id?req.query.id:user.pro_id; 

	var data = {
			title 			: "this is paper detail",
			username 		: user.username,
			identity 		: user.identity,
			nav_active 	: g_vars.PROCESS_PAPER,
			breadcrumbs : "流程管理 >> 论文正稿",
			
			upload_url	: "/paper/upload",

			readonly		: "",

			pro_info		: {},

			tutor_num : user.tutor_num,
			tutor_name: user.tutor_name,


			file_tip	: "设计(论文)文件：",
			annex_tip	: "设计(论文)附件："
		};

	publicDAO.getDetail(pro_id,g_vars.PROCESS_PAPER,function(result){

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
		res.render("stu_6_paper_detail",data);
	})
});

/* 上传/修改 中期检查内容 */
router.post("/upload",function(req,res){

	publicFun.hasPower(req,res,g_vars.ID_STUDENT);

	var info = req.body,
			user = req.session.user;

	info.pro_id 	= user.pro_id;
	info.tutor_id = user.tutor_id;

	stuDAO.uploadPaper(info,(result)=>{
		// console.dir(result);
		if(result.affectedRows != 0){
			res.json({ok:true});
		}else{
			res.json({ok:false});
		}
	});
});

module.exports = router;