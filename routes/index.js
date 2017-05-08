var express = require('express');
var router = express.Router();
var fs = require("fs");

var multer = require("multer");
var upload = multer({dest : "upload_files/"});

var g_vars = require("../helper/variable");

var publicDAO = require("../DAO/publicDAO");
var publicFun = require("./publicFun");


/* GET home page. */
router.get('/', function(req, res, next) {
	publicFun.hasLogin(req,res);
  res.render('login');
});

router.get('/index', function(req, res, next) {

	publicFun.toLogin(req,res);
	var user_info = req.session.user;
	
	var data = { 
		title 		: 'this is index title -- cm',
		username 	: user_info.stu_name,
		identity 	: user_info.identity,
		nav_active : 1
	};

  res.render('index', data);
});


router.get('/login', function(req, res, next) {
	publicFun.hasLogin(req,res);
  res.render('login');
});
router.post("/login",function(req, res, next){
	// console.log(req.body);
	var stu_num=req.body.usernum;
	var pwd=publicFun.encrypt(req.body.pwd);

	// 防止
	var identity = req.body.identity==g_vars.ID_STUDENT?g_vars.ID_STUDENT:g_vars.ID_TUTOR;
	
	// 返回数据
	var returnData = {};
	publicDAO.login(stu_num,identity,function(result){
	
		/* 返回结果为空 ==> 账号不正确，未查到数据 */
		if(result.length === 0){
			res.json ({userError:true});
			return;
		}
		result = result[0];
		// 查找到信息
		// 密码不正确
		if(result.password != pwd){
			res.json ({pwdError:true});
			// returnData.pwdError = true;
			return;
		}

		// 账号密码正确, 正确登陆
		// 保存学生信息到 session
		if(identity === g_vars.ID_STUDENT){
			req.session.user = {
				// 学生信息 : id,学号,姓名,专业id,专业名,进度,答辩组id,
				stu_id 			: result.stu_id,
				stu_name 		: result.stu_name,
				stu_num 		: result.stu_num,
				pro_process : result.pro_process,
				reply_group_id : result.reply_group_id,
				identity 		: g_vars.ID_STUDENT, 

				// 专业信息 ： 专业id,专业名
				major_id 		: result.stu_major,
				major_name	: result.major_name,

				// 课题信息 ： 课题id, 课题名,课题类型,课题性质
				pro_id 			: result.pro_id,
				pro_name		: result.pro_name,
				pro_type 		: result.pro_type,
				pro_nature 	: result.pro_nature,

				// 导师信息 ：导师id,导师工号,导师名
				tutor_id		: result.tutor_id,
				tutor_num		: result.tutor_num,
				tutor_name 	: result.tutor_name
			}
		
		}
		if(identity === g_vars.ID_TUTOR){
			req.session.user = {
				tutor_id 			: result.tutor_id,
				tutor_name		: result.tutor_name,
				identity 			: g_vars.ID_TUTOR
			}
		}
		var redirectUrl =  publicFun.redirectTo(req.session.user);
		res.json({success:g_vars.SUCCESS,url:redirectUrl});
	});
});

router.get("/logout",function(req, res , next){
	delete req.session.user;
  return res.render('login');
});

router.post("/upload",upload.single('upload_file'),(req,res)=>{

	// 没有附带文件
  if (!req.file) {
    res.json({ ok: false });
    return;
  }
  // 输出文件信息
  // console.log('====================================================');
  // console.log('fieldname: ' + req.file.fieldname);
  // console.log('originalname: ' + req.file.originalname);
  // console.log('encoding: ' + req.file.encoding);
  // console.log('mimetype: ' + req.file.mimetype);
  // console.log('size: ' + (req.file.size / 1024).toFixed(2) + 'KB');
  // console.log('destination: ' + req.file.destination);
  // console.log('filename: ' + req.file.filename);
  // console.log('path: ' + req.file.path);

 
  var file_name = getTime()+req.file.originalname,
      newPath   = "./upload_files/"+file_name
  fs.rename(req.file.path,newPath,(err)=>{
  	if(err){
  		res.json({ ok: false, discription:"重命名失败" });
  	}
  	else{
  		// 返回文件路径
			res.json({ ok: true, path:file_name});  		
  	}
  })
});


/* 下载文件，get传值，传入文件路径 */
router.get("/download",(req,res)=>{
	console.log("this is download ");
	publicFun.toLogin(req,res);

  var path = "upload_files/"+req.query.name;
  console.log(path);
  var file_name = publicFun.getFileName(req.query.name);
  res.download(path,file_name);
});

// 获取当前时间戳
function getTime(){
	return (new Date()).getTime()+"__";
}


router.get("/reply",(req,res)=>{
	
	publicFun.toLogin(req,res);

	var user = req.session.user;
	
	publicDAO.showReplyGroup(user,(group_info,tutor_info,stu_info)=>{
		var data = {
			title 			: "答辩组信息",
			username 		: user.stu_name,
			identity 		: user.identity,
			nav_active 	: g_vars.PROCESS_REPLY,

			breadcrumbs : "流程管理 >> 答辩组信息",

			prompt_text	: [
				"学生查看所在答辩组的信息"
			]
		};
		if(group_info.length == 0 || tutor_info.length == 0|| stu_info.length == 0){
			console.log("not info");
			data.show = false;
		}else{
			data.show = true;
			data.group_info = group_info[0];
			data.tutor_info = [];
			for(var i in tutor_info){
				data.tutor_info[tutor_info[i].tutor_id] = tutor_info[i].tutor_name;
			}
			data.stu_info 	= stu_info;
		}		
		res.render("reply_group",data);
	});

});
module.exports = router;
