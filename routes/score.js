var express = require('express');
var router = express.Router();

var g_vars = require("../helper/variable");

var publicDAO = require("../DAO/publicDAO");
var scoreDAO  = require("../DAO/scoreDAO");

var publicFun = require("./publicFun");

/* 总评成绩列表页面 */
router.get("/",(req,res)=>{

	publicFun.toLogin(req,res);
	
	if(req.session.user.identity == g_vars.ID_STUDENT){
		res.redirect("/score/grades");
	}

	var user = req.session.user,
			data = {
				title 		: "总评成绩",
				username 	: user.username,
				identity 	: user.identity, 
				nav_active 	: 10,

				breadcrumbs : "流程管理 >> 总评成绩",

				prompt_text	: [
					"1、 显示所有发布课题的总评成绩。",
					"2、 点击 “查看” 查看学生详细成绩 。"
				]
			};
	scoreDAO.getTotalList(user.id,(result)=>{
		if(result.length == 0){
			res.render("no_data",data);
			return;
		}
		
		publicFun.formatProjectType(result);

		for(var i in result){
			result[i].total_score = publicFun.getScoreLevel(result[i]);
		}

		data.pro_info = result;
		// console.log(data.pro_info);
		res.render("score_total_list",data);
	});
});

/* 总评成绩列表详情页 */
router.get("/grades",(req,res)=>{

	publicFun.toLogin(req,res);

	var user = req.session.user,
			pro_id = req.query.id;
	var data = {
			title 		: "总评成绩",
			username 	: user.username,
			identity 	: user.identity, 
			nav_active 	: 10,

			breadcrumbs : "流程管理 >> 总评成绩"
		};

	if(user.identity == g_vars.ID_STUDENT){
		pro_id = user.pro_id;
	}
	if(pro_id == undefined){
		res.render("index",data);
		return;
	}

	scoreDAO.getTotalScore(pro_id,(result)=>{
		if(result.length == 0){
			// data.noData = true;
			// res.render("score_total",data);
			res.render("no_data",data);
		}else{
			result = result[0];
			result.total_score = publicFun.getScoreLevel(result);
			// publicFun.formatProjectType(result);
			data.pro_info = result;
			console.log(data.pro_info);
			res.render("score_total",data);
		}
	});
});

/* 平时成绩列表 */
router.get("/usual_grades",(req,res)=>{
	publicFun.hasPower(req,res,g_vars.ID_TUTOR);
	var user = req.session.user,
			data = {
				title 		: "平时成绩",
				username 	: user.username,
				identity 	: user.identity, 
				nav_active 	: 5,

				breadcrumbs : "流程管理 >> 平时成绩",

				prompt_text	: [
					"1、 显示所有发布课题的平时成绩。",
					"2、 点击 “评分/修改” 填写学生平时成绩 。"
				]
			};

	scoreDAO.getProList(user.id,(result)=>{
		
		if(result.length == 0){
			res.render("no_data",data);
			return;
		}

		data.pro_info = result;
		publicFun.formatProjectType(data.pro_info);

		scoreDAO.getScoreList(user.id,0,(score_info)=>{
			data.path = "usual_grades";
			data.score_info = setArrToHash(score_info);
	
			res.render("score_page",data);
		});
	});
});

/* 上传平时成绩页面 */
router.get("/usual_grades/detail",(req,res)=>{
	
	publicFun.hasPower(req,res,g_vars.ID_TUTOR);
	
	var pro_id = req.query.id,
			user = req.session.user;
	var data = {
				title 		: "平时成绩",
				username 	: user.username,
				identity 	: user.identity, 
				nav_active 	: 5,

				breadcrumbs : "流程管理 >> 平时成绩",
			};
	
	if(pro_id == undefined || isNaN(pro_id) || pro_id < 1){
		res.render("index",data);
		return;
	}
	scoreDAO.getUsualGrades(pro_id,(result)=>{
		if(result.length == 0){
			res.render("no_data",data);
		}else{
			data.pro_info = result[0];
			res.render("score_usual",data);
		}
	});
});


/* 指导教师评分列表 */
router.get("/tutor_score",(req,res)=>{
	publicFun.hasPower(req,res,g_vars.ID_TUTOR);
	var user = req.session.user,
			data = {
				title 		: "指导教师评分",
				username 	: user.username,
				identity 	: user.identity, 
				nav_active 	: 6,

				breadcrumbs : "流程管理 >> 指导教师评分",

				prompt_text	: [
					"1、 显示所有发布课题的指导教师评分。",
					"2、 点击 “评分/修改” 填写指导教师评分 。"
				]
			};

	scoreDAO.getProList(user.id,(result)=>{
		
		if(result.length == 0){
			res.render("no_data",data);
			return;
		}

		data.pro_info = result;
		publicFun.formatProjectType(data.pro_info);

		scoreDAO.getScoreList(user.id,1,(score_info)=>{
			data.path = "tutor_score";
			data.score_info = setArrToHash(score_info);
			res.render("score_page",data);
		});
	});
});

/* 上传指导教师评分页面 */
router.get("/tutor_score/detail",(req,res)=>{
	publicFun.hasPower(req,res,g_vars.ID_TUTOR);
	var pro_id = req.query.id,
			user = req.session.user;
	var data = {
				title 		: "指导教师评分",
				username 	: user.username,
				identity 	: user.identity, 
				nav_active 	: 6,

				breadcrumbs : "流程管理 >> 指导教师评分",
			};

	if(pro_id == undefined || isNaN(pro_id) || pro_id < 1){
		res.render("index",data);
		return;	
	}
	scoreDAO.getTutorScore(pro_id,(result)=>{
		if(result.length == 0){
			res.render("no_data",data);
		}else{
			data.pro_info = result[0];
			res.render("score_tutor",data);
		}
	});
});



/* 上传平时成绩 */
router.post("/usual_grades",(req,res)=>{
	publicFun.hasPower(req,res,g_vars.ID_TUTOR);
	var info = req.body;
	scoreDAO.updateUsualGrades(info,(result)=>{
		// console.log(result);
		// console.dir(result);
		if(result.affectedRows > 0){
			res.json({ok:true});
		}
		else{
			res.json({ok:false});
		}
	});
});

/* 上传指导教师评分 */
router.post("/tutor_score",(req,res)=>{
	publicFun.hasPower(req,res,g_vars.ID_TUTOR);
	var info = req.body;
	scoreDAO.updateTutorScore(info,(result)=>{
		if(result.affectedRows > 0){
			res.json({ok:true});
		}
		else{
			res.json({ok:false});
		}
	});
});


/* 获取详细数据 */
router.post("/detail",(req,res)=>{
	var info = req.body, fun;
	if(isNaN(info.type) || isNaN(info.id)){
		res.json({ok:false});
		return;
	}
	info.type = Math.floor(info.type);

	if(info.type < 0 || info.type > 4){
		res.json({ok:false});
		return;
	}

	scoreDAO.getScoreDetail(info.id,info.type,(result)=>{
		if(result.length == 1)
			result = {result :result[0]};
		res.json(result);
	});
});


/* 评价教师列表 */
router.get("/comments",(req,res)=>{
	publicFun.hasPower(req,res,g_vars.ID_TUTOR);

	var user = req.session.user;

	var data = {
				title 		: "学生评价列表",
				username 	: user.username,
				identity 	: user.identity, 
				nav_active 	: 11,

				breadcrumbs : "流程管理 >> 学生评价列表"
			};

	scoreDAO.getCommentsList(user.id,(result)=>{
		if(result.length == 0){
			res.render("no_data",data);
			return;
		}
		publicFun.formatProjectType(result);
		data.pro_info = result;
		
		res.render("score_comments_list",data);
	})
});

/* 评价教师页面 */
router.get("/comments_detail",(req,res)=>{
	publicFun.toLogin(req,res);
	var user = req.session.user,
			data = {
				title 		: "学生评价列表",
				username 	: user.username,
				identity 	: user.identity, 
				nav_active 	: 11,

				breadcrumbs : "流程管理 >> 学生评价列表"
			};

	var pro_id = req.query.id;

	if(user.identity == g_vars.ID_STUDENT){
		pro_id = user.pro_id;
		data.tutor_info = {
			tutor_num	 : user.tutor_num,
			tutor_name : user.tutor_name
		};
	}
	if(pro_id == undefined){
		res.render("index",data);
		return;
	}
	scoreDAO.getComment(pro_id,(result)=>{
		if(result.length == 0){
			res.render("no_data",data);
		}else{
			data.pro_info = result[0];
			res.render("score_comment",data);
		}
	});
});
/* 上传教师评价 */
router.post("/upload_comments",(req,res)=>{
	var info = req.body;
	if(isNaN(info.id) || info.id < 1)
		res.json({ok:false});
	info.pro_id = info.id;
	scoreDAO.updateComment(info,(result)=>{
		if(result.affectedRows == 0){
			res.json({ok:false});
		}
		res.json({ok:true});
	});
});

/**
 * 将传入的数组变为hash数组，以 pro_id 为键
 */
var setArrToHash = (array)=>{
	var hashArr = [];
	for(var i in array){
		hashArr[array[i].project_id] = array[i];
	}
	return hashArr;
}

module.exports = router;