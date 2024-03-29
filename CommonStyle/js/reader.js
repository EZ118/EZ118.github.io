﻿function reader_open(aid, device){
	var w = document.documentElement.clientWidth || document.body.clientWidth;
	var h = document.documentElement.clientHeight || document.body.clientHeight;
	
	
	
	if(device=="pc"){
		document.getElementById("reader_frame").src = "./view.html?row=" + aid + "&device=pc";
		document.getElementById("reader_frame").width = w * 0.7 - 10 - 7;
		document.getElementById("reader_frame").height = h * 0.55 - 10 - 20;
	} else {
		document.getElementById("reader_frame").src = "./view.html?row=" + aid + "&device=mo";
		document.getElementById("reader_frame").width = w;
		document.getElementById("reader_frame").height = h;
	}
	
	document.getElementById("reader_title").innerHTML = "文章ID: " + aid;
	document.getElementById("reader_backcover").setAttribute("style", "animation:BC_On .3s;display:block;");
	document.getElementById("reader_outbox").style.display = "block";
}

function reader_close(){
	document.getElementById("reader_backcover").setAttribute("style", "animation:BC_OFF .5s;display:block;");
	
	document.getElementById("reader_outbox").style.display = "none";
	document.getElementById("reader_frame").src = "./view.html?row=";
	
	setTimeout(function() {
		document.getElementById("reader_backcover").setAttribute("style", "display:none;");
	}, 400);
}

function writer_open(device){
	var w = document.documentElement.clientWidth || document.body.clientWidth;
	var h = document.documentElement.clientHeight || document.body.clientHeight;
	
	document.getElementById("reader_backcover").setAttribute("style", "animation:BC_On .5s;display:block;");
	document.getElementById("reader_outbox").style.display = "block";
	document.getElementById("reader_frame").src = "./articledit.html?SB=SB";
	
	if(device=="pc"){
		document.getElementById("reader_frame").width = w * 0.7 - 10 - 7;
		document.getElementById("reader_frame").height = h * 0.55 - 10 - 20;
	} else {
		document.getElementById("reader_frame").width = w;
		document.getElementById("reader_frame").height = h;
	}
	
	document.getElementById("reader_title").innerHTML = "创建文章(仅为展示,无发送功能)";
}