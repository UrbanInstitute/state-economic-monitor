;window.Modernizr=function(a,b,c){function v(a){i.cssText=a}function w(a,b){return v(prefixes.join(a+";")+(b||""))}function x(a,b){return typeof a===b}function y(a,b){return!!~(""+a).indexOf(b)}function z(a,b,d){for(var e in a){var f=b[a[e]];if(f!==c)return d===!1?a[e]:x(f,"function")?f.bind(d||b):f}return!1}var d="2.8.3",e={},f=b.documentElement,g="modernizr",h=b.createElement(g),i=h.style,j,k={}.toString,l={},m={},n={},o=[],p=o.slice,q,r=function(a,c,d,e){var h,i,j,k,l=b.createElement("div"),m=b.body,n=m||b.createElement("body");if(parseInt(d,10))while(d--)j=b.createElement("div"),j.id=e?e[d]:g+(d+1),l.appendChild(j);return h=["&#173;",'<style id="s',g,'">',a,"</style>"].join(""),l.id=g,(m?l:n).innerHTML+=h,n.appendChild(l),m||(n.style.background="",n.style.overflow="hidden",k=f.style.overflow,f.style.overflow="hidden",f.appendChild(n)),i=c(l,a),m?l.parentNode.removeChild(l):(n.parentNode.removeChild(n),f.style.overflow=k),!!i},s=function(b){var c=a.matchMedia||a.msMatchMedia;if(c)return c(b)&&c(b).matches||!1;var d;return r("@media "+b+" { #"+g+" { position: absolute; } }",function(b){d=(a.getComputedStyle?getComputedStyle(b,null):b.currentStyle)["position"]=="absolute"}),d},t={}.hasOwnProperty,u;!x(t,"undefined")&&!x(t.call,"undefined")?u=function(a,b){return t.call(a,b)}:u=function(a,b){return b in a&&x(a.constructor.prototype[b],"undefined")},Function.prototype.bind||(Function.prototype.bind=function(b){var c=this;if(typeof c!="function")throw new TypeError;var d=p.call(arguments,1),e=function(){if(this instanceof e){var a=function(){};a.prototype=c.prototype;var f=new a,g=c.apply(f,d.concat(p.call(arguments)));return Object(g)===g?g:f}return c.apply(b,d.concat(p.call(arguments)))};return e});for(var A in l)u(l,A)&&(q=A.toLowerCase(),e[q]=l[A](),o.push((e[q]?"":"no-")+q));return e.addTest=function(a,b){if(typeof a=="object")for(var d in a)u(a,d)&&e.addTest(d,a[d]);else{a=a.toLowerCase();if(e[a]!==c)return e;b=typeof b=="function"?b():b,typeof enableClasses!="undefined"&&enableClasses&&(f.className+=" "+(b?"":"no-")+a),e[a]=b}return e},v(""),h=j=null,e._version=d,e.mq=s,e.testStyles=r,e}(this,this.document);
function detectIE() {
    var ua = window.navigator.userAgent;

    var msie = ua.indexOf('MSIE ');
    if (msie > 0) {
        // IE 10 or older => return version number
        return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
    }

    var trident = ua.indexOf('Trident/');
    if (trident > 0) {
        // IE 11 => return version number
        var rv = ua.indexOf('rv:');
        return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
    }

    var edge = ua.indexOf('Edge/');
    if (edge > 0) {
       // IE 12 => return version number
       return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
    }

    // other browser
    return false;
}
var isIE = detectIE();

var SMALL_SCREEN;
var MOBILE;
var MONTHNAMES = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
    ]
var QUARTERNAMES = ["first quarter", "first quarter", "first quarter", "second quarter", "second quarter", "second quarter", "third quarter", "third quarter", "third quarter", "fourth quarter", "fourth quarter", "fourth quarter"]
var QUARTERLY = ["housing_historical"]
var PRINT_WIDTH = 650;
var PRINT_BAR_HEIGHT = 200;

var dispatch = d3.dispatch("clickState", "hoverState", "deHover", "refresh", "menuDate");

dispatch.on("hoverState", function(state, dataID){
  // console.log(state, dataID)
})

function drawGraphic(dataID){
    print = false;

    var $graphic = $("#"+dataID);
    $graphic.find("svg").remove()

    var aspect_width = 2;
    var aspect_height;
    if(SMALL_SCREEN){
      aspect_height = 1.2;
    }else{ aspect_height = 1; }
    
    var margin = { top: 30, right: 40, bottom: 40, left: 40 };
    // var width = $graphic.width() - margin.left - margin.right;
    var width;
    if (!print) { width = ($graphic.width() - margin.left - margin.right); }
    else{ width =  PRINT_WIDTH}
    var height = Math.ceil((width * aspect_height) / aspect_width) - margin.top - margin.bottom;
    d3.select("#" + dataID + " .loading")
        .style("height", (height + margin.top + margin.bottom + 100) + "px")
        .style("width", (width + margin.left + margin.right) + "px")
    d3.select("#" + dataID + " .loading img")
        .style("margin-top", (-25 + (height + margin.top + margin.bottom + 70)/2) + "px")
    
      // .style("top", (0-height-margin.top-margin.bottom - 390) + "px")


  var states = {"Alabama": "AL","Alaska": "AK","American Samoa": "AS","Arizona": "AZ","Arkansas": "AR","California": "CA","Colorado": "CO","Connecticut": "CT","Delaware": "DE","District Of Columbia": "DC","District of Columbia": "DC","Federated States Of Micronesia": "FM","Florida": "FL","Georgia": "GA","Guam": "GU","Hawaii": "HI","Idaho": "ID","Illinois": "IL","Indiana": "IN","Iowa": "IA","Kansas": "KS","Kentucky": "KY","Louisiana": "LA","Maine": "ME","Marshall Islands": "MH","Maryland": "MD","Massachusetts": "MA","Michigan": "MI","Minnesota": "MN","Mississippi": "MS","Missouri": "MO","Montana": "MT","Nebraska": "NE","Nevada": "NV","New Hampshire": "NH","New Jersey": "NJ","New Mexico": "NM","New York": "NY","North Carolina": "NC","North Dakota": "ND","Northern Mariana Islands": "MP","Ohio": "OH","Oklahoma": "OK","Oregon": "OR","Palau": "PW","Pennsylvania": "PA","Puerto Rico": "PR","Rhode Island": "RI","South Carolina": "SC","South Dakota": "SD","Tennessee": "TN","Texas": "TX","Utah": "UT","Vermont": "VT","Virgin Islands": "VI","Virginia": "VA","Washington": "WA","West Virginia": "WV","Wisconsin": "WI","WY": "Wyoming", "US Average": "USA", "United States": "USA"}

  var months,
      monthFormat = d3.time.format("%Y-%m");

  // var margin = {top: 20, right: 30, bottom: 30, left: 40},
      // width = 960 - margin.left - margin.right,
      // height = 500 - margin.top - margin.bottom;

  var x = d3.time.scale()
      .range([0, width]);

  var y = d3.scale.linear()
      .range([height, 0]);

  var voronoi = d3.geom.voronoi()
      .x(function(d) { return x(d.date); })
      .y(function(d) { return y(d.value); })
      .clipExtent([[-margin.left, -margin.top], [width + margin.right, height + margin.bottom]]);

  var line = d3.svg.line()
      // .interpolate("basis")
      .x(function(d) { return x(d.date); })
      .y(function(d) { return y(d.value); });

  var svg = d3.select("#" + dataID).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  d3.csv("data/historical/" + dataID + ".csv", type, function(error, states) {
    var monthCopy = months.slice();
    var years = monthCopy.map(function(d){ return String(d.getFullYear())})
    var start = monthCopy[0];
    var end = monthCopy[monthCopy.length-1];
    if (QUARTERLY.indexOf(dataID) == -1){
      d3.select("section." + dataID + " .startDate")
        .text(MONTHNAMES[start.getMonth()] + " " + start.getFullYear())
      d3.select("section." + dataID + " .endDate")
        .text(MONTHNAMES[end.getMonth()] + " " + end.getFullYear())
    }
    else{
      d3.select("section." + dataID + " .startDate")
        .text("the " + QUARTERNAMES[start.getMonth()] + " of " + start.getFullYear())
      d3.select("section." + dataID + " .endDate")
        .text("the " + QUARTERNAMES[end.getMonth()] + " of " + end.getFullYear())    
    }
    years = d3.set(years).values()
    var yearMenu = d3.select("section." + dataID + " select.historical_year");
    for(var i = 0; i < years.length; i++){
      yearMenu.append("option")
        .attr("value", years[i])
        .text(years[i]);
    }
    x.domain(d3.extent(months));
    y.domain([d3.min(states, function(c) { return d3.min(c.values, function(d) { return d.value; }); }), d3.max(states, function(c) { return d3.max(c.values, function(d) { return d.value; }); })]).nice();

    svg.append("g")
        .attr("class", "axis x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.svg.axis()
          .scale(x)
          .orient("bottom"));

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        // .tickValues([min+step, min+step*6])
        .ticks(5)
        .tickFormat(function(d){
          // Check tick val and format accordingly. N -> int, N.5 -> 1 decimal place, N.25 -> 2 decimal places
          var formatter;
          if(parseInt(d) === d){
            formatter = d3.format(".0f")
            return formatter(d)
          }
          else if(parseInt(d*2) === d*2){
            formatter = d3.format(".1f")
            return formatter(d)
          }
          else if(parseInt(d*4) === d*4){
            formatter = d3.format(".2f")
            return formatter(d)
          }
          else{
            formatter = d3.format(".0f")
            return formatter(d)
          }
        })
        .tickSize(0)

      svg.append("g")
          .attr("class", "y axis")
          // .attr("transform","translate(" 0 + ",0)")
          .call(yAxis)

      svg.selectAll(".grid-line")
        .data(y.ticks(5))
        .enter()
        .append("svg:line")
            .attr("x1", 0)
            .attr("y1", function(d){ return y(d) })
            .attr("x2", width)
            .attr("y2", function(d){ return y(d) })
        .attr("class",function(d){
          if(d == 0){
            return "grid-line zero"
          } else{
            return "grid-line";
          }
        });


    svg.append("g")
        .attr("class", "states")
      .selectAll("path")
        .data(states)
      .enter().append("path")
        .attr("d", function(d) { d.line = this; return line(d.values); })
        .attr("id", function(d){  return d.abbrev});

    var focus = svg.append("g")
        .attr("transform", "translate(-100,-100)")
        .attr("class", "focus");

    focus.append("circle")
        .attr("r", 5)
        .attr("class","marker");

    // focus.append("text")
    //     .attr("y", -10);

    var voronoiGroup = svg.append("g")
        .attr("class", "voronoi");

    voronoiGroup.selectAll("path")
        .data(voronoi(d3.nest()
            .key(function(d) { return x(d.date) + "," + y(d.value); })
            .rollup(function(v) { return v[0]; })
            .entries(d3.merge(states.map(function(d) { return d.values; })))
            .map(function(d) { return d.values; })))
      .enter().append("path")
        .attr("d", function(d) { if(typeof(d) != "undefined"){return "M" + d.join("L") + "Z"; }})
        .datum(function(d) { if(typeof(d) != "undefined"){return d.point; }})
        .on("mouseover", mouseover)
        .on("mouseout", mouseout)
        .on("click", click)
   // d3.selectAll("#USA").node().parentNode.appendChild(d3.selectAll("#USA").node());
      d3.selectAll("#USA").each(function(p){
        p.line.parentNode.appendChild(p.line)
      })
        d3.selectAll(".grid-line.zero")[0].forEach(function(d){
          d3.select(d.parentNode.parentNode)
          .select("g.states")
          .node()
          .appendChild(d)
        })

   function click(d){
    d3.selectAll(".lineBG").remove();
    var node = d3.select(d.state.line).node()
    var clone = d3.select(node.cloneNode(true))
    clone.classed("lineBG", true)
    node.parentNode.insertBefore(clone.node(), node.nextSibling);
    // clone.node().parentNode.appendChild(clone.node())
    d.state.line.parentNode.appendChild(d.state.line);

   }

    function mouseover(d) {
      d3.select(d.state.line).classed("state--hover", true);
        d3.selectAll(".grid-line.zero")[0].forEach(function(d){
          d3.select(d.parentNode.parentNode)
          .select("g.states")
          .node()
          .appendChild(d)
        })
        dispatch.hoverState(d, dataID)
        d.state.line.parentNode.appendChild(d.state.line);
        focus.attr("transform", "translate(" + x(d.date) + "," + y(d.value) + ")");
    }

    function mouseout(d) {
      d3.select(d.state.line).classed("state--hover", false);
      focus.attr("transform", "translate(-100,-100)");
          d3.selectAll(".grid-line.zero")[0].forEach(function(d){
          d3.select(d.parentNode.parentNode)
            .select("g.states")
            .node()
            .appendChild(d)
        })
      d3.selectAll("#USA").each(function(p){
        p.line.parentNode.appendChild(p.line)
      })
      // d3.selectAll(".grid-line").each(function(p){
      //   c
      //   p.line.parentNode.appendChild(p.line)
      // })
    }
  });

  function type(d, i) {
    if (!i) months = Object.keys(d).map(monthFormat.parse).filter(Number);
    var state = {
      name: d.state,
      abbrev: states[d.state],
      values: null
    };
    state.values = months.map(function(m) {
      return {
        state: state,
        date: m,
        value: d[monthFormat(m)] /1
      };
    });
    return state;
  }
}

function drawHistorical(){
  drawGraphic("gov_employment_historical")
  drawGraphic("housing_historical")
  drawGraphic("total_employment_historical")
  drawGraphic("unemployment_historical")
  drawGraphic("wages_historical")
}
drawHistorical();
window.onresize = drawHistorical;

function checkReady(readyID) {
    var drawn = d3.select("#" + readyID + " svg .states").node();
    var loading = d3.select("#" + readyID + " .loading")
    // console.log(drawn, loading)
    if (drawn == null) {
        setTimeout(function(){ checkReady(readyID)}, 300);
    } else {
        setTimeout(function(){
          if(!isIE){
            loading
              .transition()
              .style("opacity", 0);
          }
          else if(isIE <= 10){
            // d3.select("#stateImg").classed("ie", true);
            // d3.select(".state.styled-select:not(.mobile)").classed("ie",true);
            loading.remove();
          }
          else{
            loading.remove();
          }
        },500);
    }
}

checkReady("gov_employment_historical")
checkReady("housing_historical")
checkReady("total_employment_historical")
checkReady("unemployment_historical")
checkReady("wages_historical")

