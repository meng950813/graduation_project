/**
 * create by cm -2017/4/15
 */
const crypto = require("crypto");
const secret = "meng";
var g_vars	 = require("../helper/variable");

var stuDAO = require("../DAO/stuDAO");

function fullZero(number){
	return number>10?number:"0"+number;
}

module.exports = {

	/**
	 * 将从数据库中取出的时间戳换为时间字符串
	 */
	formatDate :(date)=>{
		date = new Date(date);
		return date.getFullYear()+"-"
					+fullZero(date.getMonth()+1)+"-"
					+fullZero(date.getDate())+"  "
					+fullZero(date.getHours())+":"
					+fullZero(date.getMinutes());
	},


	/**
	 * 加密模块
	 * 利用sha256算法,配合私钥生成 64 位 16进制 加密字符
	 */
	encrypt : (source)=>{
		return crypto.createHmac('sha256', secret)
                 .update(source)
                 .digest('hex');
	},


	/**
	 * [渲染任务书 - 论文正稿之间的页面]
	 *
	 * @param {[type]} info [特定内容
	 * title,nav_active,breadcrumbs,prompt_text,detail_path,]
	 *
	 */
	renderProcess : (req,res,info)=>{
		var user = req.session.user;
		// 初始化通用信息
		var data = {
			title 			: "",
			username 		: user.username,
			identity 		: user.identity,
			nav_active 	: null,

			breadcrumbs : null,
			prompt_text	: [],

			detail_path	: "",
			
			pro_info 		: {
				pro_name	: user.pro_name,
				pro_type	: user.pro_type+"、"+g_vars.PRO_TYPE[user.pro_type],
				pro_nature: user.pro_nature+"、"+g_vars.PRO_NATURE[user.pro_nature],
				tutor_name: user.tutor_name,
				// status == null 表示当前进度已经完成，上传内容审核通过
				status    : null
			}
		};

		// 填充特定信息
		data.title 			 = info.title;
		data.nav_active  = info.nav_active;
		data.breadcrumbs = info.breadcrumbs;
		data.prompt_text = info.prompt_text;
		data.detail_path = info.detail_path;

		// 查看已经完成的内容
		if(user.pro_process > info.nav_active){
			res.render("stu_process",data);
		}
		// 查看当前进度的内容
		else if(user.pro_process == info.nav_active){
			stuDAO.getStatus(user.pro_id,(result)=>{
				if(result.length != 0){
					data.pro_info.status = result[0].status;
				}
				res.render("stu_process",data);
			});
		}
		// 查看下一进度的状态：设置 status = 5:暂不能上传
		else {
			data.pro_info.status = 5;
			res.render("stu_process",data);
		}
	},


	/* 判断返回结果中是否有数据 */
	noPro_info : (res,result,data)=>{
		if(result.length == 0){
			res.render("no_project",data);
		}
	},

	/* 未登录,跳转到登录页 */
	toLogin : (req,res)=>{
		// console.log("in toLogin : "+ req.session.user.identity);
		if(req.session.user == undefined)
			res.redirect("/login");
	},
	/* 已登录,不允许跳转到 login 页面 */
	hasLogin : (req,res)=>{
		// console.dir(req.session);
		if(req.session.user != undefined)
			res.redirect("/index");
	},

	/**
	 * 判断当前用户是否有权限进入该页面
	 *
	 * @param {[type]} req      [传入参数,主要为session内容]
	 * @param {[type]} res      [主要用于页面重定向]
	 * @param {[type]} belongTo [要进入页面属于学生(0)/导师(1)]
	 *
	 * @return {[type]} [description]
	 */
	hasPower : (req,res,belongTo)=>{
		/* 首先判断当前用户是否已登录 : 若未登录进入登录页面*/
		if(req.session.user == undefined)
			res.redirect("/login");

		/* 当前用户与当前页面适用用户类型不同，重定向到error页面 */
		if(req.session.user.identity != belongTo){
			// var data = {
			// 	message : "您没有权限进入该页面",
			// 	error   : {
			// 		status : "",
			// 		stack  : ""
			// 	}
			// }
			var err = new Error('Not Found');
		  err.status = 404;
		  // next(err);
			res.redirect("/error",err);
		}
	},

	/**
 * 将获取的课题类型及性质转换为可读文字
 *
 * @param {[type]} result [查询结果]
 */
	formatProjectType : (result)=>{
		for(var i in result){
			result[i].pro_type = result[i].pro_type +"、" +g_vars.PRO_TYPE[result[i].pro_type];
			result[i].pro_nature = result[i].pro_nature +"、" +g_vars.PRO_NATURE[result[i].pro_nature];
		}
	},


	/**
	 * 根据传入的当前进度，获取之前已经完成的进度列表
	 *
	 * @param {[type]} pro_process [毕设进度，2表示 任务书，从导师角度，这是开始]
	 *
	 * @return {[type]} [进度列表数组]
	 */
	getProcessList : (pro_process)=>{
		var arr = [],sub = 2;
		for(var key in g_vars.PROCESS){
			arr[key] = g_vars.PROCESS[key];
			arr['lastKey'] = key;
			sub++;
			if(sub > pro_process)
				break;
		}
		return arr;
	},


	/**
	 * 通过文件路径 获取文件名 
	 *
	 * @param {[type]} file_path [文件路径]
	 *
	 */
	getFileName : (file_path)=>{
		// var paths = file_path.split("/");
		// 时间戳为13位,+ 2位下划线 ==> 15位
		return file_path == null ? null : file_path.substr(15);
	},

	/* 返回总评等级及对应颜色 */
	getScoreLevel : (score_arr)=>{
		// 如果还有分数项未上传，返回总评成绩为null
		if(score_arr.usual_score==null||score_arr.mentor_score==null
			||score_arr.appraise_score==null||score_arr.reply_score==null)
			return null;
		var score = score_arr.usual_score * 0.2+
								score_arr.mentor_score * 0.2+
								score_arr.appraise_score * 0.25+
								score_arr.reply_score * 0.35; 
		if(score >= 90)
			return {"score":score,"level":"优","color":"color-success"};
		else if(score >= 80)
			return {"score":score,"level":"良","color":"color-primary"};
		else if(score >= 70)
			return {"score":score,"level":"中","color":"color-info"};
		else if(score >= 60)
			return {"score":score,"level":"及格","color":"color-warning"};
		else
			return {"score":score,"level":"不及格","color":"color-danger"};
	},

	redirectTo : (user_info)=>{
		// 如果是学生，跳转到当前毕设进度页面
		if(user_info.identity == g_vars.ID_STUDENT){
			switch(user_info.pro_process){
				case g_vars.PROCESS_SELECT:
					return "/choose";
				case g_vars.PROCESS_TASK:
					return "/task";
				case g_vars.PROCESS_OPEN:
					return "/open";
				case g_vars.PROCESS_TRANSLATE:
					return "/translate";
				case g_vars.PROCESS_MIDDLE:
					return "/middle";
				case g_vars.PROCESS_DRAFT:
					return "/draft";
				case g_vars.PROCESS_PAPER:
					return "/paper";
				case g_vars.PROCESS_REPLY:
					return "/reply";
			}
		}
		// 否则返回导师页面路由
		return "/tutor";
	}

}