function reader_open(aid){
	var w = document.documentElement.clientWidth || document.body.clientWidth;
	var h = document.documentElement.clientHeight || document.body.clientHeight;
	
	document.getElementById("reader_frame").src = "./view.html?row=" + aid;
	document.getElementById("reader_frame").width = w * 0.7 - 10 - 7;
	document.getElementById("reader_frame").height = h * 0.8 - 10 - 20;
	document.getElementById("reader_title").innerHTML = "文章ID: " + aid;
	document.getElementById("reader_backcover").style.display = "block";
	document.getElementById("reader_outbox").style.display = "block";
}

function reader_close(){
	document.getElementById("reader_backcover").style.display = "none";
	document.getElementById("reader_outbox").style.display = "none";
	document.getElementById("reader_frame").src = "./view.html?row=";
}

function writer_open(){
	var w = document.documentElement.clientWidth || document.body.clientWidth;
	var h = document.documentElement.clientHeight || document.body.clientHeight;
	
	document.getElementById("reader_backcover").style.display = "block";
	document.getElementById("reader_outbox").style.display = "block";
	document.getElementById("reader_frame").src = "./articledit.html?SB=SB";
	document.getElementById("reader_frame").width = w * 0.7 - 10 - 7;
	document.getElementById("reader_frame").height = h * 0.8 - 10 - 20;
	document.getElementById("reader_title").innerHTML = "创建文章(仅为展示,无发送功能)";
}