
var selection = window.location.pathname.replace("/", "");

if(document.getElementById(selection)){
	document.getElementById(selection).setAttribute("class", "active");    
}