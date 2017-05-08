/**
 * Created by cm on 2017/4/15
 */
var query = require("../helper/createMysqlPool");
// 全局变量
var g_vars = require("../helper/variable");

/* 获取当前时间戳 */
getTime = ()=>{
		var now = new Date();
		return now.getFullYear()
					+ "-" + (now.getMonth()+1)
					+ "-" + (now.getDate())
					+ " " + (now.getHours())
					+ " " + (now.getMinutes())
					+ " " + (now.getSeconds());
	}

module.exports = {
	
	/**
	 * 进入选题界面,显示所有可选课题
	 *
	 * @param stu_major [学生专业id , from session or localStorage]
	 *
	 * @return [查询结果: 所有可选课题信息]
	 */
	showAllPro : function(stu_id,stu_major,callback){
		// console.log("stu_major = "+stu_major);
		var sql = `select project_info.*,tutor_name,choose_pro_info.status as apply_status 
							from tutor_info,project_info 
							left join choose_pro_info on project_info.pro_id=choose_pro_info.pro_id and choose_pro_info.stu_id=? 
							where project_info.major_id=? and project_info.publish_time>? and publisher=tutor_info.tutor_id`;
		var nowYear = (new Date()).getFullYear();

		query(sql,[stu_id,stu_major,nowYear],function(error,result){
			if(error){
				console.log("showAllPro : "+error.message);
				return g_vars.ERROR;
			}
			// console.log("in showAllPro sql : ");
			// console.dir(result);
			callback(result);
		})
	},

	/**
	 * [学生选课,给导师发私信]
	 *
	 *  user_info [学生id,	学号,    学生名,	  学生专业名]
	 *  					 stu_id,	stu_num, stu_name,	major_name
	 *  pro_info  [课题id, 	课题名, 	导师id]
	 *  						pro_id, pro_name,	tutor_id
	 * @return  [写入数据库结果: 成功:数组; 失败:undefined]
	 */
	choosePro : function(user_info,pro_info,callback){
		// 从学号中获取入学年份
		var num = user_info.stu_num.substring(0,2);
		// 学生信息：例 13软件工程xx(学号)
		var title =num + user_info.major_name + user_info.stu_name + "("+ user_info.stu_num +") 申请您的课题："+pro_info.pro_name;
		console.log("title = " +title);
		var sql = "insert into choose_pro_info(cho_id,stu_id,tutor_id,pro_id,title,status) values(null,?,?,?,?,0)";
		var params = [user_info.stu_id,pro_info.tutor_id,pro_info.pro_id,title];
		query(sql,params,function(error,result){
			if(error){
				console.log("add choose_pro error : "+error.message);
				return g_vars.ERROR;
			}
			callback(result);
		});
	},

	/**
	 * 查看选题结果
	 *
	 * @param  pro_id  [课题id from session or localStorage]
	 *
	 * @return [返回课题信息，导师信息，课题状态]
	 */
	showChoosePro : function(pro_id,callback){
		 var sql = `select project_info.*, tutor_name from project_info,tutor_info where pro_id=? and publisher = tutor_id`;
		 query(sql,[pro_id], function(error,result){
		 	if(error){
				console.log("showChoosePro : "+error.message);
				return g_vars.ERROR;
			}
			callback(result);
		 })
	},


	/**
	 * 上传任务书 并在提交信息表中添加新数据
	 *
	 * @param {[obj]} info [学生信息,课题信息,输入内容,文件名及路径]
	 *
	 * @return [写入成功/失败]
	 */
	uploadTask : function(info, callback){
		var sql, params;
		if(info.id == undefined || info.id == null){
			sql = "insert into task_info(task_id,project_id,tutor_id,task_aims,task_works,task_process,task_reference,status,file_path) values(null,?,?,?,?,?,?,?,?)";
			params = [info.pro_id,info.tutor_id,info.aims,info.works,info.process,info.reference,0,info.file_path];
		}
		else{
			var now = getTime();
			sql = "update task_info set status=0,publish_time=?,task_aims=?,task_works=?,task_process=?,task_reference=?";
			
			params = [now,info.aims,info.works,info.process,info.reference];
			
			if(info.file_path != null || info.file_path != undefined){
				sql += ",file_path=? ";
				params.push(info.file_path);
			}
			
			sql += "  where task_id = ?";
			params.push(info.id);
		}
		query(sql,params,function(error,result){
			if(error){
				console.log("uploadTask : "+error.message);
				return g_vars.ERROR;
			}
			callback(result);
		})
	},

	/**
	 * 查看任务书
	 *
	 * @param  pro_id   [毕设课题id,from session or localStorage]
	 *
	 * @return {[type]}   [返回任务书状态及毕设课题基本信息]
	 */
	showTask : function(pro_id,callback){
		var sql = "select status from task_info where project_id=?";

		query(sql,[pro_id],function(error,result){
			if(error){
				console.log("showTask : "+error.message);
				return g_vars.ERROR;
			}
			callback(result);
		})
	},



	/**
	 * 上传开题报告，并在提交信息表中添加新数据
	 *
	 * @param {[type]}   info  [学生信息,课题信息,输入内容,文件名及路径]
	 *
	 * @return {[type]}   [写入成功/失败]
	 */
	uploadOpenTopic : function(info,callback){
		var sql, params;
		if(info.id == undefined || info.id == null){
			//(topic_id,project_id,tutor_id,meaning,problem,research_content,methods,file_path,comments,status,publish_time)
			sql = `insert into open_topic_info(topic_id,project_id,tutor_id,meaning,problem,research_content,methods,file_path,status)
						 values(null,?,?,?,?,?,?,?,0)`;
			params =  [info.pro_id,info.tutor_id,info.meaning,info.problem,info.research_content,
										info.methods,info.file_path];
		}
		else{
			var now = getTime();
			sql = "update open_topic_info set status=0,publish_time=?,meaning=?,problem=?,research_content=?,methods=?";
			params = [now,info.meaning,info.problem,info.research_content,info.methods];
			if(info.file_path != null || info.file_path != undefined){
				sql += ",file_path=? ";
				params.push(info.file_path);
			}
			sql += " where topic_id=?";
			params.push(info.id);
		}
		query(sql,params,function(error,result){
			if(error){
				console.log("uploadOpenTopic : "+error.message);
				return g_vars.ERROR;
			}
			callback(result);
		});
	},

	/**
	 * 查看开题报告，返回开题报告审核状态
	 *
	 * @param  pro_id  [课题id]
	 *
	 * @return  [返回开题报告状态]
	 */
	showOpenTopic : function(pro_id,callback){
		var sql = "select status from open_topic_info where project_id=?";
		query(sql,[pro_id],function(error,result){
			if(error){
				console.log("showOpenTopic : "+error.message);
				return g_vars.ERROR;
			}
			callback(result);
		})
	},




	/**
	 * 上传外文翻译
	 *
	 * @param {[type]}   info  [学生信息,导师信息,课题信息,文件上传路径]
	 *
	 * @return {[type]}   [返回写出成功/失败]
	 */
	uploadTranslate : function(info,callback){
		var sql , params;
		// 首次提交,插入
		if(info.id == undefined || info.id == null){
			// (trans_id, project_id, tutor_id, original_path, translation_path, status, comments)
			sql = "insert into translate_info values(null,?,?,?,?,0,null)";
			params = [info.pro_id,info.tutor_id,info.file_path,info.annex_path];
		}

		else{
			sql = "update translate_info set status=0";
			// sql = "update translate_info set status=0,original_path=?,translation_path=? where trans_id=?";
			params = [];
			if(info.file_path != undefined || info.file_path != null){
				sql += ",original_path=?";
				params.push(info.file_path);
			}
			if(info.annex_path != undefined || info.annex_path != null){
				sql += ",translation_path=?";
				params.push(info.annex_path);
			}
			sql += " where trans_id=?";
			params.push(info.id);
		}
		query(sql,params,function(error,result){
			if(error){
				console.log("uploadTranslate : "+error.message);
				return g_vars.ERROR;
			}
			callback(result);
			// this.insertSubmit(info,g_vars.PROCESS_TRANSLATE,callback);
		});
	},

	/**
	 * 查看外文翻译审核状态
	 *
	 * @param {[type]}   pro_id   [课题id]
	 *
	 * @return {[type]}   [返回审核状态]
	 */
	showTranslate : function(pro_id,callback){
		var sql = "select status from translate_info where project_id=?";
		query(sql,[pro_id],function(error,result){
			if(error){
				console.log("showTranslate : "+ error.message);
				return g_vars.ERROR;
			}
			callback(result);
		});
	},
	
	


	/**
	 * (重新)上传中期答辩内容
	 *
	 * @param {[type]}   info   [导师信息,课题信息,中期答辩填写信息]
	 *
	 * @return {[type]}   [返回写入成功/失败]
	 */
	uploadMiddle : function(info,callback){
		var sql , params;
		// 首次提交,插入
		if(info.id == undefined || info.id == null){
			// (mid_id,project_id,tutor_id,plan,finished,problem,file_path,status,comments,publish_time)
			sql = `insert into middle_info(project_id,tutor_id,plan,finished,problem,file_path,status)
						 values(?,?,?,?,?,?,0)`;
			params = [info.pro_id,info.tutor_id,info.plan,info.finished,info.problem,info.file_path];
		}
		// 重新上传,更新
		else{
			var now = getTime();
			sql = "update middle_info set status=0,publish_time=?,plan=?,finished=?,problem=?";
			params = [now,info.plan,info.finished,info.problem];
			if(info.file_path != undefined || info.file_path != null){
				sql += ",file_path=?";
				params.push(info.file_path);
			}
			sql += "  where mid_id=?";
			params.push(info.id);
		}
		
		query(sql,params,function(error,result){
			if(error){
				console.log("uploadMiddle : "+error.message);
				return g_vars.ERROR;
			}
			callback(result);
		});
	},

	/**
	 * 查看中期检查审核状态
	 *
	 * @param {[type]}   pro_id   [课题id]
	 * 
	 * @return {[type]}   [返回审核状态]
	 */
	showMiddle : function(pro_id,callback){
		var sql = "select status from middle_info where project_id=?";
		query(sql,[pro_id],function(error,result){
			if(error){
				console.log("showMiddle : "+error.message);
				return g_vars.ERROR;
			}
			callback(result);
		});
	},



	/**
	 * 上传论文草稿
	 * 
	 * @param {[obj]}   info  [课题id,上传状态(首次提交/多次提交),文件路径]
	 * 上传状态 来自数据库中查到的状态
	 * 首次提交 ： draft_id  = NULL/undefined,
	 * 再次提交 ：  <== 上次提交被导师否决
	 *
	 * @return {[type]}   [写入成功/失败]
	 */
	uploadDraft : function(info,callback){
		var sql, params;
		if(info.id == null || info.id == undefined){
			// (paper_id,project_id,file_path,annex_path,status,comments,publish_time)
			sql = `insert into draft_info(project_id,file_path,annex_path,status)
						 values(?,?,?,0)`;
			params = [info.pro_id,info.file_path,info.annex_path];
		}
		else{
			var now = getTime();
			// sql = "update draft_info set status=0,publish_time=?,file_path=?,annex_path=? where draft_id=?";
			sql = "update draft_info set status=0,publish_time=?";
			params = [now];
			if(info.file_path != undefined || info.file_path != null){
				sql += ",file_path=?";
				params.push(info.file_path);
			}
			if(info.annex_path != undefined || info.annex_path != null){
				sql += ",annex_path=?";
				params.push(info.annex_path);
			}
			sql += " where draft_id=?";
			params.push(info.id);
		}
		query(sql,params,function(error,result){
			if(error){
				console.log("uploadDraft : "+error.message);
				return g_vars.ERROR;
			}
			callback(result);
		});
	},

	/**
	 * 查看论文草稿上传状态
	 *
	 * @param  pro_id   [课题id]
	 *
	 * @return   [返回审核状态]
	 */
	showDraft : function(pro_id,callback){
		var sql = "select status from draft_info where project_id=?";
		query(sql,[pro_id],function(error,result){
			if(error){
				console.log("showDraft : "+error.message);
				return g_vars.ERROR;
			}
			callback(result);
		});
	},



/**
	 * 上传论文正稿 
	 * 
	 * @param {[obj]}   info  [课题id,文件路径,类型(论文/草稿)]
	 *
	 * @return {[type]}   [写入成功/失败]
	 */
	uploadPaper : function(info,callback){
		var sql, params;
		if(info.id == null || info.id == undefined){
			// (paper_id,project_id,file_path,annex_path,status,comments,publish_time)
			sql = "insert into paper_info values(null,?,?,?,null,null)";
			params = [info.pro_id,info.file_path,info.annex_path];
		}
		else{
			var now = getTime();
			sql = "update paper_info set status=0,publish_time=?,file_path=?,annex_path=? where paper_id=?";
			params = [now];
			if(info.file_path != undefined || info.file_path != null){
				sql += ",file_path=?";
				params.push(info.file_path);
			}
			if(info.annex_path != undefined || info.annex_path != null){
				sql += ",annex_path=?";
				params.push(info.annex_path);
			}
			sql += " where paper_id=?";
			params.push(info.id);
		}
		query(sql,params,function(error,result){
			if(error){
				console.log("uploadPaper : "+error.message);
				return g_vars.ERROR;
			}
			callback(result);
		});
	},

	/**
	 * 查看毕业论文上传状态
	 *
	 * @param  pro_id  [课题id]
	 *
	 * @return   [返回审核状态]
	 */
	showPaper : function(pro_id,callback){
		var sql = "select status from paper_info where project_id=?";
		query(sql,[pro_id],function(error,result){
			if(error){
				console.log("showPaper : "+error.message);
				return g_vars.ERROR;
			}
			callback(result);
		});
	},



	/**
	 * 获取学生对导师的评价
	 *
	 * @param {[type]}   stu_id   [description]
	 *
	 * @return {[type]}   [description]
	 */
	showComments : function(stu_id,callback){
		var nowYear = (new Date()).getFullYear(),
				sql = `select tutor_name,score from reply_score_info,tutor_info
							where stu_id=? and reply_score_info.tutor_id=tutor_info.tutor_id
							and publish_time>?`,
				params = [stu_id,nowYear];
		query(sql,params,(error,score_info)=>{
			if(error){
				console.log("showComments score "+ error.message);
				return g_vars.ERROR;
			}
			if(score_info[0].score != NULL){
				sql = `select comments from student_info where stu_id=?`;
				params = [stu_id];
				query(sql,params,(error,result)=>{
					if(error){
						console.log("showComments comments " + error.message);
						return g_vars.ERROR;
					}
					callback(score_info,comments);
				})
			}
			else{
				callback(score_info);
			}
		});
	},


	/**
	 * 上传评价
	 *
	 * @param {[type]}   info     [stu_id/comments]
	 *
	 */
	uploadComments : function(info,callback){
		
	}
}