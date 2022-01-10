var time1 = new Date().getTime() + 1000;
var flag = 0;

function pluszero(num) {if (num < 10) return '0' + num;else return num;} 
function minus(num) {if (num == 0) return 1;else return 0;}
function pause(obj) {
	if(obj.innerHTML == "Pause") {
		obj.innerHTML = "Continue";
		flag = 1;
	} else {
		obj.innerHTML = "Pause";
		flag = 0;
	}
}

var set_time_minute = 5;
var set_time_second = 0;

function daojishi(){	
	if(flag == 1) return;
	
	var time2 = new Date().getTime();
	console.log(time1);
	var cha = time2 - time1;
	//var lasthours = Math.floor(cha/(1000*60*60));
	var lastminutes = Math.floor(cha / (1000 * 60) % 60);
	var lastseconds = Math.floor(cha / 1000 % 60 % 60);
	
	lastseconds = pluszero(60 - lastseconds - 1);
	lastminutes = pluszero(set_time_minute - 1 - lastminutes - minus(lastseconds));
	//lasthours = pluszero(set_time_hour - lasthours);
	
	//var output = lasthours+' : '+lastminutes+' : '+lastseconds;
	var output = lastminutes + ' : ' + lastseconds;
	document.getElementById("time_show").innerHTML = output;
	
	if(output == "0-1 : 00") {
		document.getElementById("time_show").innerHTML = "00 : 00";
		alert("泡面泡好啦！");
		flag = 1;
	}
}
var time = setInterval(daojishi,1000);