var express = require('express');
var router = express.Router();
var g_vars = require("../helper/variable");

var stuDAO = require("../DAO/stuDAO");

var publicFun = require("./publicFun");

/* 教师评价 ： */
router.get("/", (req, res)=>{

	publicFun.hasPower(req,res,g_vars.ID_STUDENT);

	var user = req.session.user;

	var data = {
			title 			: "comments",
			username 		: user.stu_name,
			identity 		: user.identity,
			nav_active 	: g_vars.PROCESS_OVER,

			breadcrumbs : "流程管理 >> 教师评价",

			prompt_text	: [
				"学生对论文指导教师进行评价，并且可以查看论文的最终成绩"
			]
		};

		stuDAO.showComments(user.stu_id,(score_info,comments)=>{

			if(result.length != 0){
				data.pro_info.status = result[0].status;
			}
			res.render("stu_process",data);
		});

});


/* 上传/修改 中期检查内容 */
router.post("/upload",function(req,res){

	publicFun.hasPower(req,res,g_vars.ID_STUDENT);

	var info = req.body,
			user = req.session.user;

	info.pro_id 	= user.pro_id;
	info.tutor_id = user.tutor_id;

	stuDAO.uploadComments(info,(result)=>{
		// console.dir(result);
		if(result.affectedRows != 0){
			res.json({ok:true});
		}else{
			res.json({ok:false});
		}
	});
});

module.exports = router;