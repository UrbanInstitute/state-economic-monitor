function getQueryString(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};
function getDateString(month, year){
	var pad = (+month < 10) ? "0" + month : month
	return moment(year + "-" + pad + "-01" , defaultDateFormat, true).format(defaultDateFormat)
}
function parseTime(){
	return d3.timeParse(d3DateFormat);
}