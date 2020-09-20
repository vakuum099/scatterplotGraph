"use strict"
/*User Story #1: I can see a title element that has a corresponding id="title".

User Story #2: I can see an x-axis that has a corresponding id="x-axis".

User Story #3: I can see a y-axis that has a corresponding id="y-axis".

User Story #4: I can see dots, that each have a class of dot, which represent the data being plotted.

User Story #5: Each dot should have the properties data-xvalue and data-yvalue containing their corresponding x and y values.

User Story #6: The data-xvalue and data-yvalue of each dot should be within the range of the actual data and in the correct data format. 
For data-xvalue, integers (full years) or Date objects are acceptable for test evaluation. For data-yvalue (minutes), use Date objects.

User Story #7: The data-xvalue and its corresponding dot should align with the corresponding point/value on the x-axis.

User Story #8: The data-yvalue and its corresponding dot should align with the corresponding point/value on the y-axis.

User Story #9: I can see multiple tick labels on the y-axis with %M:%S time format.

User Story #10: I can see multiple tick labels on the x-axis that show the year.

User Story #11: I can see that the range of the x-axis labels are within the range of the actual x-axis data.

User Story #12: I can see that the range of the y-axis labels are within the range of the actual y-axis data.

User Story #13: I can see a legend containing descriptive text that has id="legend".

User Story #14: I can mouse over an area and see a tooltip with a corresponding id="tooltip" which displays more information about the area.

User Story #15: My tooltip should have a data-year property that corresponds to the data-xvalue of the active area.

Here is the dataset you will need to complete this project:
 https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json

You can build your project by forking this CodePen pen. https://codepen.io/freeCodeCamp/pen/MJjpwO
*/

const formatYear = d3.timeFormat('%Y');
const formatMonth = d3.timeFormat('%B');
const h = 700;
const w = 1500;
const padding = 60;
const rangeColor = [ ['very cold', 'blue', 50, 0], ['cold', 'cyan', 50, 50], ['hot', 'yellow', 50, 100], ['very\nhot', 'red', 50, 150] ];

let baseTemp;

const mySvg = d3.select("body")
	.append("svg")
	.attr("height", h)
	.attr("width", w)
	
const req = new XMLHttpRequest();
req.open("GET", "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json", true);
req.send();
req.onload = main;

function main() {
	const d = JSON.parse(req.responseText);
	baseTemp = d.baseTemperature;
	const dataset = d.monthlyVariance.map(e => {
						e.year = new Date(e.year, 0);
						let month = e.month;
						e.month = new Date('1970', month - 1);
						e.numberDays = function () {
							let tempDate = new Date('1970', month, 0);
							return tempDate.getDate();
						}();
						return e;
	});

	const maxYear = d3.max(dataset, d => d.year);
	const minYear = d3.min(dataset, d => d.year);
	const maxMonth = new Date ('1970', 11, 31);
	const minMonth = new Date ('1970', 0, 1);
	const maxVariance = d3.max(dataset, d => d.variance);
	const minVariance = d3.min(dataset, d => d.variance);
	
	const xScale = d3.scaleTime()
					.domain([minYear, maxYear])
					.range([padding, w])
	const yScale = d3.scaleTime()
					.domain([maxMonth, minMonth])
					.range([h - padding , padding]);

	mySvg.selectAll('rect')
		.data(dataset)
		.enter()
		.append('rect')
		.attr('class', 'cell')
		
		.attr('data-month', d => formatMonth(d.month))
		.attr('data-year', d => formatYear(d.year))
		.attr('data-temp', d => d.variance + dataset.baseTemperature)
		.attr('fill', d => d.variance > 0 ?
							d.variance > maxVariance*0.5 ?
							"red" : "yellow" : d.variance < minVariance*0.5 ?
							"blue" : "cyan")

		.attr("x", d => xScale(d.year))
		.attr("y", d => yScale(d.month))
		.attr("height", d => ( (h-2*padding)/365*d.numberDays ))
		.attr("width", 5)
		
		.on('mouseover', handleMouseOver)
		.on('mouseout', handleMouseOut);

	const xAxis = d3.axisBottom(xScale)
					.tickFormat(formatYear);
	
	const yAxis = d3.axisLeft(yScale)
					.tickFormat(formatMonth);
	
	mySvg.append('g')
		.attr('id', 'x-axis')
		.attr('transform', 'translate(0, ' + (h - padding) + ')')
		.call(xAxis);
		
	mySvg.append('g')
		.attr('id', 'y-axis')
		.attr('transform', 'translate(' + padding + ', 0)')
		.call(yAxis);

	const mySvg2 = d3.select('body')
		.append('svg')
		.attr('id', 'legend')
		.attr('height', 50)
		.attr('width', w);
	
	mySvg2.selectAll('rect')
		.data(rangeColor)
		.enter()
		.append('rect')
		.attr('fill', d => d[1])
		.attr('x', (d, i) => padding + d[3])
		.attr('y', 5 )
		.attr('height', 20)
		.attr('width', d => d[2])
		
	mySvg2.append('text')
		.attr('x', padding*0.5)
		.attr('y', 45)
		.text(minVariance);
		
	mySvg2.append('text')
		.attr('x', padding + 100)
		.attr('y', 45)
		.text(0);
		
	mySvg2.append('text')
		.attr('x', padding + 200)
		.attr('y', 45)
		.text(maxVariance)

}

function handleMouseOver(d){
	d3.select(this)
		.attr('stroke', 'black')
		.attr('stroke-width', 1)
		
	d3.select('#tooltip')
		.text(formatYear(d.year) +', ' + formatMonth(d.month) + '; Avge. Temp: ' + Math.round((Number(d.variance) + Number(baseTemp))*100)/100 + ' C.')
		.style('left', (d3.event.pageX + 10) + 'px')
		.style('top', (d3.event.pageY - 50) + 'px')
		.style('opacity', 1)
		.attr('data-year', formatYear(d.year));
}

function handleMouseOut(d){
	d3.select(this)
		.attr('stroke-width', 0)
	
	d3.select('#tooltip')
		.style('opacity', 0.0)
}