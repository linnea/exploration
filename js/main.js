/* Creates a divided bar chart that can be filtered with different values for x and y. 
   Ability to switch out variables "Year" and "Title" for x-val (1 x-value maximum), and
   "BasePay", "OvertimePay", "OtherPay", and "Benefits", or to switch out everything and 
   order by total only. 
   
   This way, x-values can be switched out on a different scale
   
   To use, you must specify which variables can be used as x variables and y variables
   through the variables xVals, and yVals, which are string arrays.
   
   Set up for ordinal x-values, and ratio y-values.
   */

$(function() { 
   var currentData;
   d3.csv('data/Salaries.csv', function(error, allData) {
       // leverages module 8 exercise 3 as base code
       if (error) throw error;
        var xVals = ['BasePay', 'OvertimePay', 'OtherPay', 'Benefits'];
        var xAlt = ['TotalPay', 'TotalPayBenefits'];
        var yVals = ['Year', 'JobTitle'];
        var ySort = 'JobTitle';
        
        // switch the type of category you want
        var category = 'NURSE';
        var xSort = 'TotalPay';
        var titleMap, averagedData, color;
        var xAxis, yAxis;
        // create an aggregate of similar titles
        var filterCategory = function(category) {
            titleMap = new Map();
            var newData = allData.filter(function(d) {
                var title = d['JobTitle'].toUpperCase();
                if(title.indexOf(category) > -1) {
                        if(titleMap.has(title)) {
                            var value = titleMap.get(title);
                            // average the title's data
                            xVals.forEach(function(xVal) {
                                var dataVal = value[xVal];
                                if (isNaN(value[xVal])) {
                                    dataVal = 0;
                                }
                                if (xVal && d[xVal]) {
                                value[xVal] = parseFloat(dataVal) + (parseFloat(d[xVal] / 100));
                                }
                            });
                            value.count++;    
                        } else {
                            // minimize the input so that int doesn't explode
                            var modifiedData = d;
                            xVals.forEach(function(xVal) {
                                var dataVal = d[xVal];
                                if (isNaN(d[xVal])) {
                                    dataVal = 0;
                                } else {
                                modifiedData[xVal] = parseFloat(d[xVal] / 100); 
                                }
                            });
                            modifiedData.count = 1;
                            titleMap.set(title, modifiedData);
                        }
                        return d;
                    }
                });
                averagedData = [];
                // average out each item
                titleMap.forEach(function(value, key, map) {
                    xVals.forEach(function(xVal) {
                        value[xVal] = (value[xVal] / value.count) * 100;
                
                    });
                    // like d3.nest, creates nested object 
                    averagedData.push({
                        key: key,
                        values: value
                    })
                });
                return newData;
            }
        
        // include only category results
       var currentData = filterCategory(category);
       var margin = {
            left:70,
            bottom:300,
            top:50,
            right:50,
        };
                
        var height = 800 - margin.bottom - margin.top;
        var width = 1000 - margin.left - margin.right;
        var x = d3.scale.ordinal()
                    .rangeRoundBands([0, width], .1);
                    
        var y = d3.scale.linear()
                    .rangeRound([height, 0]);
                    
        function setColor(data) {
            color = d3.scale.ordinal()
                .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);
            
            color.domain(d3.keys(data[0]).filter(function(key) {
            if (xVals.indexOf(key) > -1) {
                return key;
            }
            }));

            titleMap.forEach(function (item) {
                var y0 = 0;
                item.types = color.domain().map(function (key) {
                    var val = item[key] 
                    if (!item[key]) {
                    val = 0;
                    }
                    
                    return {
                        name: key,
                        y0: y0,
                        y1: y0 += +val
                    };
                    
                });
            
                item.total = item.types[item.types.length - 1].y1;
            });
        }
        
        
        var svg = d3.select('#vis')
                    .append('svg')
                    .attr('height', height + margin.top + margin.bottom)
                    .attr('width', width + margin.left + margin.right)
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var xAxisLabel = svg.append('g')
            .attr('transform', 'translate(' + margin.left + ',' + (height + margin.top) + ')')
            .attr('class', 'axis');
            
        var yAxisLabel = svg.append('g')
            .attr('class', 'axis')
            .attr('transform', 'translate(' + margin.left + ',' + (margin.top) + ')');
        
        var xAxisText = svg.append('text')
                        .attr('transform', 'translate(' + (margin.left + width/2) + ',' + (height + margin.top + 40) + ')')
                        .attr('class', 'title')
        
        var yAxisText = svg.append('text')
            .attr('transform', 'translate(' + (margin.left - 40) + ',' + (margin.top + height/2) + ') rotate(-90)')
            .attr('class', 'title');
            
        var setScales = function(data, xSort, ySort) {
            // initialized with year
            x.domain(data.map(function(d) {
                    return d[ySort].toUpperCase();
            }));
            
            // initialized with 
            y.domain([0, d3.max(data, function(d) {
                return d.total;
            })]);
            
            /*
            layers = d3.layout.stack()(xVals.map(function(key) {
                return data.map(function(d) {
                    return { 
                        // automatically sort by first y option
                        x: eval("d." + ySort),
                        y: d[key]
                    };
                });
            }));
            
            var layer = svg.selectAll(".layer")
                .data(layers)
                .enter().append("g")
                .attr("class", "layer")
                .style("fill", function(d, i) { return color(i); });
            
            layer.selectAll("rect")
                .data(data)
                .enter().append("rect")
                .attr("x", function(d) {return x(d.x);})
                .attr("y", function(d) {return y(d.y + d.y0);})
                .attr("height", function(d) {return y(d.y0) - y(d.y + d.y0); })
                .attr("width", x.rangeBand() - 1);
            
            xVals.forEach(function(x) {
                var xData = data.map(function(d) {return eval('d.' + x)})
                console.log(xData, x);
                var newX = {
                    data: xData,
                    scale: d3.scale.ordinal().rangeBands([0, width], .2).domain(xData)
                }
                xVariables.push(newX);
            });*/
            
            /*
            // automatically set to the first element passed
            xScale = d3.scale.ordinal().rangeBands([0, width], .2).domain(xVariables);
            console.log(xVariables);
            
            yMax = 0; 
            // check if other yvals change the min/max
            yVals.forEach(function(y) {
                var max = d3.max(data, function(d){return eval("+d." + y)});
                if (max > yMax) {
                    yMax = max;
                }
            });
            yScale = d3.scale.linear().range([height, 0]).domain([0, yMax]);
        */
        }
   
        var setAxes = function() {
            xAxis = d3.svg.axis()
                        .scale(x)
                        .orient('bottom');
                
            yAxis = d3.svg.axis()
                        .scale(y)
                        .orient('left')
                        .tickFormat(d3.format('.2s'));
        }
    
        var draw = function(data) {
            d3.selectAll('svg > g > *').remove();
            setColor(data);
            setScales(data, xSort, ySort);
            setAxes();
            
            svg.append("g")
                .attr("class", "x-axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis)
                .selectAll("text")	
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", function(d) {
                    return "rotate(-65)" 
                    });
                
            svg.append("g")
                .attr("class", "y axis")
                .call(yAxis);
                
            var dataElem = svg.selectAll("." + ySort)
                .data(averagedData)
                .enter().append("g")
                .attr("class", "g")
                .attr("transform", function (d) {
                return "translate(" + x(d.values[ySort].toUpperCase()) + ",0)";
            });
            
            dataElem.selectAll("rect")
                .data(function(d) {console.log(d);return d.values.types;})
                .enter().append("rect")
                .attr("width", x.rangeBand())
                .attr("y", function(d) { return y(d.y1); })
                .attr("height", function(d) { return y(d.y0) - y(d.y1); })
                .style("fill", function(d) { return color(d.name); });

            /*
            var bars = g.selectAll('rect').data(data);
            
            bars.enter().append('rect')
                    .attr('x', function(d){return xScale(xVals[0])})
                    .attr('y', height)
                    .attr('height', 0)
                    .attr('width', xScale.rangeBand())
                    .attr('class', 'bar')
                    .attr('title', function(d) {return "This is a Title"});
                    
                bars.exit().remove()
                bars.transition()
                        .duration(1500)
                        .delay(function(d,i){return i*50})
                        .attr('x', function(d){return xScale(d.JobTitle)})
                        .attr('y', function(d){return yScale(d.TotalPay)})
                        .attr('height', function(d) {return height - yScale(eval("d." + yVals[0]))})
                        .attr('width', xScale.rangeBand())
                        .attr('title', function(d) {return "This is a title"});
        */
        }
        //filterData();
        draw(currentData);
        d3.selectAll("#jobTitles").on("submit", function() {
            console.log("I did it.");
            d3.event.preventDefault();
            var newData = filterCategory($('#category').val().toUpperCase());
            draw(newData);
        });
    });
    $("rect").tooltip({
			'container': 'body',
			'placement': 'top'
		});
        
    

});


function categorySearch() {
    console.log("working");
    filterData($('#category'));
}


function updateDisplay() {
    
}