var express = require('express');
var router = express.Router();

var g_vars = require("../helper/variable");

var publicDAO = require("../DAO/publicDAO");
var scoreDAO  = require("../DAO/scoreDAO");

var publicFun = require("./publicFun");



router.get("/",(req,res)=>{
	
	publicFun.toLogin(req,res);

	var user = req.session.user;
	
	var data = {
		title 			: "答辩组信息",
		username 		: user.username,
		identity 		: user.identity,
		nav_active 	: g_vars.PROCESS_REPLY,

		breadcrumbs : "流程管理 >> 答辩组信息",
	};

	var params = {};
	if(user.identity == g_vars.ID_STUDENT){
		params.pro_id = user.pro_id;
	}else{
		params.tutor_id = user.id;
	}
	

	publicDAO.showReplyGroup(params,(group_info,tutor_info,stu_info)=>{
		if(group_info.length == 0 || tutor_info.length == 0){
			console.log("not info");
			data.show = false;
		}else{
			data.show = true;
			
			data.group_info = group_info[0];

			data.date = publicFun.formatDate(data.group_info.start_time);

			data.tutor_info = [];
			for(var i in tutor_info){
				data.tutor_info[tutor_info[i].tutor_id] = tutor_info[i].tutor_name;
			}

			data.stu_info 	= stu_info;
		}		
		res.render("reply_group",data);
	});

});

router.get("/score",(req,res)=>{
	publicFun.hasPower(req,res,g_vars.ID_TUTOR);

	var pro_id = req.query.id;

	// 若参数不存在或非数字，返回
	if( pro_id == undefined || isNaN(pro_id) || pro_id < 1) 
		res.redirect("/reply");

	var user = req.session.user;

	var data = {
		title 			: "答辩评分",
		username 		: user.username,
		identity 		: user.identity,
		nav_active 	: g_vars.PROCESS_REPLY,

		breadcrumbs : "流程管理 >> 答辩评分"
	};


	scoreDAO.getReplyScore(pro_id,(result)=>{
		data.pro_info = result[0];
		res.render("score_reply",data);
	});
});


/* 上传答辩成绩 */
router.post("/reply_score",(req,res)=>{

	publicFun.hasPower(req,res,g_vars.ID_TUTOR);

	var user = req.session.user,
			data = req.body;

	data.tutor_id = user.id;
	scoreDAO.updateReplyScore(data,(result)=>{
		if(result.affectedRows > 0){
			res.json({ok:true});
		}else{
			res.json({ok:false});
		}
	});
});
module.exports = router;