import { ratingColor, green, orange, red } from '@/variables.js'
import Chart from 'chart.js'

let chart;

//Returns datasets, ready to use with Chart.js
function getDataSets(ratings, seasons, lowestIndex) {
    let dataSets = []; //Datasets
    let nulls = []; //Empty spaces
    let currentColor = -1; //Color according to rating
    let lastRating = 0; //Last rating stored
    let seasonCount = seasons[0]; //Detects when new season starts
    let colors = [ //Style colors for the chart
        { //High score
            index: 0,
            backgroundColor: 'rgba(5, 214, 158, 0.2)', //Line background color
            borderColor: green //Line border color
        },
        { //Average score
            index: 1,
            backgroundColor: 'rgba(255, 209, 103, 0.2)',
            borderColor: orange
        },
        { //Low score
            index: 2,
            backgroundColor: 'rgba(239, 71, 111, 0.2)',
            borderColor: red
        },
        { //Null / N/A
            index: -1,
            backgroundColor: 'rgba(150, 150, 150, 0.1)',
            borderColor: 'lightgrey'
        }
    ];
    //Dataset for seasons and lowest-episode (vertical lines)
    let seasonSet = { 
        type: 'bar',
        label: 'Seasons',
        data: [],
        labels: [],
        backgroundColor: [],
        barThickness: 2,
        maxBarThickness: 2
    };
    //Lowest-rated episode index and, is it the first episode of a season?
    let lowest = { 
        index: lowestIndex,
        newSeason: false
    };
    //For each episode rating, add a new value to the dataSet
    for (let i = 0; i<ratings.length; i++) {
        //Define color
        let rat = ratings[i];
        let col = ratingColor(rat, colors);
        //If color changed, create a new dataset (only way to change the colro of the chart)
        if (currentColor != col.index) {
            currentColor = col.index;
            //Add null values at the start of the array to this dataset
            //start where the previous one ended
            let newData = [...nulls];
            newData[newData.length - 1] = lastRating;
            //Create new dataSet
            dataSets.push(
                {
                    label: 'Episode Ratings',
                    borderWidth: 2,
                    pointHitRadius: 8,
                    backgroundColor: col.backgroundColor,
                    borderColor: col.borderColor,
                    data: newData
                }
            );
        }
        //Add rating to array. If it's null, add previous rating so the line stays at the same height
        dataSets[dataSets.length - 1].data.push( (col.index > -1) ? rat : lastRating );
        nulls.push(null);
        lastRating = (col.index > -1) ? rat : lastRating;
        //Check if a new season has started, and if this is the lowest-rated episode
        let newSeason = (seasonCount < seasons[i]);
        let isLowest = (i === lowestIndex);
        //If either is true...
        if (newSeason || isLowest) {
            let both = (isLowest && (newSeason || i === 0));
            //Add a new line to the seasons dataSet.
            seasonSet.data.push(10.1);
            seasonSet.labels.push('');
            seasonSet.backgroundColor.push(
                (both) ? 'purple' : ((newSeason) ? 'lightgrey' : 'red')
            );
            if (newSeason) seasonCount = seasons[i];
            if (both) lowest.isSeason = true;
        //If neither is true, just add a null value
        } else {
            seasonSet.data.push(null);
            seasonSet.labels.push(null);
            seasonSet.backgroundColor.push('transparent');
        }
    }
    //Return datasets
    return {
        ds: [...dataSets, seasonSet],
        lowest: lowest
    };
}

//Draws a chart using Chart.js
export const drawChart = function(comp, canvas, ratings, labels, seasons, lowestIndex, range, animation) {
    //Destroy preivous chart to clear the canvas
    if (chart) chart.destroy();
    //Store datasets
    let dataSets = getDataSets(ratings, seasons, lowestIndex);
    //Define min and max ranges for the chart, and animation duration
    let rangeMin = (range === 0) ? 0 : ratings[lowestIndex];
    let rangeMax = (range === 0) ? 10 : ratings[ratings.indexOf(Math.max(...ratings))];
    let animationDuration = (animation) ? 1000 : 0;
    //Create the chart
    chart = new Chart(canvas, {
        type: 'line',

        data: {
            labels: [...labels],
            datasets: dataSets.ds
        },

        options: {
            maintainAspectRatio: false,

            layout: {
                padding: {
                    right: 15
                }
            },

            scales: {
                yAxes: [{
                    ticks: {
                        //Start at 0
                        beginAtZero: true,
                        min: rangeMin,
                        max: rangeMax
                    }
                }],
                xAxes: [{
                    ticks: {
                        //Hide x-axis labels
                        display: false
                    },
                    gridLines: {
                        color: 'rgba(100, 100, 100, 0.08)',
                    }
                }]
            },
            elements: {
                point: { 
                    hoverRadius: 5,
                    hitRadius: 4,
                    //Determines point radius and returns a
                    //higher value if it's the selected episode
                    radius: function(context) {
                        let index = context.dataIndex;
                        return index === comp.expandedIndex ? 6 : 2;
                    }
                }
            },

            //Change cursor to pointer when hovering on a point 
            events: ['mousemove'],
            onHover: (event, chartElement) => {
                event.target.style.cursor = chartElement[0] ? 'pointer' : 'default';
            },

            legend: {
                //Hide dataset label
                display: false
            },

            tooltips: {
                callbacks: {
                    //If it's a bar, show the season number; otherwise, show episode name
                    title: function(tooltipItem) { //(tooltipItem, data)
                        //If it's a season bar, change the label
                        let lab = tooltipItem[0].xLabel;
                        if (tooltipItem[0].yLabel > 10) {
                            //Define if it's the start of a season, the lowest-rated episode, or both
                            let low = 'Lowest-rated episode';
                            let season = 'Season ' + lab.substring(0, lab.indexOf('x'));
                            let isLow = (dataSets.lowest.index === tooltipItem[0].index);
                            let isSeason = (dataSets.lowest.isSeason || tooltipItem[0].index === 0);
                            let both = isLow && isSeason;

                            if (both) return (season + ' / ' + low);
                            else return (isLow) ? low : season;
                        //If it's an episode, keep regular label
                        } else return lab;
                    },
                    //Show episode rating if it's not a bar, or if it's the first point from that dataset
                    label: function(tooltipItem, data) {
                        if (tooltipItem.yLabel <= 10) {
                            let ind = tooltipItem.index;

                            if (isNaN(ratings[ind])) return '?';
                            else if (ind > 0) {
                                let dataInd = tooltipItem.datasetIndex;
                                let prevData = data.datasets[dataInd].data[ind - 1];
                                if (prevData === null) return '';
                            }
                            
                            return tooltipItem.yLabel;

                        } else return '';
                    },
                }
            },

            animation: { duration: animationDuration },
            hover: { animationDuration: animationDuration },
            responsiveAnimationDuration: animationDuration
        }
    });

    //If the user clicks on one of the points, show that episode's info
    canvas.onclick = function(event) {
        let activePoints = chart.getElementAtEvent(event);
        if (activePoints.length > 0) comp.clickEpisode(activePoints[0]._index)
    }
}

export const updateChart = function() {
    chart.update();
}