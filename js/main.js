/* Modernizr 2.8.3 (Custom Build) | MIT & BSD
 * Build: http://modernizr.com/download/#-mq
 */
;window.Modernizr=function(a,b,c){function v(a){i.cssText=a}function w(a,b){return v(prefixes.join(a+";")+(b||""))}function x(a,b){return typeof a===b}function y(a,b){return!!~(""+a).indexOf(b)}function z(a,b,d){for(var e in a){var f=b[a[e]];if(f!==c)return d===!1?a[e]:x(f,"function")?f.bind(d||b):f}return!1}var d="2.8.3",e={},f=b.documentElement,g="modernizr",h=b.createElement(g),i=h.style,j,k={}.toString,l={},m={},n={},o=[],p=o.slice,q,r=function(a,c,d,e){var h,i,j,k,l=b.createElement("div"),m=b.body,n=m||b.createElement("body");if(parseInt(d,10))while(d--)j=b.createElement("div"),j.id=e?e[d]:g+(d+1),l.appendChild(j);return h=["&#173;",'<style id="s',g,'">',a,"</style>"].join(""),l.id=g,(m?l:n).innerHTML+=h,n.appendChild(l),m||(n.style.background="",n.style.overflow="hidden",k=f.style.overflow,f.style.overflow="hidden",f.appendChild(n)),i=c(l,a),m?l.parentNode.removeChild(l):(n.parentNode.removeChild(n),f.style.overflow=k),!!i},s=function(b){var c=a.matchMedia||a.msMatchMedia;if(c)return c(b)&&c(b).matches||!1;var d;return r("@media "+b+" { #"+g+" { position: absolute; } }",function(b){d=(a.getComputedStyle?getComputedStyle(b,null):b.currentStyle)["position"]=="absolute"}),d},t={}.hasOwnProperty,u;!x(t,"undefined")&&!x(t.call,"undefined")?u=function(a,b){return t.call(a,b)}:u=function(a,b){return b in a&&x(a.constructor.prototype[b],"undefined")},Function.prototype.bind||(Function.prototype.bind=function(b){var c=this;if(typeof c!="function")throw new TypeError;var d=p.call(arguments,1),e=function(){if(this instanceof e){var a=function(){};a.prototype=c.prototype;var f=new a,g=c.apply(f,d.concat(p.call(arguments)));return Object(g)===g?g:f}return c.apply(b,d.concat(p.call(arguments)))};return e});for(var A in l)u(l,A)&&(q=A.toLowerCase(),e[q]=l[A](),o.push((e[q]?"":"no-")+q));return e.addTest=function(a,b){if(typeof a=="object")for(var d in a)u(a,d)&&e.addTest(d,a[d]);else{a=a.toLowerCase();if(e[a]!==c)return e;b=typeof b=="function"?b():b,typeof enableClasses!="undefined"&&enableClasses&&(f.className+=" "+(b?"":"no-")+a),e[a]=b}return e},v(""),h=j=null,e._version=d,e.mq=s,e.testStyles=r,e}(this,this.document);

var IS_IE = false;
var SMALL_SCREEN;
var MOBILE;
var MONTHNAMES = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
    ]
var PRINT_WIDTH = 650;
var PRINT_BAR_HEIGHT = 200;

function drawMapFigure(dataID, config, print){
    var dateUpdated;
    if(config["tab"] == "taxes"){
      dateUpdated = TAX_DATE;
    }
    else if(config["tab"] == "employment"){
      dateUpdated = EMP_DATE;
    }
    else if(config["tab"] == "wages"){
      dateUpdated = WAGE_DATE;
    }
    else if(config["tab"] == "housing"){
      dateUpdated = HOUSE_DATE;
    }
    var containerID = config.id
    var slice = figureData[dataID]["data"]
    var minIn = Math.min.apply(Math,slice.map(function(o){return parseVal(o.value,"draw");}))
    var maxIn = Math.max.apply(Math,slice.map(function(o){return parseVal(o.value,"draw");}))
    var breaks = parseBreaks(minIn, maxIn)
    
    var breaks = getNiceBreaks(minIn,maxIn,5),
        min = breaks.min,
        max = breaks.max;
    var step = (max-min)/5.0
    var tempBreaks = parseBreaks(minIn, maxIn)

    var quantize = function(d){
      if(typeof(d) == "undefined"){
        return "no-data"
      }
      else{
        for(var i = 0; i < tempBreaks.length-1; i++){
          if(d >= tempBreaks[i] && d < tempBreaks[i+1]){
            return "q" + i + "-4"
            break
          }
        }
      }
      
    }

    var parentElem = d3.select("#"+containerID)
    parentElem.on("click",function(){mouseEvent(dataID,{"type":"Background"},"click")})
    $("#"+containerID).empty()
    parentElem.attr("class", "figure-container")

    parentElem.append("div")
      .attr("id",containerID + "_title")
    parentElem.append("div")
      .attr("id",containerID + "_mobile-select")
    parentElem.append("div")
      .attr("id",containerID + "_mobile-bar")
    parentElem.append("div")
      .attr("id",containerID + "_bar-chart")
    parentElem.append("div")
      .attr("id",containerID + "_tooltip")
    parentElem.append("div")
      .attr("id",containerID + "_map")
      .attr("class", "map-container")
    parentElem.append("div")
      .attr("id", containerID + "_source")
      .attr("class", "map-source")

    if (!MOBILE){ drawMap() }
    if (!MOBILE){ drawBars() }
    if(MOBILE){ 
      drawMobile() 
    }
    drawTooltip()
    drawTitle()

  function drawMobile(){
    d3.select(".instructions")
      .text("Select a state from the dropdown menus. Largest values are selected by default.")
    var widthVal = Math.max(parseFloat(maxIn), Math.abs(parseFloat(minIn)))*2
    var formatter = d3.format(".1f")
    var dollarFormatter = d3.format("$0f")

    var container = d3.select("#" + containerID + "_mobile-bar")
    
    var state = container.append("div")
      .attr("class", containerID + " mobile-state")
    
    var usa = container.append("div")
      .attr("class", containerID + " mobile-usa")

    var noNaN = slice.filter(function(o){ return isNaN(o.value) == false})
    var maxVal = Math.max.apply(Math,noNaN.map(function(o){
      return o.value
    }))
    var maxObj = slice.filter(function(obj){return obj.value == maxVal});
    var maxCode = maxObj[0].geography.code;
    var maxName = maxObj[0].geography.name;
    var usVal = slice.filter(function(obj){return obj.geography.code == "US"})[0].value;
    
    var getWidth = function(val){
      // console.log(  parseFloat($("#" + containerID + "_mobile-bar").width())   )
      return parseFloat($("#" + containerID + "_mobile-bar").width()) * parseFloat(val)/parseFloat(widthVal);
    }

    state.append('div')
      .text(maxCode)
      .attr("class", "label")
      .style("left",0.75*getWidth(widthVal)/2+ "px")
   var sSvg = state
      .append("svg")
      .attr("width", function(){ return getWidth(widthVal) + "px"})
    sSvg.append("g")
      .append("rect")
      .attr("width", function(){ return 0.7*getWidth(maxVal) + "px"})
      .attr("height","30")
      .attr("x",getWidth(widthVal)/2)
      .attr("y","4")
      .attr("class","bar")
    sSvg.append('line')
      .attr("x1",getWidth(widthVal)/2)
      .attr("x2",getWidth(widthVal)/2)
      .attr("y1",-100)
      .attr("y2",100)
      .attr("class","mobile-axis")

      // .attr("class", "mobile-axis")
    state.append('div')
      .text(function(){
        if (config["unit-type"] == "percent") { return formatter(maxVal) + "%" }
        else if (config["unit-type"] == "dollar"){ return dollarFormatter(maxVal)}
        else if (config["unit-type"] == "percentage points"){ return formatter(maxVal) + "percentage points"}
      })
      .attr("class","amount")
      .style("left",function(){ console.log(maxVal); return getWidth(widthVal/2) + .73*getWidth(maxVal) + "px" });

    usa.append('div')
      .text('US')
      .attr("class", "label")
      .style("left",0.75*getWidth(widthVal)/2+ "px")
    var uSvg = usa
      .append("svg")
    uSvg.append("g")
      .append("rect")
      .attr("width", function(){ return 0.7*getWidth(usVal)})
      .attr("height","30")
      .attr("x",getWidth(widthVal)/2)
      .attr("y","4")
      .attr("class","bar")
    usa.append('div')
      .text(function(){
        if (config["unit-type"] == "percent") { return formatter(usVal) + "%" }
        else if (config["unit-type"] == "dollar"){ return dollarFormatter(usVal)}
        else if (config["unit-type"] == "percentage points"){ return formatter(usVal) + "percentage points"}
      })
      .attr("class","amount")
      .style("left",function(){ return getWidth(widthVal/2) + 0.73*getWidth(usVal) + "px" });


    uSvg.append('line')
      .attr("x1",getWidth(widthVal)/2)
      .attr("x2",getWidth(widthVal)/2)
      .attr("y1",-100)
      .attr("y2",100)
      .attr("class","mobile-axis")

    state.select("svg")
      .attr("width",getWidth(widthVal))
      .attr("height","40")

    usa.select("svg")
      .attr("width",getWidth(widthVal))
      .attr("height","40")


    var names = slice.map(function(obj){return obj.geography.name})
    var index = names.indexOf("United States of America");
    names.splice(index, 1)
    names.sort()
    var container = d3.select("#" + containerID + "_mobile-select")
    container.append("select")
      .selectAll("option")
      .data(names)
      .enter()
      .append("option")
    .text(function(d) {return d;})

   d3.selectAll("#" + containerID + "_mobile-select option")
    .attr("selected", function(d){
      if (d == maxName){ return "selected"}
    })
    var tooltip = d3.select("#" + containerID + "_tooltip")
    tooltip.text(function(){
      if(config["date-format"] == "month"){
        return "As of " + MONTHNAMES[dateUpdated.split("/")[0]-1] + " " + dateUpdated.split("/")[1]
      }
      else{
        return "As of the " + getQuarter(dateUpdated.split("/")[0]).toLowerCase() + " quarter of " + dateUpdated.split("/")[1]
      }
    })

    d3.select("#" + containerID + "_mobile-select select")
      .on("change", function(){
      
      names.sort()
      var name = names[this.selectedIndex];
      var object = slice.filter(function(obj){ return obj.geography.name == name})[0]
      var value = object.value
      var code = object.geography.code

      d3.select("#" + containerID + "_mobile-bar .mobile-state .label")
      .text(code)

      if(value == "#NA"){
        d3.select("#" + containerID + "_mobile-bar .mobile-state .amount")
        .text("No tax")
        .transition()
        .style("left",function(){ return 5+getWidth(widthVal)/2 + "px" });

        d3.select("#" + containerID + "_mobile-bar .mobile-state .label")
        .transition()
        .style("left",0.75*getWidth(widthVal)/2+ "px")


        d3.select("#" + containerID + "_mobile-bar .mobile-state .bar")
        .transition()
        .attr("width",function(){
          return 0
        })
        .attr("x",getWidth(widthVal)/2)
      
      }

      else if(value >= 0){
        d3.select("#" + containerID + "_mobile-bar .mobile-state .amount")
        .text(function(){
          if (config["unit-type"] == "percent") { return formatter(value) + "%" }
          else if (config["unit-type"] == "dollar"){ return dollarFormatter(value)}
          else if (config["unit-type"] == "percentage points"){ return formatter(value) + "percentage points"}

        })
        .transition()
        .style("left",function(){ return  getWidth(widthVal)/2 + 0.72*getWidth(value) + "px" });

        d3.select("#" + containerID + "_mobile-bar .mobile-state .label")
        .transition()
        .style("left",0.75*getWidth(widthVal)/2+ "px")


        d3.select("#" + containerID + "_mobile-bar .mobile-state .bar")
        .transition()
        .attr("width",function(){
          return 0.7*getWidth(value)
        })
        .attr("x",getWidth(widthVal)/2)
      }
      else{
        d3.select("#" + containerID + "_mobile-bar .mobile-state .amount")
        .text(function(){
          if (config["unit-type"] == "percent") { return formatter(value) + "%" }
          else if (config["unit-type"] == "dollar"){ return dollarFormatter(value)}
          else if (config["unit-type"] == "percentage points"){ return formatter(value) + "percentage points"}

        })
        .transition()
        .style("left",function(){ return  getWidth(widthVal)/2 - getWidth(Math.abs(value)) - 40 + "px"  });

        d3.select("#" + containerID + "_mobile-bar .mobile-state .label")
        .transition()
        .style("left",getWidth(widthVal)/2+ "px")


        d3.select("#" + containerID + "_mobile-bar .mobile-state .bar")
        .transition()
        .attr("width", 0.7*getWidth(Math.abs(value)))
        .attr("x",getWidth(widthVal)/2.0 + 0.7*getWidth(value))
      }
    });
  }
  function drawMap(){
    d3.selectAll("[id$=mobile-bar]").style("display","none")
    d3.selectAll("#instructions")
    .text("Roll over the bar charts, scatter plots, maps, and legends to see additional data.")

    var $graphic = $("#"+containerID + "_map");
    
    var aspect_width = 10;
    var aspect_height = 3.3;
    var margin = { top: 0, right: 10, bottom: 40, left: 20 };
    var width;
    if (!print) { width = ($graphic.width() - margin.left - margin.right); }
    else{ width =  PRINT_WIDTH}
    

    var height = Math.ceil((width * aspect_height) / aspect_width) - margin.top - margin.bottom;

    var svg = d3.select("#"+containerID + "_map")
      .style("height", (height + margin.top + margin.bottom) + "px")
      .append("svg")
      .attr("width", width + margin.left + margin.right + "px")
      .attr("height", (height + margin.top + margin.bottom) + "px")
      .attr("transform", "translate("   + margin.left + "," + margin.top + ")")

      var projection = d3.geo.albersUsa()
          .scale(width*.7 + margin.left + margin.right)
          .translate([(width+margin.left+margin.right) / 2, (height+margin.top+margin.bottom)/ 2]);

      var path = d3.geo.path()
          .projection(projection);

      var legend = svg.append("g")
      			   .attr("width",width+margin.left+margin.right)
      			   .attr("height",50)

      var keyWidth = 30
      var keyHeight = 15

      for (i=0; i<=5; i++){
        if(i !== 5){
          legend.append("rect")
            .attr("width",keyWidth)
            .attr("height",keyHeight)
            .attr("class",dataID + " q" + i + "-4")
            .attr("x",keyWidth*i)
            .on("mouseover",function(){ mouseEvent(dataID, {type: "Legend", "class": "q" + (this.getAttribute("x")/keyWidth) + "-4"}, "hover") })
            .on("mouseout", function(){
              d3.selectAll(".hover").classed("hover",false)
              d3.selectAll(".demphasized").classed("demphasized",false)
              d3.selectAll(".text-highlight").classed("text-highlight",false)
            })
            .on("click",function(){ mouseEvent(dataID, {type: "Legend", "class": "q" + (this.getAttribute("x")/keyWidth) + "-4"}, "click") })

        }

      if(dataID == "TOTAL" || dataID == "INC" || dataID == "CORPINC" || dataID == "SALES"){
          legend.append("rect")
            .attr("width",keyWidth/2)
            .attr("height",keyHeight)
            .attr("class","no-data")
            .attr("x",keyWidth * 5.5)
            .on("mouseover",function(){ mouseEvent(dataID, {type: "Legend", "class": "no-data"}, "hover") })
            .on("mouseout", function(){
              d3.selectAll(".hover").classed("hover",false)
              d3.selectAll(".demphasized").classed("demphasized",false)
              d3.selectAll(".text-highlight").classed("text-highlight",false)
            })
            .on("click",function(){ mouseEvent(dataID, {type: "Legend", "class": "no-data"}, "click") })
          
            legend.append("text")
              .text("No tax")
              .attr("class","legend-labels")
              .style("font-weight","300")
              .style("font-style","italic")
              .attr("x",5)
              .attr("y",keyWidth * 5.9)
              .attr("transform","rotate(-90)")
          }



        legend.append("text")
          .attr("x",5)
          .attr("class","legend-labels " + dataID)
          .attr("y",5+keyWidth*i)
          .attr("transform", function(){
              return "rotate(-90)"
          })
          .text(function(){
            if (config["unit-type"] == "percent"){
              return tempBreaks[i] + "%"
            }
            else if (config["unit-type"] == "dollar"){
              var formatter = d3.format("$")
              return formatter(tempBreaks[i])
            }
            else{
              return tempBreaks[i]
            }
          })
      }

      legend.attr("transform",function(){
        if(!SMALL_SCREEN){return "translate("+ (width*1.05 - keyWidth*5) +",20) rotate(90)"}
        else{return "translate("+ (width*1.15 - keyWidth*5) +",20) rotate(90)"}
      });

      d3.select(self.frameElement).style("height", height + "px");

      queue()
        .defer(d3.json, "static/shapefile/us-counties.json")
        .await(ready);

      function ready(error,us) {
        svg.append("g")
          .attr("id", "map-states")
        .selectAll("path")
          .data(topojson.feature(us, us.objects.states).features)
        .enter().append("path")
          .attr("class", function(d) {
            var state = slice.filter(function(obj){return obj.geography.fips == d.id})  ;
              if(state.length > 0){
              return "states " + dataID + " " + quantize(parseVal(state[0].value,"color")) + " FIPS_" + d.id
            }
            else{
              return "states NA " + dataID + " FIPS_" + d.id
            }
        })
          .attr("id", function(d) { return "state-outline_" + dataID + "_" + d.id ;})
          .attr("d", path)
          .on("mouseover", function(d){mouseEvent(dataID,d,"hover")})
          .on("mouseout", function(d){
              d3.selectAll(".hover").classed("hover",false)
              d3.selectAll(".demphasized").classed("demphasized",false)
              d3.selectAll(".text-highlight").classed("text-highlight",false)
          })
          .on("click", function(d){mouseEvent(dataID,d,"click")})

    }
  }


var barSvg, barXAxis, barBase;

  function drawBars(){
    var $graphic = $("#"+containerID + "_bar-chart");

    var aspect_width = 41;
    var aspect_height = 6;
    var margin = { top: 0, right: 0, bottom: 10, left: 30 };
    var width;
    if (!print) { width = ($graphic.width() - margin.left - margin.right); }
    else{ width =  PRINT_WIDTH}
    // var width = 500;
    // d3.select("body").style("width","500px")
    var height;
    if (!print){ height = Math.ceil((width * aspect_height) / aspect_width) - margin.top - margin.bottom; }
    else{ height = PRINT_BAR_HEIGHT }

    // Bar chart axes
    var x = d3.scale.ordinal()
        .rangeBands([margin.left, width],0.285)
        .domain(slice.sort(function(a,b){ return parseVal(b.value,"sort")-parseVal(a.value,"sort")}).map(function(d) { return d.geography.code; }));


    var svg = d3.select("#"+containerID + "_bar-chart")
      .attr("height", height + "px")
      .append("svg")
      .attr("width", width + margin.left + margin.right + "px")
      .attr("height", height + margin.top + margin.bottom + "px")
      .attr("transform", "translate("   + margin.left + "," + margin.top + ")")

    var lowerBound;
    if(min < 0){
      lowerBound = min
    }
    else{
      lowerBound = 0
    }

    var y = d3.scale.linear()
        .range([height,0])
        .domain([lowerBound,max*1.1])




    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .tickSize(0);

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        // .tickValues([min+step, min+step*6])
        .ticks(3)
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

      svg.selectAll(".grid-line")
        .data(y.ticks(3))
        .enter()
        .append("svg:line")
            .attr("x1", 0+margin.left)
            .attr("y1", function(d){ return y(d) })
            .attr("x2", width - margin.right)
            .attr("y2", function(d){ return y(d) })
        .attr("class","grid-line");
      // svg.append("svg:line")
      //       .attr("x1", 0+margin.left)
      //       .attr("y1", y(min+6*step))
      //       .attr("x2", width - margin.right)
      //       .attr("y2", y(min+6*step))
      //   .attr("class","grid-line");
      svg.append("g")
          .attr("class", "y axis")
          .attr("transform","translate(" + margin.left + ",0)")
          .call(yAxis)

      svg.selectAll(".bar")
          .data(slice)
        .enter().append("rect")
          .attr("class", function(d){
            var isUS;
            if(d.geography.fips == -99){
              isUS = "usa-bar "
            }
            else{
              isUS = ""
            }
            return isUS + "states " + dataID + " " + quantize(parseVal(d.value,"color")) + " FIPS_" + d.geography.fips
          })
          .attr("id", function(d) { return "bar-outline_" + dataID + "_" + d.geography.fips ;})
          .attr("x", function(d) { return x(d.geography.code); })
          .attr("width", x.rangeBand())
          //to handle negative bars, Bars either start at 0 or at neg value
          .attr("y", function(d) { return y(Math.max(0, parseVal(d.value,"draw"))) })
          .attr("height", function(d) { return Math.abs(y(0) - y(parseVal(d.value,"draw")));})
          .on("mouseover", function(d){ mouseEvent(dataID, {"value": parseVal(d.value,"text"), "type": "Bar", "id": this.id.replace("bar-outline_","").replace(dataID,"").replace("_","")}, "hover") })
          .on("mouseout", function(){ mouseEvent(dataID,this,"exit")})
          .on("click",function(d){ mouseEvent(dataID, {"value": parseVal(d.value,"text"), "type": "Bar", "id": this.id.replace("bar-outline_","").replace(dataID,"").replace("_","")}, "click") })
          ;

      svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + y(0)+ ")")
          .call(xAxis);
      barSvg = svg
      barXAxis = xAxis
      barBase = y(0)

      reappendAxis()

//Grab all the x axis ticks, if the state they label has a negative value bar, pop them up above the x axis

  }

  function reappendAxis(){
    d3.selectAll("#"+containerID + "_bar-chart .x.axis .tick text").remove()
    d3.selectAll("#"+containerID + "_bar-chart .x.axis").remove()
    barSvg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + barBase+ ")")
      .call(barXAxis);

    var xTicks = $("#"+containerID + "_bar-chart .x.axis .tick text")
    xTicks.each(function(index,tick){
      if(tick.textContent == "US"){
        $(tick).attr("class", "usa-tick")
      }
      var value = parseVal(slice.filter(function(obj){return obj.geography.code == tick.textContent})[0].value,"color")
      if(typeof(value) == "undefined"){
        $(tick).attr("class","nullTick")
      }
      else if(value <= 0){
        $(tick).attr("dy","-.71em")  
      }
    });

  }

  function drawTooltip(){
    var data = figureData[dataID]
    var yearUpdated = dateUpdated.split("/")[1]

    //Get quarter from month, then subtract 1 to make it zero indexed
    // var quarterUpdated = Math.ceil(data.monthUpdated/3) - 1
   
    var usAvg = slice.filter(function(obj){return obj.geography.code == "US"})[0].value

    var graphic = d3.select("#"+containerID + "_tooltip");
    var tooltip = graphic.append('div')
      .attr('class',"tooltip-container " + dataID)

    var region = tooltip.append('div')
      .attr('class',"region-text")
    region.append('div')
        .attr('class','tooltip-title')
        .text('REGION/STATE')
    region.append('div')
        .attr('class','tooltip-data')
        .text("United States of America")

    var value = tooltip.append('div')
      .attr('class',"value-text")
    value.append('div')
        .attr('class','tooltip-title')
        .html(config["short-label"])
    value.append('div')
        .attr('class','tooltip-data')
        .text(function(){
          var formatter = d3.format(".1f")
          var dollarFormatter = d3.format("$0f")
          if (config["unit-type"] == "percent") { return formatter(usAvg) + "%" }
          else if (config["unit-type"] == "dollar"){ return dollarFormatter(usAvg)}
          else if (config["unit-type"] == "percentage points"){ return formatter(usAvg) + "percentage points"}

        })

    var quarter = tooltip.append('div')
      .attr('class',"quarter-text")
    quarter.append('div')
        .attr('class','tooltip-title')
        .text(function(){
          if (config["date-format"] == "month"){ return 'MONTH' }
          else if (config["date-format"] == "quarter"){ return 'QUARTER' } 
        })
    quarter.append('div')
        .attr('class','tooltip-data')
        .text(function(){
          if (config["date-format"] == "month"){ return MONTHNAMES[parseInt(dateUpdated.split("/")[0])-1] }
          else if (config["date-format"] == "quarter"){ return getQuarter(parseInt(dateUpdated.split("/")[0])) } 

        })
    if(typeof(dateUpdated.split("/")[0]) == "undefined"){
      quarter.remove()
    }

    var year = tooltip.append('div')
      .attr('class',"year-text")
    year.append('div')
        .attr('class','tooltip-title')
        .text('YEAR')
    year.append('div')
        .attr('class','tooltip-data')
        .text(yearUpdated)
    if(typeof(dateUpdated.split("/")[1]) == "undefined"){
      year.remove()
    }

    resizeTooltip(dataID);

  }

  function resizeTooltip(dataID){
  //Make width of tooltip text shrink-wrapped to width of elements. 3 margins, 3 px extra for rounding errors,
  //plus the widths of the elements
    if(MOBILE){
      console.log("mobile")
    }
    var totalWidth = 30*3 + 1
    $(".tooltip-container." + dataID + " .tooltip-data")
    .each(function(index,value) {
      totalWidth += $(value).width();
    });
    d3.select("#"+containerID + "_tooltip .tooltip-container").attr("style","width:" + totalWidth + "px")
  }

  function drawTitle(){
//Writes out title, subtitle, units, and source line
    var data = figureData[dataID]
    var monthUpdated = dateUpdated.split("/")[0]
    var yearUpdated = dateUpdated.split("/")[1]

    var titleText = config.title
    var usAvg = slice.filter(function(obj){return obj.geography.code == "US"})[0].value
    var subtitleText = parseConfigText(config, dataID, config.subtitle, dateUpdated, usAvg)

    var sourceText = "Source: " + parseConfigText(config, dataID, config.source, dateUpdated, usAvg)
    d3.select("#" + containerID + "_source").html(sourceText)
    
    var graphic = d3.select("#"+containerID + "_title");

    var title = graphic.append('div')
      .attr('class',"title-container " + dataID)
    title.append('div')
      .attr('class','title-text')
      .text(titleText)

    .append('span')
      .attr('class','title-unit')
      .text('(' + config.unit + ')')

    title.append('div')
      .attr('class','title-subtitle')
      .html(subtitleText)

  }

  function parseBreaks(min, max){
    var breaks = config.breaks
    for (var i = 0; i < breaks.length; i++) {
      var val = breaks[i]
      if(typeof(val) != "number"){
        if ((val) == "{{min}}"){
          breaks[i] = Math.floor(min)
          continue
        }
        else if ((val) == "{{max}}"){
          breaks[i] = Math.ceil(max)
          continue
        }
      }
    }
    return breaks
  }

  function mouseEvent(dataID,element,event){
    // stopPropagation() means that clicks on bars and map do not trigger click on background

    d3.event.stopPropagation();

// state case
    if(element.type == "Feature" || element.type == "Bar"){
      var state = d3.select("#state-outline_" + dataID + "_" + element.id)
      var bar = d3.select("#bar-outline_" + dataID + "_" + element.id)

      var states = d3.selectAll(".FIPS_" + element.id)
      var stateNode = state.node()
      var barNode = bar.node()

      var obj = slice.filter(function(obj){return obj.geography.fips == element.id})[0]
      var name = obj.geography.name
      var formatter = d3.format(".1f")
      var dollarFormatter = d3.format("$0f")
      var value = formatter(obj.value)

      d3.selectAll(".tooltip-container." + dataID + " .year-text").classed("hidden",false)
      d3.selectAll(".tooltip-container." + dataID + " .value-text").classed("hidden",false)
      d3.selectAll(".tooltip-container." + dataID + " .quarter-text").classed("hidden",false)

      if(!IS_IE){ barNode.parentNode.appendChild(barNode) }

      var nameDiv = d3.select("#"+containerID + "_tooltip .region-text .tooltip-data")
      var valueDiv = d3.select("#"+containerID + "_tooltip .value-text .tooltip-data")
      nameDiv.text(name)

      if(bar.classed("usa-bar")){
        bar.classed("hover",true)
        d3.selectAll('.usa-text_' + dataID)
          .classed('text-highlight',true)
        resizeTooltip(dataID);
      }
      else{
        if(!IS_IE){ stateNode.parentNode.appendChild(stateNode) }


        var usAvg = slice.filter(function(obj){return obj.geography.code == "US"})[0].value
        if(config["unit-type"] == "percent"){
          usAvg = formatter(usAvg) + "%"
        }
        else if(config["unit-type"] == "dollar"){
          usAvg = dollarFormatter(usAvg)
        }
        else if (config["unit-type"] == "percentage points"){ usAvg = formatter(usAvg) + "percentage points"}


        nameDiv.append("div")
        .attr("class","tooltip-usa-average")
        .html("US average: " + "<span class = usa_text-" + dataID + ">" + usAvg + "</span>" )

        resizeTooltip(dataID);

        if(event == "hover"){
          state.classed(event,true)
          bar.classed(event,true)
        }
        if(event == "click"){
          var clicked;
          if(element.type == "Feature"){
            clicked = state.classed(event)
          }
          if(element.type == "Bar"){
            clicked = bar.classed(event)

          }
          states.classed(event, !clicked)
          states.classed("hover",false)
          bar.classed(event, !clicked)
          bar.classed("hover",false)
        }
      }
      reappendAxis()
      valueDiv.text(function(){
        //handle here instead of in parseVal bc formatter returns strings
          if (value == "NaN"){
            return "No tax"
          }
          else if(config["unit-type"] == "percent"){
            return formatter(value) + "%"
          }
          else if(config["unit-type"] == "dollar"){
            return dollarFormatter(value)
          }
          else if (config["unit-type"] == "percentage points"){ return formatter(value) + "percentage points"}


        })
      resizeTooltip(dataID);



    }
// legend case
    else if(element.type == "Legend"){
      d3.selectAll("path." + dataID + ".states")
      .classed("demphasized",true)

      var states = d3.selectAll("." + dataID + "." + element.class)
      states.classed({"demphasized": false})
      if(!IS_IE){ states[0].forEach(function(s){ s.parentNode.appendChild(s)}) }
    }

    else if(element.type == "Background"){
      d3.selectAll(".click").classed("click",false)
    }

    if(event == "exit"){
      d3.selectAll(".hover").classed("hover",false)
      d3.selectAll(".demphasized").classed("demphasized",false)
      d3.selectAll(".text-highlight").classed("text-highlight",false)
      reappendAxis()

    }
  }
}


function parseVal(value, useCase){
  if(typeof(value) == "number"){
      return Math.round(value *10)/10.0
  }
  else{
    switch(useCase){
      case "text":
        return "No tax"
      case "sort":
        return Number.NEGATIVE_INFINITY
      case "draw":
        return 0
      case "color":
        return undefined
    }
  }

}



function drawScatterPlot(config, print){
  var dateUpdated;
  if(config.x["date-format"] == "quarter"){
    dateUpdated = TAX_DATE
  }
  else if(config.x["date-format"] == "month"){
    dateUpdated = EMP_DATE
  }
  var containerID = config.id

  var xSlice = figureData[config.x.id]["data"]
  var ySlice = figureData[config.y.id]["data"]
  var data = []

  for(i=0; i<xSlice.length; i++){
    data[i] = {}
    data[i]["x"] = xSlice[i]
    var result = ySlice.filter(function( obj ) {
      return obj.geography.fips == xSlice[i].geography.fips;
    });
    data[i]["y"] = result[0]
  }

  var parentElem = d3.select("#"+containerID)
  $("#"+containerID).empty()

  parentElem.append("div")
    .attr("id",containerID + "_title")
  parentElem.append("div")
    .attr("id",containerID + "_mobile-select")
  parentElem.append("div")
    .attr("id",containerID + "_tooltip")
  parentElem.append("div")
    .attr("id",containerID + "_plot")
    .attr("class", "plot-container")
  parentElem.append("div")
    .attr("id",containerID + "_source")
    .attr("class", "plot-source")

  parentElem.attr("class","figure-container")

  var usAvgX = xSlice.filter(function(obj){return obj.geography.code == "US"})[0].value
  var usAvgY = ySlice.filter(function(obj){return obj.geography.code == "US"})[0].value

  drawTooltip()
  drawTitle()
  if(!MOBILE){ drawPlot() }
  if(MOBILE){ drawMobile() }


  function drawMobile(){
    var formatter = d3.format(".1f")
    var dollarFormatter = d3.format("$0f")
    d3.selectAll("[id$=mobile-bar]").style("display","block")
    var names = xSlice.map(function(obj){return obj.geography.name})
    var index = names.indexOf("United States of America");
    names.splice(index, 1)
    names.sort()
    var container = d3.select("#" + containerID + "_mobile-select")
    container.append("hr")
    container.append("select")
      .selectAll("option")
      .data(names)
      .enter()
      .append("option")
    .text(function(d) {return d;})
    container.append("hr")


    d3.select("#" + containerID + "_mobile-select select")
      .on("change", function(){
        // var xVal = xSlice.filter()

      names.sort()
      var name = names[this.selectedIndex];
      var xObject = xSlice.filter(function(obj){ return obj.geography.name == name})[0]
      var yObject = ySlice.filter(function(obj){ return obj.geography.name == name})[0]
      d3.select("#" + containerID + "_tooltip .value-text.x .tooltip-data").text(function(){
        if(config.x["unit-type"] == "percent"){ return formatter(xObject.value) + "%"}
        else if(config.x["unit-type"] == "dollar"){ return dollarFormatter(xObject.value)}
        else if (config.x["unit-type"] == "percentage points"){ return formatter(xObject.value) + "percentage points"}

      })
      d3.select("#" + containerID + "_tooltip .value-text.y .tooltip-data").text(function(){
        if(config.y["unit-type"] == "percent"){ return formatter(yObject.value) + "%"}
        else if(config.y["unit-type"] == "dollar"){ return dollarFormatter(yObject.value)}
        else if (config.y["unit-type"] == "percentage points"){ return formatter(yObject.value) + "percentage points"}
      })

      });

    var tooltip = d3.select("#" + containerID + "_plot")
    .style("display", "block")
    .text(function(){
      if(config.x["date-format"] == "month"){
        return "As of " + MONTHNAMES[dateUpdated.split("/")[0]-1] + " " + dateUpdated.split("/")[1]
      }
      else{
        return "As of the " + getQuarter(dateUpdated.split("/")[0]).toLowerCase() + " quarter of " + dateUpdated.split("/")[1]
      }
    })

  }
  function drawTitle(){
    var monthUpdatedX = config.x.monthUpdated
    var yearUpdatedX = config.x.yearUpdated
    var monthUpdatedY = config.x.monthUpdated
    var yearUpdatedY = config.x.yearUpdated

    var titleText = config.title
    var subtitleText = parseConfigText(config, [config.x.id, config.y.id], config.subtitle, dateUpdated, [usAvgX, usAvgY])

    var sourceText = "Source: " + parseConfigText(config, [config.x.id, config.y.id], config.source, dateUpdated, [usAvgX, usAvgY])

    d3.select("#" + containerID + "_source").html(sourceText)

    var graphic = d3.select("#"+containerID + "_title");

    var title = graphic.append('div')
      .attr('class',"title-container " + config.x.id + "v" + config.y.id)
    title.append('div')
      .attr('class','title-text')
      .text(titleText)

    title.append('div')
      .attr('class','title-unit')
      .text(config.unit)
    title.append('div')
      .attr('class','title-subtitle')
      .html(subtitleText)

  }

  function drawTooltip(){
    var graphic = d3.select("#"+containerID + "_tooltip");
    var tooltip = graphic.append('div')
      .attr('class',"tooltip-container scatter " + config.x.id + "v" + config.y.id)

    var region = tooltip.append('div')
      .attr('class',"region-text")
    region.append('div')
        .attr('class','tooltip-title')
        .text('REGION/STATE')
    region.append('div')
        .attr('class','tooltip-data')
        .text("UNITED STATES OF AMERICA")

    var formatter = d3.format(".1f")
    var dollarFormatter = d3.format("$0f")
    var usX, usY;
    
    var xValue = tooltip.append('div')
      .attr('class',"value-text x")
    xValue.append('div')
        .attr('class','tooltip-title')
        .html(config.x["short-label"])
    xValue.append('div')
        .attr('class','tooltip-data')
        .text(function(){
          if (config.x["unit-type"] == "percent") { usX = formatter(usAvgX) + "%"; return usX }
          else if (config.x["unit-type"] == "dollar"){ usX = dollarFormatter(usAvgX); return usX}
          else if (config.x["unit-type"] == "percentage points"){ usX = formatter(usAvgX) + " percentage points"; return usX }
        })

    var yValue = tooltip.append('div')
      .attr('class',"value-text y")
    yValue.append('div')
        .attr('class','tooltip-title')
        .html(config.y["short-label"])
    yValue.append('div')
        .attr('class','tooltip-data')
        .text(function(){
          if (config.y["unit-type"] == "percent") { usY = formatter(usAvgY) + "%"; return usY;}
          else if (config.y["unit-type"] == "dollar"){ usY = dollarFormatter(usAvgY); return usY;}
          else if (config.y["unit-type"] == "percentage points"){ usY = formatter(usAvgY) + " percentage points"; return usY }

        })
    
    region.append("div")
        .attr("class","tooltip-usa-average hidden")
        .html("US average: " + "<span class = usa_text-" + config.x.id + "v" + config.y.id + ">" + config.x["short-label"] + " of " + usX + " and " + config.y["short-label"] + " of " + usY + "</span>" )

    resizeTooltip(config.x.id + "v" + config.y.id);

  }


  function resizeTooltip(dataID){
  //Make width of tooltip text shrink-wrapped to width of elements. 3 margins, 3 px extra for rounding errors,
  //plus the widths of the elements
    var totalWidth = 30*2 + 2
    $(".tooltip-container." + dataID + " .tooltip-data")
    .each(function(index,value) {
      if($(value).text() == "UNITED STATES OF AMERICA"){
//man this is some janky nonsense, wasn't pulling in the correct width for USA text...ugh
        totalWidth += 290
      }
      else{
        totalWidth += $(value).width();
      }
    });
    d3.select("#"+containerID + "_tooltip .tooltip-container").attr("style","width:" + totalWidth + "px")
  }


  function drawPlot(){
    var $graphic = $("#"+containerID + "_plot");

    var aspect_width = 2;
    var aspect_height;
    if(SMALL_SCREEN){
      aspect_height = 1.2;
    }else{ aspect_height = .8; }
    
    var margin = { top: 30, right: 40, bottom: 40, left: 80 };
    // var width = $graphic.width() - margin.left - margin.right;
    var width;
    if (!print) { width = ($graphic.width() - margin.left - margin.right); }
    else{ width =  PRINT_WIDTH}
    var height = Math.ceil((width * aspect_height) / aspect_width) - margin.top - margin.bottom;

    var x = d3.scale.linear()
        .range([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]);

    var color = d3.scale.category10();

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(4)

    var svg = d3.select("#"+containerID + "_plot").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var legend = svg.append("g")
      .attr("transform", "translate(-19,-20)");
    var regions = ["Northeast", "Midwest", "South", "West"]
    for(var i = 0; i< regions.length; i++){
      legend.append("rect")
        .attr("class", "plot-key " + regions[i])
        .attr("width", 10)
        .attr("height", 10)
        .attr("transform", "translate(" + i*width/8 + ",0)")
        .on("mouseover", function(){
          var region  = this.getAttribute("class").replace("plot-key ","")
          d3.selectAll("#" + containerID + " " + ".dot")
          .classed("demphasized",true)

          d3.selectAll("#" + containerID + " " + ".dot." + region)
          .classed("demphasized",false)

        region.append("div")
          .attr("class","tooltip-usa-average")
          .html("US average: " + "<span class = usa_text-" + "dataID" + ">" + "usAvg" + "</span>" )

        })
        .on("mouseout",function(){ d3.selectAll(".dot").classed("demphasized",false) });   
      
      legend.append("text")
        .attr("class","legend-labels")
        .text(regions[i])
        .attr("transform","translate(" + parseInt(15 + (i*width/8)) + ",10)")
        .on("mouseover", function(){
          var region  = this.innerHTML
          d3.selectAll("#" + containerID + " " + ".dot")
          .classed("demphasized",true)

          d3.selectAll("#" + containerID + " " + ".dot." + region)
          .classed("demphasized",false)

        })
        .on("mouseout",function(){ d3.selectAll(".dot").classed("demphasized",false) });
    }

    x.domain(d3.extent(xSlice, function(d) { return d.value; })).nice();
    y.domain(d3.extent(ySlice, function(d) { return d.value; })).nice();
    svg.selectAll(".dot-line")
        .data(data)
      .enter().append("line")
        .attr("class", "dot-line")
        .attr("x1",function(d) { return x(Math.round(d.x.value *10)/10.0); })
        .attr("x2",function(d) { return x(Math.round(d.x.value *10)/10.0); })
        .attr("y1",function(d) { return y(Math.round(d.y.value *10)/10.0); })
        .attr("y2", y(0))



    svg.append("g")
        .attr("class", "x axis scatter")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
      .append("text")
        .attr("class", "label")
        .attr("x", width/2)
        .attr("y", 36)
        .style("text-anchor", "end")
        .text(config.x.label);

    svg.append("g")
        .attr("class", "y axis scatter")
        .call(yAxis)
      .append("text")
        .attr("transform","rotate(-90)")
        .attr("class", "label")
        .attr("y", 6)
        .attr("dx", function(){ 
          if(SMALL_SCREEN){
            return "-12em"
          }
          else{
            return "-25em"
          }
        })
        .attr("dy", "-4em")
        .text(config.y.label)

    svg.append("line")
        .attr("class","scatter-baseline")
        .attr("x1",x(0))
        .attr("x2",x(0))
        .attr("y1",0)
        .attr("y2",height)

    svg.selectAll(".y.axis.scatter .tick line")
      .attr("x1",0)
      .attr("x2",width)
      .attr("class","scatter-grid")

    svg.append("line")
        .attr("class","scatter-baseline")
        .attr("x1",0)
        .attr("x2",width)
        .attr("y1",y(0))
        .attr("y2",y(0))



    svg.selectAll(".dot")
        .data(data)
      .enter().append("circle")
        .attr("class", function(d) {return "dot " + d.x.geography.region + " FIPS_" + d.x.geography.fips;})
        .attr("r", 7)
        .attr("cx", function(d) { return x( Math.round(d.x.value *10)/10.0 ); })
        .attr("cy", function(d) { return y( Math.round(d.y.value *10)/10.0 ); })
        .on("mouseover", function(d){
          d3.select(this).classed("hover",true)
          if(d.x.geography.fips == -99){
            d3.selectAll(".usa-text_" + config.x.id).classed("text-highlight", true)
            d3.selectAll(".usa-text_" + config.y.id).classed("text-highlight", true)
            d3.selectAll("#"+containerID + "_tooltip " + ".tooltip-usa-average").classed("hidden",true)
            console.log(d3.select("#"+containerID + "_tooltip " + ".tooltip-usa-average"))
          }
          else{
            d3.selectAll("#"+containerID + "_tooltip " + ".tooltip-usa-average").classed("hidden",false)
          }
          d3.select(".tooltip-container." + config.x.id + "v" + config.y.id + " .region-text .tooltip-data").text(d.x.geography.name)
          d3.selectAll(".tooltip-container." + config.x.id + "v" + config.y.id + " .value-text").classed("hidden",false)
          var formatter = d3.format(".1f")
          var dollarFormatter = d3.format("$0f")
          d3.selectAll(".tooltip-container." + config.x.id + "v" + config.y.id + " .value-text.x .tooltip-data").text(function(){
            if(config.x["unit-type"] == "percent"){
              return formatter(d.x.value) + "%"
            }
            else if(config.x["unit-type"] == "dollar"){
              return dollarFormatter(d.x.value)
            }
            else if (config.x["unit-type"] == "percentage points"){  return formatter(d.x.value) + " percentage points"}

          })
          d3.selectAll(".tooltip-container." + config.x.id + "v" + config.y.id + " .value-text.y .tooltip-data").text(function(){
            if(config.y["unit-type"] == "percent"){
              return formatter(d.y.value) + "%"
            }
            else if(config.y["unit-type"] == "dollar"){
              return dollarFormatter(d.y.value)
            }
            else if (config.y["unit-type"] == "percentage points"){  return formatter(d.y.value) + " percentage points"}

          })

          resizeTooltip(config.x.id + "v" + config.y.id);
        })
        .on("mouseout", function(){
          d3.selectAll(".dot").classed("hover",false)
          d3.selectAll(".text-highlight").classed("text-highlight",false)
          resizeTooltip(config.x.id + "v" + config.y.id);
        })
        .on("click",function(d){
          if(d.x.geography.fips != -99){
            var clicked = d3.select(this).classed("click")
            d3.selectAll(".FIPS_" + d.x.geography.fips).classed("click",!clicked)
            d3.select(this).classed("click", !clicked).classed("hover",false)
          }
        })
    }
}



function parseConfigText(config, dataID, text, dateUpdated, usAvg){
  var outStr
  if (dataID.constructor !== Array){
    outStr = parseText(config, dataID, text, dateUpdated, usAvg, "")
  }
  else{
    tempStr = parseText(config.x, dataID[0], text, dateUpdated, usAvg[0], "x-")
    outStr = parseText(config.y, dataID[1], tempStr, dateUpdated, usAvg[1], "y-")

  }

  function parseText(conf, dID, text, dateUpdated, avg, prefix){
    var configFormat = conf["date-format"]
    var unitType = conf["unit-type"]
    var inStr = text;

    var month, year, prevYear;

    month = parseInt(dateUpdated.split("/")[0])
    year = parseInt(dateUpdated.split("/")[1])
    prevYear = year -1
    

    var datePrevious, dateUpdated, usaValue, usaChanged;
    if (configFormat == "month"){
      dateUpdated = MONTHNAMES[month - 1] + " " + year
      datePrevious = MONTHNAMES[month - 1] + " " + prevYear
    }
    else if (configFormat == "quarter"){
      dateUpdated = "the " + getQuarter(month).toLowerCase() + " quarter of " + year
      datePrevious = "the " + getQuarter(month).toLowerCase() + " quarter of " + prevYear
    }

    var formatter = d3.format(".1f");
    if(unitType == "percent"){
      usaValue = formatter(Math.abs(avg)) + " percent"
    }
    else if(unitType == "dollar"){
      var dollarFormatter = d3.format("$0f")
      usaValue = dollarFormatter(Math.abs(avg))
    }
    else if(unitType == "percentage points"){
      usaValue = formatter(Math.abs(avg)) + " percentage points"
    }

    
    usaValue = "<span class = \"usa-text_" + dID + "\">" + usaValue + "</span>"

    if(formatter(avg) == "0.0"){
      usaChanged = " did not change"
    }
    else if(avg > 0){
      usaChanged = "increased " + usaValue 
    }
    else if(avg < 0){
      usaChanged = "decreased " + usaValue
    }

    return inStr
                .replace("{{" + prefix + "date-updated}}", dateUpdated)
                .replace("{{" + prefix + "date-previous}}", datePrevious)
                .replace("{{" + prefix + "usa-value}}", usaValue)
                .replace("{{" + prefix + "usa-changed}}", usaChanged)
  }
  return outStr

}

function getQuarter(q){
  var quarterNames = ["First","Second","Third","Fourth"]
  return quarterNames[Math.ceil(q/3)-1]
}

function getNiceBreaks(min,max,bins){
	function isNice(val){
		if (val%bins == 0){
			return true;
		}
		else{
			return false;
		}
	}
	breaks = {"min":null,"max":null}
	if (isNice(Math.ceil(max)-Math.floor(min))){
		breaks.min = Math.floor(min)
		breaks.max = Math.ceil(max)
	}
	else if (isNice(Math.ceil(max*2)/2 - Math.floor(min*2)/2)){
		breaks.min = Math.floor(min*2)/2
		breaks.max = Math.ceil(max*2)/2
	}
	else if (isNice(Math.ceil(max*4)/4 - Math.floor(min*4)/4)){
		breaks.min = Math.floor(min*4)/4
		breaks.max = Math.ceil(max*4)/4
	}
	else if (isNice(Math.ceil(max)+1 - Math.floor(min))){
		breaks.min = Math.floor(min)
		breaks.max = Math.ceil(max)+1
	}
	else{
		breaks.min = Math.floor(min)
		breaks.max = Math.floor(max)
	}

	return breaks
}


function drawGraphic(){
  if(getInternetExplorerVersion() != -1){
    IS_IE = true;
  }
  SMALL_SCREEN = Modernizr.mq('only all and (max-width: 990px)')
  MOBILE = Modernizr.mq('only all and (max-width: 768px)')

  $(document).keyup(function(e) {
    if (e.keyCode == 27) { d3.selectAll(".click").classed("click",false) }// escape key deselects everything
  });

  $.each(semConfig.Maps, function(dataID, config) {
      drawMapFigure(dataID, config, false)
  });
  $.each(semConfig.ScatterPlots, function(figureName, config) {
      drawScatterPlot(config, false)
  });

  d3.select("body")
  .classed("small_screen",SMALL_SCREEN)
  .classed("mobile",MOBILE)
}




drawGraphic();
window.onresize = drawGraphic;


function getInternetExplorerVersion()
// Returns the version of Internet Explorer or a -1
// (indicating the use of another browser).
{
  var rv = -1; // Return value assumes failure.
  if (navigator.appName == 'Microsoft Internet Explorer')
  {
    var ua = navigator.userAgent;
    var re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
    if (re.exec(ua) != null)
      rv = parseFloat( RegExp.$1 );
  }
  return rv;
}











