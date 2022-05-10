function loadlist(device="pc") {
	var xhttp = new XMLHttpRequest();
	
	if (window.XMLHttpRequest) {xmlhttp = new XMLHttpRequest();}
	else {xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");}
	
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			var cnt = 0;
			var str = this.responseText;
			for(var i = 1; i <= str.length; i ++){if(str[i] == "\n") cnt ++}
			str = str.split("\n");
			
			
			for(var i = cnt; i >= 1; i --){
				var tmp = str[i];
				if(tmp == "") continue;
				tmp = tmp.split("\t");
				if(tmp.length < 4) continue;
				if(device=="pc"){
					document.getElementById("bd").innerHTML += '<table class="abody" onclick="reader_open(' + i + ');" align=left>\
						<tbody><tr>\
							<td width=50px><img src="./img/icon.png" style="border-radius:100%;height:40px;"></td>\
							<td>' + tmp[1] + '</td>\
							<td align=right colspan=2><i>' + tmp[4] + '</i></td>\
						</tr><tr>\
							<td colspan=2><b>' + tmp[2] +'</b></td>\
							<td></td>\
							<td width=20px><img src="./img/go.png" style="width:20px;"></td>\
						</tr></tbody></table>';
				} else {
					document.getElementById("bd").innerHTML += '<table class="abody" onclick="reader_open(' + i + ', \'mo\');" align=left>\
						<tbody><tr>\
							<td width=100px><img src="./img/icon.png" style="border-radius:100%;height:40px;"></td>\
							<td>' + tmp[1] + '</td>\
							<td align=right colspan=2><i>' + tmp[4] + '</i></td>\
						</tr><tr>\
							<td colspan=3><b>' + tmp[2] +'</b></td>\
						</tr></tbody></table>';
				}
				
			}
	   }
	};
	xhttp.open("GET", "info.txt", true);
	xhttp.send(); 
}

function $GET(name){
	var reg = new RegExp('(^|&)'+name+'=([^&]*)(&|$)', 'i');
	var r = window.location.search.substr(1).match(reg);
	if (r != null)
	{
		return unescape(r[2]);
	}
	return "";
}