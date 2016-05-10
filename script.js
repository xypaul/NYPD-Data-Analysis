var byMonth = [];
for (var i = 0; i < 12; i++) {
    byMonth[i] = 0;
}

var byHour = [];
for (var i = 0; i < 24; i++) {
    byHour[i] = {arrested: 0, notArrested: 0};
}


function addTitle(svg, title, width) {

    svg.append("text")
    .attr("class", "title")
    .text(title)
    .attr("text-anchor","middle")
    .attr("x", function(){
        return width/2;
    })
    .attr("y", function(){
        return -20;
    })


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

    addTitle(svg, "Number of Stops per Month", width);

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

    addTitle(svg2, "Crime count per hour of day", width);

    var graphs2 = svg2.append("g")
    .attr("class", "bars2")

    var g2 = graphs2.selectAll(".blocks")
    .data(d3.range(0,byHour.length))
    .enter().append("g")
    .attr("class", "blocks")
    .attr("transform", function(d) {
        return "translate(" + d * (width/byHour.length) + ",0)";
    });

    g2.selectAll("text")
    .data(function(d){ return [byHour[d]]; })
    .enter().append("text")
    .text(function(d){
        return d3.round(d.arrested/(d.arrested + d.notArrested)*100) + "%"
    })
    .attr("text-anchor","middle")
    .attr("x", 15)
    .attr("y", function() {
        return height;
    })

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
    .tickFormat(function(d){
        return d + "h";
    })
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



    /////////////////////////
    // Third Graph - Sankey
    /////////////////////////

    var raceCodes = {
        "B": "Black",
        "Q": "Hispanic",
        "W": "White",
        "A": "Asian",
        "I": "I",
        "P": "P",
        "Z": "Z",
        "U": "U"

    }
    var arrest = { nodes: [], links: [] }

    arrest.nodes = [
        {"name":"Arrested"},
        {"name":"Not-Arrested"}
    ];

    // Example
    // {"source":0,"target":3,"value":20}
    arrest.links = [];

    var race = d3.set();
    var connections = d3.map();

    for (var i =0; i < data.length; i++) {
        if(!race.has(data[i].race)){
            race.add(data[i].race);
        }
    }

    race = race.values();
    race.forEach(function(d, i){
        arrest.nodes.push({"name": raceCodes[d]})
    })

    for (var i =0; i < data.length; i++) {
        var key = data[i].race + "-" + data[i].arstmade;
        if(connections.has(key)){
            var item = connections.get(key);
            item.value = item.value + 1
            connections.set(key, item);
        } else {
            connections.set(key, {
                value: 1,
                source: 2 + race.indexOf(data[i].race),
                target: (data[i].arstmade == "Y" ? 0 : 1)
            });
        }
    }

    connections.forEach(function(i) {
        arrest.links.push(connections.get(i));
    })

    var svg3 = d3.select("body").append("svg")
    .attr("class", "sankey")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.left)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    addTitle(svg3, "Sankey - Arrest rate by Race", width);

    var sankey = d3.sankey()
    .size([width, height])
    .nodeWidth(15)
    .nodePadding(10)
    .nodes(arrest.nodes)
    .links(arrest.links)
    .layout(32);



    format = function(d) { return d; },
    color = d3.scale.category20();

    var path = sankey.link();

    var link = svg3.append("g").selectAll(".link")
    .data(arrest.links)
    .enter().append("path")
    .attr("class", "link")
    .attr("d", path)
    .style("stroke-width", function(d) { return Math.max(1, d.dy); })
    .sort(function(a, b) { return b.dy - a.dy; });

    link.append("title")
    .text(function(d) { return d.source.name + " → " + d.target.name + "\n" + format(d.value); });

    var node = svg3.append("g").selectAll(".node")
    .data(arrest.nodes)
    .enter().append("g")
    .attr("class", "node")
    .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
    .call(d3.behavior.drag()
    .origin(function(d) { return d; })
    .on("dragstart", function() { this.parentNode.appendChild(this); })
    .on("drag", dragmove));

    node.append("rect")
    .attr("height", function(d) { return d.dy; })
    .attr("width", sankey.nodeWidth())
    .style("fill", function(d) {
        return d.color = color(d.name);
    })
    .style("stroke", function(d) {
        return d3.rgb(d.color).darker(2);
    })
    .append("title")
    .text(function(d) { return d.name + "\n" + format(d.value); });

    node.append("text")
    .attr("x", -6)
    .attr("y", function(d) { return d.dy / 2; })
    .attr("dy", ".35em")
    .attr("text-anchor", "end")
    .attr("transform", null)
    .text(function(d) { return d.name; })
    .filter(function(d) { return d.x < width / 2; })
    .attr("x", 6 + sankey.nodeWidth())
    .attr("text-anchor", "start");

    function dragmove(d) {
        d3.select(this).attr("transform", "translate(" + d.x + "," + (d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))) + ")");
        sankey.relayout();
        link.attr("d", path);
    }


    /////////////////////////
    // Fourth graph
    /////////////////////////

    maleFemaleArrest = [
        {
            name: "Female",
            amount: 0
        },
        {
            name: "Male",
            amount: 0
        },
        {
            name: "NA",
            amount: 0
        }
    ];
    for (var i =0; i < data.length; i++) {

        if (data[i].arstmade == "Y") {
            var temp = {}
            if (data[i].sex == "M") {
                temp = maleFemaleArrest[1];
                temp.amount = temp.amount + 1;
                maleFemaleArrest[1] = temp;
            } else if (data[i].sex == "F") {
                temp = maleFemaleArrest[0];
                temp.amount = temp.amount + 1;
                maleFemaleArrest[0] = temp;
            } else {
                temp = maleFemaleArrest[2];
                temp.amount = temp.amount + 1;
                maleFemaleArrest[2] = temp;
            }
        }
    }

    var radius = Math.min(width-50, height-50) / 2;
    var color4 = d3.scale.ordinal()
    .range(["rgba(181, 0, 53, 0.7)", "rgba(14, 29, 97, 0.61)", "rgb(226, 207, 8)", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

    var arc = d3.svg.arc()
    .outerRadius(radius - 10)
    .innerRadius(0);

    var labelArc = d3.svg.arc()
    .outerRadius(radius + 5)
    .innerRadius(radius + 5);

    var pie = d3.layout.pie()
    .sort(null)
    .value(function(d) { return d.amount; });


    var svg4 = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "pie")
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    addTitle(svg4, "Stops by gender", width);

    var g4 = svg4.selectAll(".arc")
    .data(pie(maleFemaleArrest))
    .enter().append("g")
    .attr("class", "arc");

    g4.append("path")
    .attr("d", arc)
    .style("fill", function(d) {
        return color4(d.data.amount);
    });

    g4.append("text")
    .attr("transform", function(d) { return "translate(" + labelArc.centroid(d) + ")"; })
    .attr("dy", ".35em")
    .text(function(d) {
        return d.data.name;
    });


    /////////////////////////
    // 5ith Graph - Arrest Graph
    /////////////////////////

    var forceUsed = [{
            id: "pf_hands",
            name: "Hands",
            count: 0
        },{
            id: "pf_wall",
            name: "Against wall",
            count: 0
        },{
            id: "pf_grnd",
            name: "On ground",
            count: 0
        },{
            id: "pf_drwep",
            name: "Weapon drawn",
            count: 0
        },{
            id: "pf_ptwep",
            name: "Weapon pointed",
            count: 0
        },{
            id: "pf_baton",
            name: "Baton",
            count: 0
        },{
            id: "pf_hcuff",
            name: "Handcuffs",
            count: 0
        },{
            id: "pf_pepsp",
            name: "Pepper Spray",
            count: 0
        },{
            id: "pf_other",
            name: "Other",
            count: 0
        }
    ]

    var typesOfForce= ["pf_hands", "pf_wall", "pf_grnd", "pf_drwep", "pf_ptwep", "pf_baton", "pf_hcuff", "pf_pepsp", "pf_other"];

    var numberOfForceUsed = [0,0,0,0,0,0];

    for (var i =0; i < data.length; i++) {
        var tempCount = 0;
        for (var j = 0; j < typesOfForce.length; j++) {
            if (data[i][typesOfForce[j]] == "Y") {
                forceUsed[j].count += 1;
                tempCount++;
            }
        }
        if (tempCount >= 5) {
            numberOfForceUsed[5] += 1;
        } else {
            numberOfForceUsed[tempCount] += 1;
        }

    }

    // Drawing graph
    var y5 = d3.scale.linear()
    .domain([0, d3.max(forceUsed, function(d){
        return d.count;
    })])
    .range([height, 0])

    var x5 = d3.scale.linear()
    .domain([0,typesOfForce.length])
    .range([0, width])


    var svg5 = d3.select("body").append("svg")
    .attr("class", "typesOfForce")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.left)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    addTitle(svg5, "Types of force used by NYPD", width);

    var y5Axis = d3.svg.axis()
    .scale(y5)
    .ticks(8)
    .orient("left");

    svg5.append("g")
    .attr("class", "y axis")
    .call(y5Axis)

    var x5Axis = d3.svg.axis()
    .scale(x5)
    .orient("bottom")
    .innerTickSize(12)
    .tickFormat(function(d) {
        if (d < forceUsed.length) {
            return forceUsed[d].name;
        } else {
            return "";
        }
    })



    svg5.append("g")
    .attr("class", "x axis")
    .call(x5Axis)
    .attr("transform", "translate(" + 0 + "," + height + ")")
    .selectAll("text")
    .attr("x", function(){
        return x5(0.5);
    })
    .attr("y", 6)


    var graphs5 = svg5.append("g")
    .attr("class", "bars")

    // function byMonth(){
    graphs5.selectAll("rect")
    .data(forceUsed)
    .enter()
    .append("rect")
    .attr("x", function(d, i) {
        return x5(1) * i;
    })
    .attr("y", function (d) {
        return y5(d.count);
    })
    .attr("width", function(){
        return x5(1);
    })
    .attr("height", function (d) {
        return height-y5(d.count);
    })
    .on('click', function(d){
        console.log(d.count);
    })


    /////////////////////////
    // 6th Graph - Arrest Graph
    /////////////////////////
    var svg6 = d3.select("body").append("svg")
    .attr("class", "typesOfForce")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.left)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    addTitle(svg6, "Number of force types used", width);

    var graphs6 = svg6.append("g")
    .attr("class", "bars")

    var y6 = d3.scale.linear()
    .domain([0, d3.max(numberOfForceUsed)])
    .range([height, 0])

    var y6Axis = d3.svg.axis()
    .scale(y6)
    .ticks(8)
    .orient("left");

    svg6.append("g")
    .attr("class", "y axis")
    .call(y6Axis)

    var x6 = d3.scale.linear()
    .domain([0,numberOfForceUsed.length])
    .range([0, width])

    var x6Axis = d3.svg.axis()
    .scale(x6)
    .orient("bottom")
    .ticks(numberOfForceUsed.length)

    svg6.append("g")
    .attr("class", "x axis")
    .call(x6Axis)
    .attr("transform", "translate(" + 0 + "," + height + ")")
    .selectAll("text")
    .attr("x", function(){
        return x6(0.5);
    })
    .attr("y", 6)

    graphs6.selectAll("rect")
    .data(numberOfForceUsed)
    .enter()
    .append("rect")
    .attr("x", function(d, i) {
        return (x6(1)/6)+(x6(1)*i);
    })
    .attr("y", function (d) {
        return y6(d);
    })
    .attr("width", function(){
        return (2*x6(1)/3);
    })
    .attr("height", function (d) {
        return height-y6(d);
    })

    /////////////////////////
    // 7th Graph - Inside our outside
    /////////////////////////

    var insideOutside = [[0,0],[0,0]];
    for (var i =0; i < data.length; i++) {
        var key = (data[i].inout == "O")? 1 : 0;

        if (data[i].arstmade == "Y") {
            insideOutside[key][0] += 1;
        } else {
            insideOutside[key][1] += 1;
        }

    }


    var svg7 = d3.select("body").append("svg")
    .attr("class", "insideOutside")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.left)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    addTitle(svg7, "Comparing stops inside vs outside", width);


    var y7 = d3.scale.linear()
    .domain([0, d3.max(insideOutside, function(a){
        return d3.max(a)
    })])
    .range([height, 0])

    var y7Axis = d3.svg.axis()
    .scale(y7)
    .ticks(8)
    .orient("left");

    svg7.append("g")
    .attr("class", "y axis")
    .call(y7Axis)

    var x7 = d3.scale.linear()
    .domain([0,4])
    .range([0, width])

    var x7Axis = d3.svg.axis()
    .scale(x7)
    .orient("bottom")
    .ticks(0)

    svg7.append("g")
    .attr("class", "x axis")
    .call(x7Axis)
    .attr("transform", "translate(" + 0 + "," + height + ")")


    var graphs7 = svg7.append("g")
    .attr('class', 'bars')

    var group7 = graphs7.selectAll('g.group')
    .data(insideOutside)
    .enter()
    .append("g")
    .attr('class', 'group')
    .attr("transform", function(d,i){
        return "translate(" + x7(i*1.5) + "," + 0 + ")";
    })


    group7.append("text")
    .attr("x", function(){
        return x7(1);
    })
    .attr("y", function(){
        return height + 20;
    })
    .attr("text-anchor","middle")
    .text(function(d,i){
        if (i == 0) {
            return "Stopped inside";
        } else {
            return "Stopped outside";
        }
    })

    group7.selectAll("rect.arrested")
    .data(function(d){
        return [d[0]];
    })
    .enter()
    .append("rect")
    .attr('class', 'arrested')
    .attr("x", function(d, i) {
        return x7(0.5);
    })
    .attr("y", function (d) {
        return y7(d);
    })
    .attr("width", function(){
        return x7(0.5);
    })
    .attr("height", function (d) {
        return height - y7(d);
    })

    group7.selectAll("rect.notArrested")
    .data(function(d){
        return [d[1]];
    })
    .enter()
    .append("rect")
    .attr('class', 'notArrested')
    .attr("x", function(d, i) {
        return x7(1);
    })
    .attr("y", function (d) {
        return y7(d);
    })
    .attr("width", function(){
        return x7(0.5);
    })
    .attr("height", function (d) {
        return height - y7(d);
    })

    var legendInfo = [{
        cla: "arrested",
        label: "Arrested"
    },{
        cla: "notArrested",
        label: "Not arrested"
    }];


    var legend = svg7.append("g")
    .attr("attr", "legend")
    .attr("transform", function(d, i){
        return "translate(" + (width - 100) + "," + 80 + ")";
    })

    var legendItem = legend.selectAll("g.legend-item")
    .data(legendInfo)
    .enter()
    .append("g")
    .attr('class', 'legend-item')
    .attr("transform", function(d, i){
        return "translate(" + 0 + "," + 20 * i + ")";
    })

    legendItem.selectAll("rect")
    .data(function(d){
        return [d.cla];
    })
    .enter().append("rect")
    .attr("class", function(d){
        return d;
    })
    .attr("width", 20)
    .attr("height", 20)
    .attr("x", 0)
    .attr("y", 0)

    legendItem.selectAll("text")
    .data(function(d){
        return [d.label];
    })
    .enter().append("text")
    .attr("x", 30)
    .attr("y", 12)
    .text(function(d){
        return d;
    })


    // Remove loading screen
    d3.selectAll(".loading").remove()
})
