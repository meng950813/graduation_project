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
	publicFun.toLogin(req,res);
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
			res.json({userError:true});
			return;
		}
		result = result[0];
		// 查找到信息
		// 密码不正确
		if(result.password != pwd){
			res.json({pwdError:true});
			// returnData.pwdError = true;
			return;
		}

		// 账号密码正确, 正确登陆
		// 保存学生信息到 session
		if(identity === g_vars.ID_STUDENT){
			req.session.user = {
				// 学生信息 : id,学号,姓名,专业id,专业名,进度,答辩组id,
				id 					: result.stu_id,
				username 		: result.stu_name,
				num 				: result.stu_num,
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
				id 					: result.tutor_id,
				username		: result.tutor_name,
				num					: result.tutor_num,
				identity 		: g_vars.ID_TUTOR
			}
		}
		var redirectUrl =  publicFun.redirectTo(req.session.user);
		res.json({success:g_vars.SUCCESS,url:redirectUrl});
	});
});

router.get("/logout",function(req, res , next){
	delete req.session.user;
  res.render('login');
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
	// console.log("this is download ");
	publicFun.toLogin(req,res);

  var path = "upload_files/"+req.query.name;
  // console.log(path);
  var file_name = publicFun.getFileName(req.query.name);
  res.download(path,file_name);
});


/* 修改密码 */
router.get("/password",(req,res)=>{
	publicFun.toLogin(req,res);
	
	var user = req.session.user;
	var data = {
		title : "修改密码",
		username: user.username,
		identity: user.identity,
		nav_active: 31,

		breadcrumbs: "账号管理 >> 修改密码"
	};
	res.render("modify_pwd",data);
});

router.post("/modify_pwd",(req,res)=>{
	publicFun.toLogin(req,res);
	var info = req.body,
			user = req.session.user;
	
	// console.log(info);

	publicDAO.getPwd(user.id,user.identity,(result)=>{
		if(result.length == 0){
			res.json({ok:false,type:0});
			return;
		}
		var pwd = publicFun.encrypt(info.pwd);
		if(pwd != result[0].password){
			res.json({ok:false,type:1});
			return;
		}
		else{
			var new_pwd = publicFun.encrypt(info.new_pwd);
			publicDAO.changePwd(user.id,user.identity,new_pwd,(result)=>{
				// console.log(result);
				if(result.affectedRows == 0){
					res.json({ok:false,type:2});
					return;
				}
				res.json({ok:true});
			});
		}
	});
});


/* 获取联系方式 */
router.get("/link",(req,res)=>{
	publicFun.toLogin(req,res);

	var user = req.session.user;
		var data = {
		title : "个人信息",
		username: user.username,
		identity: user.identity,
		nav_active: 32,
		/* 标志是否是自己 ==> 学生能查看导师信息 */
		isMe : true,

		breadcrumbs: "账号管理 >> 个人信息"
	};
	publicDAO.getLink(user.id,user.identity,(result)=>{
		if(result.length == 0){
			res.redirect("/index");
			return;
		}
		data.info = result[0];
		res.render("modify_link",data);
	});
});

/* 获取导师联系方式 */
router.get("/link_teacher",(req,res)=>{
	publicFun.toLogin(req,res);

	var user = req.session.user;
	var data = {
		title : "导师信息",
		username: user.username,
		identity: user.identity,
		nav_active: 33,
		/* 标志是否是自己 ==> 学生能查看导师信息 */
		isMe : false,

		breadcrumbs: "账号管理 >> 导师信息"
	};
	if(user.tutor_id == undefined || user.tutor_id == null){
		res.render("no_data",data);
		return;
	}

	publicDAO.getLink(user.tutor_id,g_vars.ID_TUTOR,(result)=>{
		if(result.length == 0){
			res.redirect("/index");
			return;
		}
		data.info = result[0];
		res.render("modify_link",data);
	});
});

router.post("/modify_link",(req,res)=>{
	publicFun.toLogin(req,res);

	var info = req.body,
			user = req.session.user;
	(info.phone=="")&&(info.phone = undefined);
	(info.mail=="")&&(info.mail = undefined);
	info.id = user.id;
	info.identity = user.identity;
	
	publicDAO.changeLink(info,(result)=>{
		if(result.affectedRows == 0){
			res.json({ok:false});
			return;
		}
		res.json({ok:true});
	});
});


/* 私信：获取所有收信箱中的私信 */
router.get("/message",(req,res)=>{
	publicFun.toLogin(req,res);

	var user = req.session.user;
	var info = {};

	// 表示获取收信箱内容
	info.send = 0;
	/* g_vars.ID_STUDENT->0,学生to导师； g_vars.ID_TUTOR->1,导师to学生 */
	info.type = (user.identity^g_vars.ID_TUTOR);

	info.id = user.id;

	var data = {
		title : "收件箱",
		username: user.username,
		identity: user.identity,
		nav_active: 41,
		// 表示在收信箱中
		isSend:0,

		breadcrumbs: "交流互动 >> 收件箱"
	};

	publicDAO.getMessage(info,(result)=>{
		if(result.length == 0){
			data.no_info = true;
		}else{
			data.no_info = false;
			data.info_list = result;
		}
		res.render("message_list",data);
	});
});

/* 私信：获取所有发信箱中的私信 */
router.get("/s_message",(req,res)=>{
	publicFun.toLogin(req,res);

	var user = req.session.user;
	var info = {};

	// 表示获取发信箱内容
	info.send = 1;
	/* g_vars.ID_STUDENT->0,学生to导师； g_vars.ID_TUTOR->1,导师to学生 */
	info.type = user.identity;

	info.id = user.id;

	var data = {
		title : "发件箱",
		username: user.username,
		identity: user.identity,
		nav_active: 42,
		// 表示在发信箱中
		isSend:1,

		breadcrumbs: "交流互动 >> 发件箱"
	};

	publicDAO.getMessage(info,(result)=>{
		if(result.length == 0){
			data.no_info = true;
		}else{
			data.no_info = false;
			data.info_list = result;
		}
		publicFun.formatTitle(data.info_list);
		res.render("message_list",data);
	});
});

/* 私信详情 */
router.get("/m_detail",(req,res)=>{
	publicFun.toLogin(req,res);

	var id = req.query.id,
			is_send = req.query.s,
			user = req.session.user;
	if(id == undefined || isNaN(id) || id < 1){
		res.redirect("/index");
		return;
	}
	if(is_send == undefined || isNaN(is_send) || (is_send != 0&&is_send!=1)){
		res.redirect("/index");
		return;
	}
	(is_send != 0)&&(is_send = 1);

	var mytitle = is_send==0?"收件箱":"发信箱";

	var data = {
		title : mytitle,
		username: user.username,
		identity: user.identity,
		nav_active: 41,
		isSend: is_send,

		breadcrumbs: "交流互动 >>"+mytitle
	};
	// 参数 0 表示 在收信箱中
	publicDAO.getOneMessage(id,0,(result)=>{
		if(result.length == 0){
			res.redirect("/index");
			return;
		}
		result = result[0][0];
		result.publish_time = publicFun.formatDate(result.publish_time);
		data.info = result;

		res.render("message_detail",data);
	});
});

/* 写信 */
router.get("/w_message",(req,res)=>{
	publicFun.toLogin(req,res);
	var id = req.query.id,
			user = req.session.user;

	var data = {
		title : "写信",
		username: user.username,
		identity: user.identity,
		nav_active: 40,
		
		isReply : false,

		breadcrumbs: "交流互动 >> 写信"
	};

	/* 回复某私信 */
	if(!isNaN(id) && id > 0){
		publicDAO.getOneMessage(id,0,(result)=>{
			if(result[0].length != 0){
				data.isReply = true;
				data.info = result[0][0];
			}
			res.render("message_send",data);
		});
	}else{
		res.render("message_send",data);
	}
});

/* 发私信 */
router.post("/send_message",(req,res)=>{
	var user = req.session.user,
			info = req.body;
	info.username=user.username;
	info.num=user.num;
	info.sender_id = user.id;
	info.identity=user.identity;

	if(user.identity == g_vars.ID_STUDENT){
		info.major_name = user.major_name;
	}
	// console.log(info);
	publicDAO.sendMessage(info,user.identity,(result)=>{
		if(result.affectedRows == 0){
			res.json({ok:false});
		}else{
			res.json({ok:true});
		}
	});
});


/* 获取用户信息 */
router.get("/get_user_info",(req,res)=>{
	publicFun.toLogin(req,res);

	var identity = req.session.user.identity,
			key = req.query.key;

	publicDAO.getUserInfo(key,identity,(result)=>{
		res.json(result);
	});
});

/* 删除私信 */
router.post("/del_message",(req,res)=>{
	publicFun.toLogin(req,res);
	var info = req.body;
	publicDAO.deleteMessage(info.id,(result)=>{
		if(result.affectedRows > 0){
			res.json({ok:true});
		}else{
			res.json({ok:false});
		}
	});
});

// 获取当前时间戳
function getTime(){
	return (new Date()).getTime()+"__";
}


module.exports = router;