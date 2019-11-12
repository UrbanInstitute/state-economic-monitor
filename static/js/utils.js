function getOS() {
  var userAgent = window.navigator.userAgent,
      platform = window.navigator.platform,
      macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'],
      windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'],
      iosPlatforms = ['iPhone', 'iPad', 'iPod'],
      os = null;

  if (macosPlatforms.indexOf(platform) !== -1) {
    os = 'Mac OS';
  } else if (iosPlatforms.indexOf(platform) !== -1) {
    os = 'iOS';
  } else if (windowsPlatforms.indexOf(platform) !== -1) {
    os = 'Windows';
  } else if (/Android/.test(userAgent)) {
    os = 'Android';
  } else if (!os && /Linux/.test(platform)) {
    os = 'Linux';
  }

  return os;
}

function IS_IE() {

    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE ");

    if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./))  // If Internet Explorer, return version number
    {
        // return parseInt(ua.substring(msie + 5, ua.indexOf(".", msie)));
        return true;
    }
    else  // If another browser, return 0
    {
        // alert('otherbrowser');
        return false;
    }

    return false;
}

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
function widthUnder(w){
  return d3.select(".widthTester.w" + w).style("display") == "block"
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





// The download function takes a CSV string, the filename and mimeType as parameters
// Scroll/look down at the bottom of this snippet to see how download is called
function downloadDataFile(content, fileName, mimeType) {
  var a = document.createElement('a');
  mimeType = mimeType || 'application/octet-stream';

  if (navigator.msSaveBlob) { // IE10
    navigator.msSaveBlob(new Blob([content], {
      type: mimeType
    }), fileName);
  } else if (URL && 'download' in a) { //html5 A[download]
    a.href = URL.createObjectURL(new Blob([content], {
      type: mimeType
    }));
    a.setAttribute('download', fileName);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } else {
    location.href = 'data:application/octet-stream,' + encodeURIComponent(content); // only this mime type is supported
  }

}




function downloadZipFile(slugs){
  var zip = new JSZip();
  var a = document.querySelector("a");
  var unflatUrls = slugs
    .map(function(s){
      if(s == "unemployment_rate"){
        return ["static/data/csv/" + s + "_raw.csv"]
      }else{
        return ["static/data/csv/" + s + "_raw_in_thousands.csv", "static/data/csv/" + s + "_yoy_percent_change.csv"]
      }
    })
  
  var urls = [].concat.apply([], unflatUrls);
  urls.push("static/data/dictionaries/sem_employment_data_dictionary.txt")


  function request(url) {
    return new Promise(function(resolve) {
      var httpRequest = new XMLHttpRequest();
      httpRequest.open("GET", url);
      httpRequest.onload = function() {
        var filename = url.replace(/.*\//g, "");
        var responseText = (getOS() == "Windows") ? this.responseText.replace(/\n/g,'\r\n') : this.responseText
        zip.file(filename, responseText, { binary: true, createFolders: true, binary: true });
        resolve()
      }
      httpRequest.send()
    })
  }

  Promise.all(urls.map(function(url) {
    return request(url)
  }))
  .then(function() {
  zip.generateAsync({
  type: "blob"
  })
  .then(function(blob) {

    saveAs(blob, "employment_select_indicators.zip");
  });
  })
}

//clipboard functions from https://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript
function fallbackCopyTextToClipboard(text) {
  var textArea = document.createElement("textarea");
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    var successful = document.execCommand('copy');
    var msg = successful ? 'successful' : 'unsuccessful';
    console.log('Fallback: Copying text command was ' + msg);
  } catch (err) {
    console.error('Fallback: Oops, unable to copy', err);
  }

  document.body.removeChild(textArea);
}
function copyTextToClipboard(text) {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text);
    return;
  }
  navigator.clipboard.writeText(text).then(function() {
    console.log('Async: Copying to clipboard was successful!');
  }, function(err) {
    console.error('Async: Could not copy text: ', err);
  });
}
