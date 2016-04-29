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
   var maintainScales = false;
   d3.csv('data/Salaries.csv', function(error, allData) {
       currentData = allData;
       // leverages module 8 exercise 3 as base code
       if (error) throw error;
       // can replace with any other xValues for reusability
        var xVals = ['BasePay', 'OvertimePay', 'OtherPay', 'Benefits'];
        // can be switched out for xVals 
        var xAlt = ['TotalPay', 'TotalPayBenefits'];
        // different options for y-values
        var yVals = ['Year', 'JobTitle'];
        
        // what the axis is sorted by
        var ySort = 'JobTitle';
        
        // switch the type of category you want default
        var category = 'NURSE';
        // scaling
        var xSort = 'TotalPayBenefits';
        var titleMap, averagedData, color;
        var xAxis, yAxis;
        // create an aggregate of similar titles
        var filterCategory = function(category) {
            titleMap = new Map();
            var newData = allData.filter(function(d) {
                var title = d[ySort].toUpperCase();
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
                                }
                                modifiedData[xVal] = parseFloat(dataVal / 100); 
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
                        value[xVal] = parseFloat(value[xVal] / value.count) * 100;
                
                    });
                    // like d3.nest, creates nested object 
                    averagedData.push({
                        key: key,
                        values: value
                    })
                });
                return newData;
            }
        
        
       function filterxVals(val) {
           var index = xVals.indexOf(val);
           
           // if no check boxes are selected, display this var
           if (xVals.indexOf(xSort) > -1) {
               xVals.splice(xVals.indexOf(xSort), 1);
                $("#totalpay").css("display", "none");   
           };
           
           // if the check mark isn't checked, remove it as a variable
           if(index > -1) {
               xVals.splice(index, 1);
               // if there's no data supplied
               // give the user the total val
               if (xVals.length == 0) {
                   xVals.push(xSort);
                   $("#totalpay").css("display", "block");
                }
           } else {
             // when checking a checkmark, add that variable back 
             xVals.push(val);
           }
           draw(currentData);
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
                .range([ "#8a89a6","#ff8c00",  "#98abc5", "#6b486b" ]);
                //["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"])
            
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
            
            var legend = svg.selectAll(".legend")
                .data(color.domain().slice().reverse())
                .enter().append("g")
                .attr("class", "legend")
                .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

            legend.append("rect")
                .attr("x", width - 18)
                .attr("width", 18)
                .attr("height", 18)
                .style("fill", color);

            legend.append("text")
                .attr("x", width - 24)
                .attr("y", 9)
                .attr("dy", ".35em")
                .style("text-anchor", "end")
                .text(function(d) { return d; });
            
        }
        
        
        var svg = d3.select('#vis')
                    .append('svg')
                    .attr('height', height + margin.top + margin.bottom)
                    .attr('width', width + margin.left + margin.right)
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var xAxisLabel = svg.append('g')
            .attr('transform', 'translate(' + margin.left + ',' + (height + margin.top) + ')')
            .attr('class', 'axis')
            .text(xAxisText);
            
        var yAxisLabel = svg.append('g')
            .attr('class', 'axis')
            .attr('transform', 'translate(' + margin.left + ',' + (margin.top) + ')')
            .text(yAxisText);
        
        var xAxisText = xAxisLabel.append('text')
                        .attr('transform', 'translate(' + (margin.left + width/2) + ',' + (height + margin.top + 40) + ')')
                        .attr('class', 'title')
        
       var yAxisText = yAxisLabel.append('text')
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
        }
   
        var setAxes = function() {
            xAxis = d3.svg.axis()
                        .scale(x)
                        .orient('bottom');
                
            yAxis = d3.svg.axis()
                        .scale(y)
                        .orient('left')
                        .tickFormat(d3.format('.2s'));
                // Call xAxis
			xAxisLabel.transition().duration(1500).call(xAxis);

			// Call yAxis
			yAxisLabel.transition().duration(1500).call(yAxis);

			// Update labels
			xAxisText.text('Job Title');
			yAxisText.text('Amount ($)');
        }
    
        var draw = function(data, adjustScales) {
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
                .data(function(d) {return d.values.types;})
                .enter().append("rect")
                .attr("width", x.rangeBand())
                .attr("y", function(d) { return y(d.y1); })
                .attr("height", function(d) { return y(d.y0) - y(d.y1); })
                .style("fill", function(d) { return color(d.name); });

        
       
        }
        //filterData();
        draw(currentData);
        /*
        d3.select("#adjustScales").on("change", function() {
            if (d3.select("#adjustScales").attr("checked")) {
                
            }
        }*/
        d3.selectAll("#jobTitles").on("submit", function() {
            d3.event.preventDefault();
            currentData = filterCategory($('#category').val().toUpperCase());
            draw(currentData);
        });
        
        d3.selectAll("input[type='checkbox']").on("change", function() {
           filterxVals(this.value); 
        });
    });
    $("rect").tooltip({
			'container': 'body',
			'placement': 'top'
		});
});
