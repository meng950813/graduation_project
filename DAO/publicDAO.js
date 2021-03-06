/**
 * Created by cm on 2017/4/15
 */
// 数据库连接池
var query = require("../helper/createMysqlPool");

var g_vars = require("../helper/variable");

module.exports = {
	
	/**
	 * 登录
	 *
	 * @param num  [学号/工号/管理员账号]
	 * @param identity  [[身份：学生/导师/管理员]]
	 *
	 * @return [返回密码,自定义id;学生返回 课题id,课题进程等]
	 */
	login : function(num,identity,callback){

		var sql;
		/*学生登陆，返回密码、课题id，进度，专业名,答辩组等信息*/
		if(identity === g_vars.ID_STUDENT){
			var nowYear = (new Date()).getFullYear();
			sql = `select student_info.*,major_name,pro_id,pro_name,pro_type,pro_nature,tutor_id,tutor_name,tutor_num
							from student_info
							LEFT JOIN major_info on major_info.major_id=student_info.stu_major
							left join project_info on student_info.project_id= project_info.pro_id
							left join tutor_info on project_info.publisher=tutor_info.tutor_id
							where stu_num=? and reply_year=${nowYear}`;
		}
		/*导师登录，返回主键，密码等信息*/
		else if(identity === g_vars.ID_TUTOR){
			sql = "select tutor_id,tutor_name,tutor_num,tutor_college,password from tutor_info where tutor_num=?";
		}
		/*管理员登录 */
		else if(identity === g_vars.ID_MASTER){
			sql = `select manager_info.*,tutor_name,tutor_college as college
						from manager_info,tutor_info 
						where man_num=? and man_num=tutor_num`;
/*			sql = `select manager_info.*,tutor_name 
						from manager_info,tutor_info
						where man_num=? and manager_info.tutor_id=tutor_info.tutor_id`;*/
		}
		query(sql,[num],function(error,result){
			if(error){
				console.log("login : "+error.message);
				return g_vars.ERROR;
			}
			// console.log("login success  callback : " );
			// console.dir(result);

			callback(result);
		})
	},


	/**
	 * 获取密码
	 *
	 * @param {[type]}   id       [description]
	 * @param {[type]}   identity [description]
	 */
	getPwd : function(id,identity,callback){
		var sql;
		// 学生密码
		if(identity === g_vars.ID_STUDENT){
			sql = "select password from student_info where stu_id=?";
		}
		// 导师修改密码
		else if(identity === g_vars.ID_TUTOR){
			sql = "select password from tutor_info where tutor_id=?";
		}
		// 管理员修改密码
		else if(identity === g_vars.ID_MASTER){
			sql = "select password from manager_info where man_id=?";
		}
		// 身份错误
		else{
			console.log("getPwd : identity error");
			return g_vars.ERROR;
		}
		query(sql,[id],function(error,result){
			if(error){
				console.log("getPwd : "+error.message);
				return g_vars.ERROR;
			}
			callback(result);
		});
	},


	/**
	 * 修改密码
	 *
	 * @param   id       [学生/导师/管理员id]
	 * @param   identity [身份：学生/导师/管理员]
	 * @param   new_pwd  [新密码]
	 *
	 * @return {[type]}   [返回修改结果]
	 */
	changePwd : function(id,identity,new_pwd,callback){
		var sql;
		// 学生修改密码
		if(identity === g_vars.ID_STUDENT){
			sql = "update student_info set password=? where stu_id=?";
		}
		// 导师修改密码
		else if(identity === g_vars.ID_TUTOR){
			sql = "update tutor_info set password=? where tutor_id=?";
		}
		// 管理员修改密码
		else if(identity === g_vars.ID_MASTER){
			sql = "update manager_info set password=? where man_id=?";
		}
		// 身份错误
		else{
			console.log("changePwd : identity error");
			return g_vars.ERROR;
		}
		query(sql,[new_pwd,id],function(error,result){
			if(error){
				console.log("changePwd : "+error.message);
				return g_vars.ERROR;
			}
			callback(result);
		});
	},


	getLink : (id,identity,callback)=>{
		var sql;
		if(identity == g_vars.ID_STUDENT){
			sql = `select phone,mail from student_info where stu_id=?`;
		}else if(identity == g_vars.ID_TUTOR){
			sql = `select phone,mail from tutor_info where tutor_id = ?`;
		}
		else{
			console.log("getPwd : identity error");
			return g_vars.ERROR;
		}
		query(sql,[id],(error,result)=>{
			if(error){
				console.log("get link error : "+error.message);
				result = [];
			}
			callback(result);
		});
	},

	/* 修改联系方式
		id,identity,phone,mail
	*/
	changeLink : (info,callback)=>{
		var sql ,params = [],str = '';
		if(info.phone != undefined || info.phone != null){
			str += " phone=? ";
			params.push(info.phone);
		}
		if(info.mail != undefined || info.mail != null){
			if(str !== ""){
				str += ","
			}
			str += " mail=? ";
			params.push(info.mail);
		}
		if(info.identity == g_vars.ID_STUDENT){
			sql = "update student_info set "+str+" where stu_id=?";
		}
		else if(info.identity == g_vars.ID_TUTOR){
			sql = "update tutor_info set "+str+" where tutor_id=?";
		}else{
			console.log("get link : identity error");
			return g_vars.ERROR;
		}
		params.push(info.id);
		
		query(sql,params,(error,result)=>{
			if(error){
				console.log("change link error : "+error.message);
				result = [];
			}
			callback(result);
		});
	},


	/**
	 * 发送私信
	 *
	 * @param {[type]}   info     [私信内容及 发送人接收人 姓名、id]
	 * @param {[type]}   type     [通信方向，0：学生 to 导师，1：导师 to 学生]
	 *
	 * @return {[type]}   [返回写入状态]
	 */
	sendMessage : function(info,type,callback){
		if(type === g_vars.ID_STUDENT){
			// 效果： 来自13软件工程xxx : 私信标题
			info.title = "来自 "+(info.num.substring(2))+info.major_name+info.username + " : " + info.title;
		}
		else if(type === g_vars.ID_TUTOR){
			// 效果：来自导师xxx : 私信标题
			info.title = "来自导师 "+info.username +" : "+info.title;
		}
		else{
			console.log("sendMessage : type error");
			return g_vars.ERROR;
		}

		var sql = `insert into contact_info(con_id,sender_id,receiver_id,title,content,type,status) 
							values(null,?,?,?,?,?,0)`;
		console.log(info,info.id);
		var params = [info.sender_id,info.id,info.title,info.content,type];
		query(sql,params,function(error,result){
			if(error){
				console.log("sendMessage : "+error.message);
				result = [];
			}
			callback(result);
		});
	},

	/**
	 * 删除私信
	 *
	 * @param  id   [私信id/（可以为数组）]
	 *
	 * @return   [返回处理结果 成功/失败]
	 */
	deleteMessage : function(id,callback){
		var sql = `delete from contact_info where con_id=?`; 
		query(sql,[id],function(error,result){
			if(error){
				console.log("readMessage : "+error.message);
				return g_vars.ERROR;
			}
			callback(result);
		});
	},

	/**
	 * 获取所有（未读）私信
	 *
	 * @param {[type]}   info [receiver_id,type,kind(可选)]
	 *            type: g_vars.ID_STUDENT->0,学生to导师； g_vars.ID_TUTOR->1,导师to学生
	 *            			2：学生向导师申请课题,其中content中保存课题id,pro_id
	 *             如果 kind 为真，表示获取未读私信
	 * @return {[type]}   [返回筛选的私信信息]
	 */
	getMessage : function(info,callback){
		var sql ;
		/* 收信 */
		if(info.send == 0){
			sql = `select * from contact_info where receiver_id=? and type=?`;
		}
		/* 发信 */
		else{
			sql = `select * from contact_info where sender_id=? and type=? `;			
		}

		// 按发布时间排序
		sql += ` ORDER BY status desc,publish_time DESC`;

		query(sql,[info.id,info.type],function(error,result){
			if(error){
				console.log("getMessage : "+error.message);
				return g_vars.ERROR;
			}
			callback(result);
		});
	},


	/**
	 * 获取一条私信详情，同时获取收发件人信息
	 *
	 * @param {[type]}   id       [私信id，]
	 * @param {[type]}   dir      [收信（0/1）发信]
	 */
	getOneMessage : (id,dir,callback)=>{
		var sql = `call getOneMessage(?,?)`;
			
		query(sql,[id,dir],(err,result)=>{
			if(err){
				console.log("get one message info err : "+err.message);
				return;
			}
			callback(result);
		});
		// })
	},

	/**
	 * 获取 任务书,开题报告, 外文翻译, 中期答辩, 论文(草稿) 详细信息 ：
	 * 因为此操作过程类似,且学生，导师都会用到,因此写成一个函数
	 *
	 * @param {[type]}   pro_id      [课题id]
	 * @param {[type]}   pro_process [过程]
	 *
	 */
	getDetail : function(pro_id,pro_process,callback){
		var sql;
		switch(pro_process){
			// 获取任务书详情
			case g_vars.PROCESS_TASK:
				sql = "select *,task_id as id from task_info where project_id=?";
				break;
			// 获取开题报告详情
			case g_vars.PROCESS_OPEN:
				sql = "select *,project_id as id from open_topic_info where project_id=?";
				break;
			// 获取外文翻译详情
			case g_vars.PROCESS_TRANSLATE:
				sql = `select *,project_id as id,original_path as file_path,translation_path as annex_path 
								from translate_info where project_id=?`;
				break;
			// 获取中期答辩详情
			case g_vars.PROCESS_MIDDLE:
				sql = "select *,project_id as id from middle_info where project_id=?";
				break;
			// 获取论文草稿详情
			case g_vars.PROCESS_DRAFT:
				sql = "select *,project_id as id from draft_info where project_id=?";
				break;
			// 获取论文详情
			case g_vars.PROCESS_PAPER:
				sql = "select *,project_id as id from paper_info where project_id=?";
				break;
			// 参数不正确,结束
			default:
				console.log("get detail -> process error");
				return;
		}
		
		query(sql,pro_id,function(error,result){
			if(error){
				console.log("getDetail : "+error.message);
				return g_vars.ERROR;
			}
			callback(result);
		});
	},




	/**
	 * 查看答辩组信息
	 *
	 * @param {[type]}   info  [pro_id/tutor_id]
	 *
	 * @return {[type]}   [返回答辩组所有学生信息，答辩组信息，及对应导师信息]
	 */
	showReplyGroup : function(info,callback){
		var sql,params;
		if(info.pro_id){
			/* 返回所在答辩组所有学生姓名，学号，答辩时间，地点等信息 */
			/*sql = `select stu_name,stu_num,pro_name,reply_order,reply_group_info.* 
								from student_info
								left join reply_group_info on group_id=? and reply_group_info.status=0 
								left join project_info on student_info.project_id=project_info.pro_id
								where pro_id=?
								order by student_info.reply_order`;*/
			// 获取答辩组信息 
			sql = `select * from reply_group_info where group_id in 
						(select group_id from reply_score_info where project_id=? group by(group_id))`;
			params = [info.pro_id];
		}
		else if(info.tutor_id){
			var nowYear = (new Date()).getFullYear();

			/*sql = `select stu_name,stu_num,pro_name,reply_order,reply_group_info.*
						from reply_score_info
						left join student_info on reply_score_info.stu_id=student_info.stu_id
						left join project_info on student_info.project_info.pro_id
						where reply_score_info.tutor_id=?
						order by student_info.reply_order`;*/
			sql = `select reply_group_info.* from reply_group_info,reply_score_info
						where reply_group_info.start_time>? and reply_group_info.group_id = reply_score_info.group_id
						and reply_score_info.tutor_id=?`;
			params = [nowYear,info.tutor_id];
		}else{
			console.log("params error");
			return;
		}


		query(sql,params,function(error,group_info){
			if(error){
				console.log("showReplyGroup : "+error.message);
				return;
			}
			if(group_info[0].group_id == null || group_info[0].group_id == undefined){
				console.log("do not get group_id ");
				return;
			}
			/* 获取所在答辩组导师信息 */
			sql = `select tutor_info.tutor_id,tutor_name from reply_score_info,tutor_info 
						where group_id=? and reply_score_info.tutor_id=tutor_info.tutor_id group by(tutor_info.tutor_id)`;
			params = [group_info[0].group_id];
			query(sql,params,function(error,tutor_info){
				if(error){
					console.log("showReplyGroup -- get tutor_info : "+error.message);
					return;
				}
				/* 获取所在答辩组所有学生信息 */
				if(info.tutor_id){
					sql = `select stu_name,stu_num,pro_name,pro_id,major_name 
					from student_info,project_info,reply_score_info,major_info
					where group_id=? and reply_score_info.project_id=student_info.project_id 
					and reply_score_info.project_id=project_info.pro_id 
					and stu_major=major_info.major_id
					group by(reply_score_info.project_id) order by(reply_score_info.score_id)`;
					query(sql,params,(error,stu_info)=>{
						if(error){
							console.log("showReplyGroup -- get stu_info : "+error.message);
							return;
						}
						callback(group_info,tutor_info,stu_info);
					});
				}
				else{
					callback(group_info,tutor_info,null);
				}
			})
		});
	},



	showAppraiseGroup : (info,callback)=>{
		var sql,params=[];
		if(info.pro_id){
			sql = `select appraise_group_info.*,tutor_name,tutor_num
							from appraise_info
							left join appraise_group_info on appraise_group_info.appraise_id = appraise_info.appraise_id
							left join tutor_info on tutor_info.tutor_id = appraise_group_info.tutor_id
							where appraise_info.project_id=?`;
			params = [info.pro_id];
		}else if(info.tutor_id){
			sql = `select * from appraise_group_info where tutor_id=?`;
			params = [info.tutor_id];
		}else{
			console.log("params error");
			return;
		}
		query(sql,params,(error,group_info)=>{
			if(error){
				console.log("get appraise group error : "+error.message);
				return;
			}
			console.log(group_info);
			if(info.tutor_id && group_info.length > 0){
				params = [group_info[0].appraise_id];
				sql = `select stu_name,stu_num,major_name,pro_id,pro_name,pro_type,pro_nature
							from appraise_info
							left join project_info on project_info.pro_id = appraise_info.project_id
							left join student_info on student_info.project_id = appraise_info.project_id
							left join major_info on major_info.major_id = student_info.stu_major
							where appraise_id=?`;
				query(sql,params,(err,stu_info)=>{
					if(err){
						console.log("get studnet info err : "+err.message);
					}
					callback(group_info,stu_info);
				});
			}
			else{
				callback(group_info,null);
			}
		});
	},

	/**
	 * 通过传入的导师id,获取所属学院的所有专业
	 */
	getMajor : (tutor_id,callback)=>{
		var sql = `select major_name as name,major_info.major_id as id
								from tutor_info,major_info
								where tutor_id=? and college_id=tutor_college and major_info.exist=1`;
		query(sql,[tutor_id],(error,result)=>{
			if(error){
				console.log("get major error : "+error.message);
				return;
			}
			callback(result);
		});
	},


	/**
	 * 通过关键字 获取用户信息 ：用户名，id 
	 *
	 * @param {[type]}   key      [关键字]
	 * @param {[type]}   identity [身份]
	 */
	getUserInfo : (key,identity,callback)=>{
		var sql;
		key = "%"+key+"%";
		if(identity == g_vars.ID_TUTOR){
			sql = `select stu_name as username,stu_id as id from student_info where stu_name like '${key}'`;
		}
		else if(identity == g_vars.ID_STUDENT){
			sql = `select tutor_name as username,tutor_id as id from tutor_info where tutor_name like '${key}'`;
		}
		else{
			console.log(" getUserInfo: identity error");
			callback([]);
			return;
		}
		query(sql,[key],(error,result)=>{
			if(error){
				console.log("getUserInfo query error : "+error.message);
				callback([]);
				return;
			}
			callback(result);
		});
	}
}