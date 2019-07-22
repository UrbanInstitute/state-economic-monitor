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
function abbrevFormat(d){
  if(d >= 1000) return d3.format(".2s")(d).replace("G","B")
  else return d 
}


if (!Array.prototype.fill) {
  Object.defineProperty(Array.prototype, 'fill', {
    value: function(value) {

      // Steps 1-2.
      if (this == null) {
        throw new TypeError('this is null or not defined');
      }

      var O = Object(this);

      // Steps 3-5.
      var len = O.length >>> 0;

      // Steps 6-7.
      var start = arguments[1];
      var relativeStart = start >> 0;

      // Step 8.
      var k = relativeStart < 0 ?
        Math.max(len + relativeStart, 0) :
        Math.min(relativeStart, len);

      // Steps 9-10.
      var end = arguments[2];
      var relativeEnd = end === undefined ?
        len : end >> 0;

      // Step 11.
      var final = relativeEnd < 0 ?
        Math.max(len + relativeEnd, 0) :
        Math.min(relativeEnd, len);

      // Step 12.
      while (k < final) {
        O[k] = value;
        k++;
      }

      // Step 13.
      return O;
    }
  });
}

//social share 
function betterEncodeURIComponent(str) {
    str = encodeURIComponent(str);
    return str.replace(/'/gi, "%27");
}

function amperoctoplus(s) {
    s = s.replace(/&/g, '%26');
    s = s.replace(/#/g, '%23');
    s = s.replace(/\+/g, '%2B');
    s = s.replace(/@/g, '%40');
    s = s.replace(/:/g, '%3A');
    return s;
}
function getTwitterShare(url, blurb) {
    return "https://twitter.com/intent/tweet?text=" + betterEncodeURIComponent(blurb + " " + url);
}
function getFacebookShare(url) {
    return "https://www.facebook.com/sharer/sharer.php?u=" + amperoctoplus(encodeURI(url));
}