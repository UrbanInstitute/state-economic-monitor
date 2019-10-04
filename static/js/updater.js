const charMax = 100;
const hardMax = 150;
const charMin = 20;

function encodeHtmlEntity(str){
  var buf = [];
  for (var i=str.length-1;i>=0;i--) {
    buf.unshift(['&#', str[i].charCodeAt(), ';'].join(''));
  }
  return buf.join('');
}



function isQuarterly(indicator){
  return (indicator == "house_price_index" || indicator == "state_gdp")
}

function dispDate(date, indicator){
  var year = +date.split("-")[0],
      month = +date.split("-")[1],
      quarterly = isQuarterly(indicator)

  if(quarterly){
    return "Q" + ((month-1)/3 + 1) + " " + year
  }else{
    return month + "/" + year
  }

}

function buildCards(cards, init){
    d3.selectAll(".draggableCard").remove()

    var card = d3.select("#cardContainer")
      .selectAll("li")
      .data(cards)
      .enter()
      .append("li")
      .attr("class","ui-state-default draggableCard")

    card.append("div")
      .attr("class","updaterCardRow chartType")
      .html(function(d){
        var chartType = (d.hasOwnProperty("startDate")) ? "Line" : "Bar"
        return "<span>Chart type:</span> " + chartType
      })

    card.append("div")
      .attr("class","updaterCardRow indicator")
      .html(function(d){
        return "<span>Indicator:</span> " + d.indicator
      })

    card.append("div")
      .attr("class","updaterCardRow unit")
      .html(function(d){
        var displayUnit = (d.unit == "raw") ? "Raw value" : "Yoy % change"
        return "<span>Unit:</span> " + displayUnit
      })



    card.append("div")
      .attr("class","updaterCardRow dates")
      .html(function(d){
        return (d.hasOwnProperty("startDate")) ? "<span>Date range:</span> " +  dispDate(d.startDate, d.indicator) + " to " + dispDate(d.endDate, d.indicator) :
        "<span>Date:</span> " +  dispDate(d.endDate, d.indicator)
        
      })

    card.append("div")
      .attr("class","updaterCardRow states")
      .html(function(d){
        var descText = (d.hasOwnProperty("startDate")) ? "<span>States displayed: </span>" : "<span>States highlighted: </span>"
        if(d.states.filter(function(s){ return s != "US" }).length == 0){
          return descText + "None"
        }else{
          return descText + d.states.filter(function(s){ return s != "US" }).join(", ")
        }
        
      })

    card.append("div")
      .attr("class","updaterCardRow text")
      .html(function(d){
        return "<span>Card text:</span> " + d.text
      })

    card.append("div")
      .attr("class","cardDelete")
      .text("Delete card")
      .on("click", function(){
        d3.select(this.parentNode).remove()
      })

    if(init){
      $( function() {
        $( "#cardContainer" ).sortable({ grid: [ 20, 10 ] });
        $( "#cardContainer" ).disableSelection();
      } );
    }else{
      $( "#cardContainer" ).sortable("refresh")
    }

}

$(function() {
  var today = new Date,
      thisYear = today.getFullYear()

  d3.json(pathPrefix + "static/data/cards/cards.json").then(function(cards){
    buildCards(cards, true)
  })

  $('.select-indicator').selectize({
    onChange: function(value){
      var chartType = (d3.select(".controlButton.chartType.active").classed("line")) ? "line" : "bar"

      d3.selectAll(".controlContainer").classed("hide", false)
      d3.select(".selectize-control.select-indicator .selectize-input").classed("error", false)
    
      if(chartType == "bar"){
        d3.selectAll(".controlContainer.start").classed("hide", true)
        d3.selectAll(".controlContainer.end .controlLabel").text("Date")
      }else{
        d3.selectAll(".controlContainer.start").classed("hide", false)
        d3.selectAll(".controlContainer.end .controlLabel").text("End date")
      }

      if (isQuarterly(value)){
        d3.selectAll(".controlContainer.monthly").classed("hide", true)
      }else{
        d3.selectAll(".controlContainer.quarterly").classed("hide", true)
      }


    }
  });


  $('.select-startMonth').selectize({
    onChange: function(value){
      d3.select(".selectize-control.select-startMonth .selectize-input").classed("error", false)
    }
  });

  $('.select-endMonth').selectize({
    onChange: function(value){
      d3.select(".selectize-control.select-endMonth .selectize-input").classed("error", false)
    }
  });

  $('.select-startQ').selectize({
    onChange: function(value){
      d3.select(".selectize-control.select-startQ .selectize-input").classed("error", false)
    }
  });

  $('.select-endQ').selectize({
    onChange: function(value){
      d3.select(".selectize-control.select-endQ .selectize-input").classed("error", false)
    }
  });

  $('.select-state').selectize({
  });


  d3.selectAll(".chartType.controlButton").on("click", function(){
    d3.selectAll(".chartType").classed("active", false)
    d3.select(this).classed("active", true)
    d3.selectAll(".controlContainer").classed("hide", false)
    var indicator = $("select.select-indicator").val()

    if(d3.select(this).classed("bar")){
      d3.selectAll(".controlContainer.start").classed("hide", true)
      d3.selectAll(".controlContainer.end .controlLabel").text("Date")
    }else{
      d3.selectAll(".controlContainer.start").classed("hide", false)
      d3.selectAll(".controlContainer.end .controlLabel").text("End date")
    }

    if (isQuarterly(indicator)){
      d3.selectAll(".controlContainer.monthly").classed("hide", true)
    }else{
      d3.selectAll(".controlContainer.quarterly").classed("hide", true)
    }
  })

  d3.selectAll(".unitType.controlButton").on("click", function(){
    d3.selectAll(".unitType.controlButton").classed("active", false).classed("error", false)
    d3.select(this).classed("active", true)
  })

  d3.selectAll(".yearInput").on("input", function(){
    if(+this.value > thisYear || +this.value < 1976 ){
      d3.select(this).classed("error", true)
      d3.select(this.parentNode.parentNode).select(".invalidText").classed("hide", false)
    }else{
      d3.select(this).classed("error", false)
      d3.select(this.parentNode.parentNode).select(".invalidText").classed("hide", true)
    }
  })

  d3.select("#cardText").on("input", function(){
    //search for text not inside html tags (between < and >). Then use external library to encode each character
    //as html entity. Tags and text inside tags (e.g. ampersands in URLs) are not encoded
    var unencodedText = this.value
    var encodedText = unencodedText.replace(/([^\<\>])(?=(((?!\>).)*\<)|[^\<\>]*$)/g, function(g1){
      return he.encode(g1)
    })

    //get character length by building hidden div using text with markup, then grabbing the markup free text length
    d3.select("#hiddenText").html(encodedText)
    var charCount = d3.select("#hiddenText").text().length
    d3.select(".charCount span").text(charMax - charCount)
  
    d3.select(".charCount").classed("softError", false)
    d3.select(".controlContainer.text").classed("softError", false)
    d3.select(".charCount").classed("error", false)
    d3.select(".controlContainer.text").classed("error", false)

    if(charCount > charMax && charCount <= hardMax){
      d3.select(".charCount").classed("softError", true)
      d3.select(".controlContainer.text").classed("softError", true)
    }
    else if(charCount > hardMax){
      d3.select(".charCount").classed("error", true)
      d3.select(".controlContainer.text").classed("error", true)
    }
  })


  d3.select(".bigButton.addCard").on("click", function(){
    var currentCards = d3.selectAll(".draggableCard").data()
    var cd = {}
    var indicator = $("select.select-indicator").val(),
        chartType = (d3.select(".controlButton.chartType.active").classed("line")) ? "line" : "bar",
        startMonth = $("select.select-startMonth").val(),
        endMonth = $("select.select-endMonth").val(),
        startQuarter = $("select.select-startQ").val(),
        endQuarter = $("select.select-endQ").val(),
        startYearMonthly = $(".controlContainer.start.monthly input.year").val(),
        endYearMonthly = $(".controlContainer.end.monthly input.year").val(),
        startYearQuarterly = $(".controlContainer.start.quarterly input.year").val(),
        endYearQuarterly = $(".controlContainer.end.quarterly input.year").val(),
        sm = "",
        sy = "",
        em = "",
        ey = "",
        states = $("select.select-state").val();


    if(indicator == ""){
      d3.select(".selectize-control.select-indicator .selectize-input").classed("error", true)
      d3.select("#addCardError").style("opacity",1)
    }else{
      cd.indicator = indicator
    }


    if(d3.selectAll(".unitType.controlButton.active").nodes().length == 0){
      d3.selectAll(".unitType.controlButton").classed("error", true)
      d3.select("#addCardError").style("opacity",1)
    }else{
      if(d3.select(".unitType.controlButton.active").classed("raw")) cd.unit = "raw"
      else cd.unit = "change"
    }

    if(states == null){
      d3.select("select.select-state").classed("softError", true)
    }else{
      d3.select("select.select-state").classed("softError", false)
    }


    if(isQuarterly(indicator)){  
      if(endQuarter == ""){
        d3.select(".selectize-control.select-endQ .selectize-input").classed("error", true)
      }else{
        em = ('0' + (((+endQuarter - 1) *3 ) + 1)).slice(-2)
        d3.select(".controlContainer.end.quarterly .invalidText").classed("hide", true)
      }
      if(+endYearQuarterly > thisYear || +endYearQuarterly < 1976 ){
        d3.select(".controlContainer.end.quarterly input.year").classed("error", true)
        d3.select(".controlContainer.end.quarterly .invalidText").classed("hide", false)
      }else{
        ey = endYearQuarterly
      }
      if(chartType == "line"){
        if(startQuarter == ""){
          d3.select(".selectize-control.select-startQ .selectize-input").classed("error", true)
        }else{
          sm = ('0' + (((+startQuarter - 1) *3 ) + 1)).slice(-2)
          d3.select(".controlContainer.start.quarterly .invalidText").classed("hide", true)
        }
        if(+startYearQuarterly > thisYear || +startYearQuarterly < 1976 ){
          d3.select(".controlContainer.start.quarterly input.year").classed("error", true)
          d3.select(".controlContainer.start.quarterly .invalidText").classed("hide", false)
        }else{
          sy = startYearQuarterly
        }
      }

    }else{
      if(endMonth == ""){
        d3.select(".selectize-control.select-endMonth .selectize-input").classed("error", true)
      }else{
        em = ("0" + endMonth).slice(-2)
        d3.select(".controlContainer.end.monthly .invalidText").classed("hide", true)
      }
      if(+endYearMonthly > thisYear || +endYearMonthly < 1976 ){
        d3.select(".controlContainer.end.monthly input.year").classed("error", true)
        d3.select(".controlContainer.end.monthly .invalidText").classed("hide", false)
      }else{
        ey = endYearMonthly
      }
      if(chartType == "line"){
        if(startMonth == ""){
          d3.select(".selectize-control.select-startMonth .selectize-input").classed("error", true)
        }else{
          sm = ("0" + startMonth).slice(-2)
          d3.select(".controlContainer.start.monthly .invalidText").classed("hide", true)
        }
        if(+startYearMonthly > thisYear || +startYearMonthly < 1976 ){
          d3.select(".controlContainer.start.monthly input.year").classed("error", true)
          d3.select(".controlContainer.start.monthly .invalidText").classed("hide", false)
        }else{
          sy = startYearMonthly
        }
      }
    }

    if(chartType == "line"){
      cd.startDate = sy + "-" + sm + "-01"
    }


    cd.endDate = ey + "-" + em + "-01"
    cd.states = (states == null) ? ["US"] : ["US"].concat(states)
    cd.text = d3.select("#hiddenText").html()

    var charCount = d3.select("#hiddenText").text().length

    if( indicator != ""
        && d3.selectAll(".unitType.controlButton.active").nodes().length != 0
        && (
            (chartType == "line" && sm != "" && sy != "" && em != "" && ey != "")
            ||
            (chartType != "line" && em != "" && ey != "")
           )
      ){
        var charCount = d3.select("#hiddenText").text().length
        if(charCount < charMin){
          window.alert("Card text must (not including html tags) must be a minimum of " + charMin + " characters long. Please update then click the \"Add card\" button again.")
          d3.select(".charCount").classed("error", true)
          d3.select(".controlContainer.text").classed("error", true)
        }
        else if(charCount > charMax && charCount <= hardMax){
          if(window.confirm("Your card text is over the suggested maximum of " + charMax + " characters, but under the hard maximum of " + hardMax + " characters. Click \"OK\" to add this card (but make sure to check how it looks in the preview), or click \"Cancel\" to edit the text.")){
              currentCards.unshift(cd)
              buildCards(currentCards, false)

          }
        }
        else if(charCount > hardMax){
          window.alert("Card text must (not including html tags) must be a maximum of " + hardMax + " characters long. Please update then click the \"Add card\" button again.")
        }else{
          if(states == null){
            if(window.confirm("You have selected no states. On a bar chart no states will be higlighted, and on a line chart no lines will be drawn (except in some cases the US line). Click \"OK\" to add this card (but make sure to check how it looks in the preview), or click \"Cancel\" to edit the text.")){
                currentCards.unshift(cd)
                buildCards(currentCards, false)
            }
          }else{
            currentCards.unshift(cd)
            buildCards(currentCards, false)
          }
        }


    }else{
      window.alert("Cards must include the required values highlighted in red. Please update then click the \"Add card\" button again.")
    }



  })


  $('#file-federal_public_employment-button').change(function() {
      var form_data = new FormData($('#upload-federal_public_employment')[0]);
      $.ajax({
          type: 'POST',
          url: '/semapp/upload?sheet=federal_public_employment',
          data: form_data,
          contentType: false,
          cache: false,
          processData: false,
          success: function(data) {
              $("#federal_public_employment-status")
                .css("opacity",1)
                .text("Federal public employment data uploaded")
          },
          fail: function(e){
            alert("Something went wrong uploading the file, try reloading the page and trying again")
          }
      });
  });

  $('#file-house_price_index-button').change(function() {
      var form_data = new FormData($('#upload-house_price_index')[0]);
      $.ajax({
          type: 'POST',
          url: '/semapp/upload?sheet=house_price_index',
          data: form_data,
          contentType: false,
          cache: false,
          processData: false,
          success: function(data) {
              $("#house_price_index-status")
                .css("opacity",1)
                .text("HPI data uploaded")
          },
          fail: function(e){
            alert("Something went wrong uploading the file, try reloading the page and trying again")
          }
      });
  });

  $('#file-private_employment-button').change(function() {
      var form_data = new FormData($('#upload-private_employment')[0]);
      $.ajax({
          type: 'POST',
          url: '/semapp/upload?sheet=private_employment',
          data: form_data,
          contentType: false,
          cache: false,
          processData: false,
          success: function(data) {
              $("#private_employment-status")
                .css("opacity",1)
                .text("Private employment data uploaded")
          },
          fail: function(e){
            alert("Something went wrong uploading the file, try reloading the page and trying again")
          }
      });
  });

  $('#file-public_employment-button').change(function() {
      var form_data = new FormData($('#upload-public_employment')[0]);
      $.ajax({
          type: 'POST',
          url: '/semapp/upload?sheet=public_employment',
          data: form_data,
          contentType: false,
          cache: false,
          processData: false,
          success: function(data) {

              $("#public_employment-status")
                .css("opacity",1)
                .text("Public employment data uploaded")
          },
          fail: function(e){
            alert("Something went wrong uploading the file, try reloading the page and trying again")
          }
      });
  });

  $('#file-state_and_local_public_employment-button').change(function() {
      var form_data = new FormData($('#upload-state_and_local_public_employment')[0]);
      $.ajax({
          type: 'POST',
          url: '/semapp/upload?sheet=state_and_local_public_employment',
          data: form_data,
          contentType: false,
          cache: false,
          processData: false,
          success: function(data) {
              $("#state_and_local_public_employment-status")
                .css("opacity",1)
                .text("State and local employment data uploaded")
          },
          fail: function(e){
            alert("Something went wrong uploading the file, try reloading the page and trying again")
          }
      });
  });

  $('#file-state_gdp-button').change(function() {
      var form_data = new FormData($('#upload-state_gdp')[0]);
      $.ajax({
          type: 'POST',
          url: '/semapp/upload?sheet=state_gdp',
          data: form_data,
          contentType: false,
          cache: false,
          processData: false,
          success: function(data) {
              $("#state_gdp-status")
                .css("opacity",1)
                .text("State GDP data uploaded")
          },
          fail: function(e){
            alert("Something went wrong uploading the file, try reloading the page and trying again")
          }
      });
  });

  $('#file-total_employment-button').change(function() {
      var form_data = new FormData($('#upload-total_employment')[0]);
      $.ajax({
          type: 'POST',
          url: '/semapp/upload?sheet=total_employment',
          data: form_data,
          contentType: false,
          cache: false,
          processData: false,
          success: function(data) {
              $("#total_employment-status")
                .css("opacity",1)
                .text("Total employment data uploaded")
          },
          fail: function(e){
            alert("Something went wrong uploading the file, try reloading the page and trying again")
          }
      });
  });

  $('#file-unemployment_rate-button').change(function() {
      var form_data = new FormData($('#upload-unemployment_rate')[0]);
      $.ajax({
          type: 'POST',
          url: '/semapp/upload?sheet=unemployment_rate',
          data: form_data,
          contentType: false,
          cache: false,
          processData: false,
          success: function(data) {
              $("#unemployment_rate-status")
                .css("opacity",1)
                .text("Unemployment rate data uploaded")
          },
          fail: function(e){
            alert("Something went wrong uploading the file, try reloading the page and trying again")
          }
      });
  });

  $('#file-weekly_earnings-button').change(function() {
      var form_data = new FormData($('#upload-weekly_earnings')[0]);
      $.ajax({
          type: 'POST',
          url: '/semapp/upload?sheet=weekly_earnings',
          data: form_data,
          contentType: false,
          cache: false,
          processData: false,
          success: function(data) {
              $("#weekly_earnings-status")
                .css("opacity",1)
                .text("Earnings data uploaded")
          },
          fail: function(e){
            alert("Something went wrong uploading the file, try reloading the page and trying again")
          }
      });
  });

  $('#file-state_and_local_public_education_employment-button').change(function() {
      var form_data = new FormData($('#upload-state_and_local_public_education_employment')[0]);
      $.ajax({
          type: 'POST',
          url: '/semapp/upload?sheet=state_and_local_public_education_employment',
          data: form_data,
          contentType: false,
          cache: false,
          processData: false,
          success: function(data) {
              $("#state_and_local_public_education_employment-status")
                .css("opacity",1)
                .text("Education data uploaded")
          },
          fail: function(e){
            alert("Something went wrong uploading the file, try reloading the page and trying again")
          }
      });
  });




$('.addIngredient').bind('click', function() {
  d3.select("#loading").style("visibility", "visible")
  d3.select("#loading-text").html("Updating (this takes about a minute)&hellip;")
$.ajax({
type: 'POST',
url: '/semapp/add',
data: JSON.stringify(d3.selectAll(".draggableCard").data()),
dataType: 'json',
contentType: 'application/json; charset=utf-8',
// cache: false,
// processData: true,
success: function(data) {
d3.select("#loading").style("visibility", "hidden")
d3.select("#loading-text").text("Updated! Preview opening in new tab (you may need to enable popups).")
var win = window.open('/semapp/preview', '_blank');
if(win){
//Browser has allowed it to be opened
win.focus();
}else{
//Broswer has blocked it
if (window.confirm('Pop ups not enabled. Click OK to continue to the SEM preview')) 
{
window.location.href='/semapp/preview';
};

}
},
error: function(e){
console.log(e);
}
}); 

});



});

