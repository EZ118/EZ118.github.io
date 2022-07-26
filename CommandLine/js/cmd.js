function $GET(i){
	let v = document.getElementById("SaveCommand").value + " undefined";
	return v.split(" ")[i];
}
function print(str) {
	document.getElementById("bd").innerHTML += str.replace(/ /gm, "&nbsp;").replace(/	/gm, "&nbsp;&nbsp;&nbsp;") + "<br>";
}
function ajax(url, func) {
	if (window.XMLHttpRequest) {xhttp = new XMLHttpRequest();}
	else {xhttp = new ActiveXObject("Microsoft.XMLHTTP");}
	
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			func(this.responseText);
		} else if (this.readyState == 4 && (this.status == 403 || this.status == 404 || this.status == 400)) {
			func("");
		}
	};
	xhttp.open("GET", url, true);
	xhttp.send(); 
}