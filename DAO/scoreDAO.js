/**
 * Created by cm on 2017/5/15
 */
var query = require("../helper/createMysqlPool");

// 全局变量
var g_vars = require("../helper/variable");

/* 评分 */

module.exports = {
	/**
	 * 答辩组导师修改学生答辩评分,并将总分写入最终成绩表中
	 *
	 * @param {[type]}   info     [pro_id,tutor_id,work_report,reply_score]
	 */
	updateReplyScore : function(info,callback){
		var sql,params;
		sql = `call setReplyScore(?,?,?,?)`;
		params = [info.pro_id,info.tutor_id,info.work_report,info.reply_score];
		query(sql,params,(error,result)=>{
			if(error){
				console.log("update reply_score : "+error.message);
				return;
			}
			callback(result);
		});
	},

	/**
	 * 导师获取学生答辩评分及学生、课题名称
	 *
	 * @param {[type]}   info     [pro_id,tutor_id]
	 */
	getReplyScore : (info,callback)=>{
		var sql , params;

		sql = `select stu_num,stu_name,pro_name,work_report,reply_status 
					from reply_score_info
					left join student_info on reply_score_info.project_id=student_info.project_id
					left join project_info on reply_score_info.project_id=project_info.pro_id
					where reply_score_info.project_id=? and tutor_id=?`;
		params = [info.pro_id,info.tutor_id];
		query(sql,params,(error,result)=>{
			if(error){
				console.log("tutor get reply_score : "+error.message);
				return;
			}
			callback(result);
		});
	},

	
	/**
	 * 填写项目评审成绩,并将总分写入最终成绩表中
	 *
	 * @param {[type]}   info     [pro_id,tutor_id ... ]
	 */
	updateAppraiseScore : (info,callback)=>{
		var sql,params;
		sql = `update appraise_info set paper_level=?,completion=?,quality=?,design=?,workload=?
						where project_id=? and tutor_id=?`;
		params = [info.paper_level,info.completion,info.quality,info.design,info.workload,info.pro_id,info.tutor_id];
		query(sql,params,(error,result)=>{
			if(error){
				console.log("update appraise info  : "+error.message);
				return;
			}
			var appraise = info.paper_level+info.completion+info.quality+info.design+info.workload;
			sql = `call setTotalScore(?,?,?,?)`;
			params = [pro_id,null,null,appraise,,null];
			query(sql,params,(err,back)=>{
				if(err){
					console.log("set total score : "+err.message);
					return;
				}
				callback(result);
			});
		});
	},


	/**
	 * 查看项目评审成绩及学生、课题名称
	 *
	 * @param {[type]}   pro_id   [description]
	 */
	getAppraiseScore : (pro_id , callback)=>{
		var sql = `select appraise_info.*,pro_id,pro_name,stu_name,stu_num
								from appraise_info
								left join student_info on student_info.project_id=appraise_info.project_id
								left join project_info on pro_id=appraise_info.project_id
								where appraise_info.project_id=?`;
		query(sql,[pro_id],(error,result)=>{
			if(error){
				console.log("get appraise score : "+error.message);
				return;
			}
			callback(result);
		});
	},

	

	/**
	 * 填写学生平时分,并将总分写入最终成绩表中
	 *
	 * @param {[type]}   info     [pro_id, ... ]
	 */
	updateUsualGrades : (info,callback)=>{
		var sql,params;
		sql = `call setUsualGrades(?,?,?,?)`;
		params = [info.pro_id,info.attitude,info.ablity,info.checking];
		query(sql,params,(error,result)=>{
			if(error){
				console.log("update usual grades : "+error.message);
				return;
			}
			callback(result);
		});
	},

	/**
	 * 查看学生平时成绩及学生、课题名称
	 *
	 * @param {[type]} pro_id [description]
	 *
	 */
	getUsualGrades : (pro_id,callback)=>{
		var sql = `select pro_id,pro_name,usual_grades_info.*,stu_name,stu_num
								from usual_grades_info
								left join student_info on student_info.project_id=usual_grades_info.project_id
								left join project_info on pro_id=usual_grades_info.project_id
								where usual_grades_info.project_id=?`;
		query(sql,[pro_id],(error,result)=>{
			if(error){
				console.log("get usual grades : "+error.message);
				return;
			}
			callback(result);
		});
	},


	/**
	 * 填写导师评分,并将总分写入最终成绩表中
	 *
	 * @param {[type]}   info     [pro_id, ... ]
	 */
	updateTutorScore : (info,callback)=>{
		var sql,params;
		sql = `call setTutorScore(?,?,?,?,?)`;
		params = [info.pro_id,info.completion,info.basic_status,info.application,info.paper_quality];
		query(sql,params,(error,result)=>{
			if(error){
				console.log("update tutor score : "+error.message);
				return;
			}
			callback(result);
		});
	},

	getTutorScore : (pro_id,callback)=>{
		var sql = `select pro_id,tutor_score_info.*,stu_name,stu_num
								from tutor_score_info
								left join student_info on student_info.project_id=tutor_score_info.project_id
								left join project_info on pro_id=tutor_score_info.project_id
								where tutor_score_info.project_id=?`;
		query(sql,[pro_id],(error,result)=>{
			if(error){
				console.log("get tutor score : "+error.message);
				return;
			}
			callback(result);
		});
	},


	/**
	 * 获取学生最终成绩
	 *
	 * @param {[type]}   pro_id   [description]
	 *
	 */
	getTotalScore : (pro_id,callback)=>{
		var sql = `select score_info.*,pro_id,pro_name,stu_name,stu_num
							 from score_info 
							 left join project_info on score_info.project_id=pro_id
							 left join student_info on student_info.project_id=score_info.project_id
							 where score_info.project_id=?`;
		query(sql,[pro_id],(error,result)=>{
			if(error){
				console.log("get total score : "+error.message);
				return;
			}
			callback(result);
		});
	},



	/**
	 * 获取  课题信息及学生信息
	 * 
	 * 返回课题名，pro_id，类型，性质; 学生名，学号
	 * 返回结果按 pro_id 升序排列
	 */
	getProList : (tutor_id,callback)=>{
		var sql ,params,nowYear;
		nowYear = (new Date()).getFullYear();
		sql = `select stu_name,stu_num,pro_id,pro_name,pro_type,pro_nature
					from project_info
					left join student_info on pro_id = student_info.project_id
					where publisher=? and publish_time>? and project_info.status=1`;
		params = [tutor_id,nowYear];

		query(sql,params,(error,result)=>{
			if(error){
				console.log("getList : "+error.message);
				return;
			}
			callback(result);
		});
	},


	/**
	 * 获取 学生总评成绩列表
	 * 课题信息、学生信息 以及 总评等级
	 * 返回课题名，pro_id，类型，性质; 学生名，学号
	 * 返回结果按 pro_id 升序排列
	 */
	getTotalList : (tutor_id,callback)=>{
		var sql ,params,nowYear;
		nowYear = (new Date()).getFullYear();
		sql = `select stu_name,stu_num,pro_id,pro_name,pro_type,pro_nature,score_info.*
					from project_info
					left join student_info on pro_id = student_info.project_id
					left join score_info on pro_id = score_info.project_id
					where publisher=? and publish_time>? and project_info.status=1`;
		params = [tutor_id,nowYear];

		query(sql,params,(error,result)=>{
			if(error){
				console.log("get Total List : "+error.message);
				return;
			}
			callback(result);
		});
	},

	/**
	 * 获取具体分数项
	 *
	 * @param {[type]}   pro_id   [description]
	 * @param {[type]}   type   	[0:平时成绩; 1:导师成绩;
	 *                           	 2:审评成绩; 3:答辩成绩]
	 * 
	 */
	getScoreDetail : (pro_id,type,callback)=>{
		var sql;
		/* 答辩分数 */
		if(type == 3){
			sql = `select work_report as part1,reply_status as part2,tutor_name as part3 
						from reply_score_info,tutor_info
						where reply_score_info.tutor_id=tutor_info.tutor_id and project_id=?`;
		}
		/* 导师评分 */
		else if(type == 1){
			sql = `select completion as part1,basic_status as part2,application as part3,paper_quality as part4
						 from tutor_score_info where project_id =?`;
		}
		/* 评审成绩 */
		else if(type == 2){
			sql = `select paper_level as part1,completion as part2,quality as part3,design as part4,workload as part5
						 from appraise_info where project_id =?`;
		}
		/* 平时成绩 */
		else{
			sql = `select attitude as part1,ablity as part2,checking as part3
						from usual_grades_info where project_id =?`;
		}
		query(sql,[pro_id],(error,result)=>{
			if(error){
				console.log("get score detail : "+error.message);
				return;
			}
			callback(result);
		});
	},


	/**
	 * 获取分数列表
	 *
	 * @param {[type]}   tutor_id [description]
	 * @param {[type]}   type     [0:平时成绩; 1:导师成绩;
	 *                           	 2:审评成绩; 3:答辩成绩]
	 */
	getScoreList : (tutor_id,type,callback)=>{
		var table_name;
		if(type == 0){
			table_name = "usual_grades_info";
		}else if(type == 1){
			table_name = "tutor_score_info";
		}else if(type == 2){
			table_name = "appraise_info";
		}else{
			table_name = "reply_score_info";
		}
		var sql = `select * from ${table_name} where project_id in 
								(select pro_id from project_info where publisher=?) `;
		query(sql,[tutor_id],(error,result)=>{
			if(error){
				console.log("get score list : "+ error.message);
				return;
			}
			callback(result);
		});
	},


	/**
	 * 获取学生评价列表
	 *
	 * @param {[type]}   tutor_id [description]
	 */
	getCommentsList:(tutor_id,callback)=>{
		var sql ,params,nowYear;
		nowYear = (new Date()).getFullYear();
		sql = `select *	from project_info 
					where publisher=? and publish_time>? and status=1`;
		params = [tutor_id,nowYear];

		query(sql,params,(error,result)=>{
			if(error){
				console.log("get comments List : "+error.message);
				return;
			}
			callback(result);
		});
	},

	getComment : (pro_id,callback)=>{
		var sql = `select * from project_info where pro_id=?`;
		query(sql,[pro_id],(error,result)=>{
			if(error){
				console.log("get comments : "+error.message);
				return;
			}
			callback(result);
		});
	},

	/* 更新学生对教师的评价 */
	updateComment : (info,callback)=>{
		var sql = `update project_info set comments=? where pro_id=?`;
		query(sql,[info.comments,info.pro_id],(error,result)=>{
			if(error){
				console.log("update comment : " +error.message);
				return;
			}
			callback(result);
		});
	}
}