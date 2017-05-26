var express = require("express");
var router 	= express.Router();

var tutorDAO 	= require("../DAO/tutorDAO");
var publicDAO = require("../DAO/publicDAO");

var publicFun = require("./publicFun");

var g_vars 		=	require("../helper/variable");


/* 公共功能，包括修改信息，私信等 */


/* 默认进入私信收信列表界面 */
router.get("/",(req,res)=>{

});

router.get("/");

module.exports=router;