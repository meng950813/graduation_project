var express = require('express');
var router = express.Router();

var fs = require("fs");

// var upload = require("./multerUtil").single('file'); 
var multer = require("multer");
var upload = multer({dest : "upload_files/"}),
		uploadAnnex = multer({
			dest : "upload_files/annex/"
		}); 


// router.post("/",upload.single('upload_file'),(req,res)=>{

// 	// 没有附带文件
//   if (!req.file) {
//     res.json({ ok: false });
//     return;
//   }

//   // 输出文件信息
//   // console.log('====================================================');
//   // console.log('fieldname: ' + req.file.fieldname);
//   // console.log('originalname: ' + req.file.originalname);
//   // console.log('encoding: ' + req.file.encoding);
//   // console.log('mimetype: ' + req.file.mimetype);
//   // console.log('size: ' + (req.file.size / 1024).toFixed(2) + 'KB');
//   // console.log('destination: ' + req.file.destination);
//   // console.log('filename: ' + req.file.filename);
//   console.log('path: ' + req.file.path);

//   var file_name = getTime()+req.file.originalname,
//       newPath   = "./upload_files/"+file_name;
//   fs.rename(req.file.filename,file_name,(err)=>{
//   	if(err){
//   		res.json({ ok: false, discription:"重命名失败" });
//   	}
//   	else{
//   		// 返回文件路径
// 			res.json({ ok: true, path:file_name});  		
//   	}
//   })

// });



/* 下载文件，get传值，传入文件路径 */
router.get("/",(req,res)=>{
   // publicFun.hasLogin(req,res);

  var path = "upload_files/"+req.body.name;

//   var path = "upload_files/"+req.query.name;
  console.log("path : "+path);
    var file_name = req.query.name;
    res.download(path,file_name);
});

// // 上传附件
// router.post("/annex",uploadAnnex.single('upload_file'),(req,res)=>{
// 	// 没有附带文件
//   if (!req.file) {
//     res.json({ ok: false });
//     return;
//   }

//   var newPath = "upload_files/annex/"+changeName(req.file.originalname);
//   fs.rename(req.file.path,newPath,(err)=>{
//   	if(err){
//   		res.json({ ok: false, discription:"重命名失败" });
//   	}
//   	else{
// 			res.json({ ok: true, path:newPath});  		
//   	}
//   })

// 	res.json({ ok: true,path:req.file.path});
// })

// 获取当前时间戳
function getTime(){
	return (new Date()).getTime()+"__";
}

module.exports = router;