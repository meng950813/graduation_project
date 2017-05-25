var express = require('express');
var router = express.Router();

var g_vars = require("../helper/variable");

var publicDAO = require("../DAO/publicDAO");
var scoreDAO  = require("../DAO/scoreDAO");

var publicFun = require("./publicFun");

router.get("/",(req,res)=>{
	res.redirect("/score/usual");
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
			console.log("empty list project ");
			return;
		}
		publicFun.formatProjectType(pro_info);
		data.pro_info = result;

		scoreDAO.getScoreList(user.id,0,(score_info)=>{
			data.score_info = setArrToHash(score_info);
			res.render("usual_grades_page",data);
		});
	});
});

/* 上传平时成绩页面 */
router.get("/usual_grades/detail/",(req,res)=>{
	
	publicFun.hasPower(req,res,g_vars.ID_TUTOR);
	
	var pro_id = req.query.id;
	if(pro_id == undefined || isNaN(pro_id) || pro_id < 1){
		res.redirect("/score/usual_grades");
	}

	var data = {
				title 		: "平时成绩",
				username 	: user.username,
				identity 	: user.identity, 
				nav_active 	: 5,

				breadcrumbs : "流程管理 >> 平时成绩",
			};

	scoreDAO.getUsualGrades(pro_id,(result)=>{
		if(result.length == 0){
			res.redirect("/score/usual_grades");
		}
		data.pro_info = result[0];
		res.render("score_usual",data);
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
			console.log("empty list project ");
			return;
		}
		publicFun.formatProjectType(pro_info);
		data.pro_info = result;

		scoreDAO.getScoreList(user.id,1,(score_info)=>{
			data.score_info = setArrToHash(score_info);
			res.render("usual_grades_page",data);
		});
	});
});

/* 上传指导教师评分页面 */
router.get("/tutor_score/detail/",(req,res)=>{
	publicFun.hasPower(req,res,g_vars.ID_TUTOR);
	var pro_id = req.query.id;
	if(pro_id == undefined || isNaN(pro_id) || pro_id < 1){
		res.redirect("/score/tutor_score");
	}
	var data = {
				title 		: "指导教师评分",
				username 	: user.username,
				identity 	: user.identity, 
				nav_active 	: 6,

				breadcrumbs : "流程管理 >> 指导教师评分",
			};

	scoreDAO.getTutorScore(pro_id,(result)=>{
		if(result.length == 0){
			res.redirect("/score/tutor_score");
		}
		data.pro_info = result[0];
		res.render("score_tutor",data);
	});
});



/* 上传平时成绩 */
router.post("/usual_grades",(req,res)=>{
	publicFun.hasPower(req,res,g_vars.ID_TUTOR);
	var info = req.body;
	scoreDAO.updateUsualGrades(info,(result)=>{
		console.log(result);
		console.dir(result);
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






/**
 * 将传入的数组变为hash数组，以 pro_id 为键
 */
var setArrToHash = (array)=>{
	var hashArr = [];
	for(var i in array){
		hashArr[array[i].pro_id] = array[i];
	}
	return hashArr;
}

module.exports = router;