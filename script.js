var byMonth = [];
for (var i = 0; i < 12; i++) {
    byMonth[i] = 0;
}

var byHour = [];
for (var i = 0; i < 24; i++) {
    byHour[i] = {arrested: 0, notArrested: 0};
}

d3.csv("data.csv", function(error, data) {

    /////////////////////////
    // Data parsing
    /////////////////////////

    var year, month, day, hour, minute;

    // Prepare data set
    for (var i =0; i < data.length; i++) {
        if (data[i].datestop > 9999999) {
            year = data[i].datestop.toString().substr(4,4);
            month = data[i].datestop.toString().substr(0,2);
            day = data[i].datestop.toString().substr(2,2);
        } else {
            year = data[i].datestop.toString().substr(3,4);
            month = data[i].datestop.toString().substr(0,1);
            day = data[i].datestop.toString().substr(1,2);
        }

        var timeString = data[i].timestop.toString();
        hour = 0;
        if (timeString.length == 1 || timeString.length == 2) {
            minute = timeString
        } else if (timeString.length == 3) {
            hour = timeString.substr(0,1);
            minute = timeString.substr(1,3);
        } else if (timeString.length == 4) {
            hour = timeString.substr(0,2);
            minute = timeString.substr(2,4);
        }

        data[i].date = moment({y: year, M: +month - 1, d:day, h: +hour, m: +minute});



        byMonth[+month - 1] = byMonth[+month - 1] + 1;

        if (data[i].arstmade == "Y") {
            byHour[+hour].arrested = byHour[+hour].arrested + 1
        } else {
            byHour[+hour].notArrested = byHour[+hour].notArrested + 1
        }
    }

    var margin = {top: 40, right: 40, bottom: 40, left: 40};
    var width = 800 - margin.left - margin.right;
    var height = 500 - margin.top - margin.bottom;



    /////////////////////////
    // First graph
    /////////////////////////

    var svg = d3.select("body").append("svg")
        .attr("class", "graphics")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.left)
        .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    var y = d3.scale.linear()
        .domain([0, d3.max(byMonth)])
        .range([height, 0])

    var minDate = new Date(2015,0,1);
    var maxDate = new Date(2016,0,1);
    var x = d3.time.scale()
        .domain([minDate, maxDate])
        .range([0, width])

    var yAxis = d3.svg.axis()
        .scale(y)
        .ticks(8)
        .orient("right");

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .attr("transform", "translate(" + width + "," + 0 + ")");


    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    svg.append("g")
        .attr("class", "x axis")
        .call(xAxis)
        .attr("transform", "translate(" + 0 + "," + height + ")");

    var graphs = svg.append("g")
        .attr("class", "bars")

    // function byMonth(){
    graphs.selectAll("rect")
        .data(byMonth)
        .enter()
        .append("rect")
            .attr("x", function(d, i) {
                return (width/12) * i;
            })
            .attr("y", function (d) {
                return y(d);
            })
            .attr("width", function(){
                return width/12
            })
            .attr("height", function (d) {
                return height-y(d);
            })
            .on('click', function(d){
                console.log(d);
            })

    /////////////////////////
    // Second graph
    /////////////////////////


    var y2, x2;
    function setupRange() {
        y2 = d3.scale.linear()
            .domain([0, d3.max(byHour, function(d){
                return d.arrested + d.notArrested;
            })])
            .range([height, 0])

        x2 = d3.scale.linear()
            .domain([0,24])
            .range([0, width])
    }
    setupRange();


    var svg2 = d3.select("body").append("svg")
        .attr("class", "graphics")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.left)
        .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var graphs2 = svg2.append("g")
        .attr("class", "bars2")

    var g2 = graphs2.selectAll(".blocks")
        .data(d3.range(0,byHour.length))
        .enter().append("g")
            .attr("class", "blocks")
            .attr("transform", function(d) {
                return "translate(" + d * (width/byHour.length) + ",0)";
            });

    g2.selectAll("rect.arrested")
        .data(function(d){ return [byHour[d]]; })
        .enter().append("rect")
          .attr("class", "arrested")
          .attr("x", 0)
          .attr("width", function(){
              return width/byHour.length
          })
          .attr("y", function(val) {
              return y2(val.notArrested) - (height - y2(val.arrested));
          })
          .attr("height", function(val) {
              return height - y2(val.arrested);
          });
      g2.selectAll("rect.notArrested")
          .data(function(d){ return [byHour[d]]; })
          .enter().append("rect")
            .attr("class", "notArrested")
            .attr("x", 0)
            .attr("width", function(){
                return width/byHour.length
            })
            .attr("y", function(val) {
                return y2(val.notArrested);
            })
            .attr("height", function(val) {
                return height - y2(val.notArrested);
            });

        var x2Axis = d3.svg.axis()
            .scale(x2)
            .orient("bottom");

        svg2.append("g")
            .attr("class", "x axis")
            .call(x2Axis)
            .attr("transform", "translate(" + 0 + "," + height + ")");

        var y2Axis = d3.svg.axis()
            .scale(y2)
            .orient("left");

        svg2.append("g")
            .attr("class", "y axis")
            .call(y2Axis)




    debugger;
            //     .attr("x", function(d, i) {
            //         return (width/12) * i;
            //     })
            //     .attr("y", function (d) {
            //         return y(d);
            //     })
            //     .attr("width", function(){
            //         return width/12
            //     })
            //     .attr("height", function (d) {
            //         return y(d);
            //     })
            //     .style("fill", "orange")
            //     .on('click', function(d){
            //         console.log(d);
            //     })
            // .append("rect")
            //     .attr("x", function(d, i) {
            //         return (width/12) * i;
            //     })
            //     .attr("y", function (d) {
            //         return y(d);
            //     })
            //     .attr("width", function(){
            //         return width/12
            //     })
            //     .attr("height", function (d) {
            //         return height-y(d);
            //     })
            //     .on('click', function(d){
            //         console.log(d);
            //     })


})
