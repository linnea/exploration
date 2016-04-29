 My visual layout is an optimal choice for expressing my data because it is able to display the total salary for each position and visually represent how that total salary is divided up by base pay, overtime, benefits, and other means. I chose a divided bar chart to represent this data because it allows the user to pick apart how much each profession's salary is built upon these values, on average. The original data set has individual values, but I decided to average them in order to get a higher level view of the data.
 
 This data set was very vast set of data, so I struggled with trying to minimize the load so that it could be more easily understood. I decided to filter by occupation, so that similar job titles could be compared against one another, since that is what I wanted to show with this data. The first control is a search function, that allows you to input a keyword to search for a particular job title, and related job titles will generate the graph. This way, the user can compare the salary of similar occupations. 
 
 The second tool I implemented allowed the user to break up the data by the different parts that made up the entire salary. This way, they could analyze the specific part of the salary they were interested, and compare without distraction of the other data. For example, someone could ask, "What kind of nurse receives the most compensation in benefits on average?" and select only the "benefits" checkmark, and will be able to compare. I debated allowing the user to divide the data by year, and maintain the same scale despite removing checked portions of data. However, I think letting the scale adjust per data set will allow the user to more accurately compare parts on an individual level. 
 
 When no checkmarks are selected, the graph will display the total pay (with benefits). Since this is an average of all of the data, it gives the user a different perspective on what each occupation earns as a whole, despite what the average of each part is. I also highlighted overtime pay in a bright color, so that it would stand out as it is often the part with the smallest height. 
 
 
 Resources used:
 - module 8 exercise 3
 - https://bl.ocks.org/mbostock/3886208
 - http://bl.ocks.org/mbostock/4679202
 - https://bl.ocks.org/mbostock/1134768
 - https://dev.socrata.com/consumers/examples/simple-chart-with-d3.html