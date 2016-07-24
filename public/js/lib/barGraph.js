(function() {
  var margin = {
    top: 20,
    right: 20,
    bottom: 30,
    left: 40
  }
  var width = 960 - margin.left - margin.right
  var height = 150 - margin.top - margin.bottom
  var x = d3.scale
    .ordinal()
    .rangeRoundBands([0, width], .1)
  var y = d3.scale
    .linear()
    .range([height, 0])
  var xAxis = d3.svg.axis()
    .scale(x)
    .orient('bottom')
  var yAxis = d3.svg
    .axis()
    .scale(y)
    .orient('left')
  var svg = d3.select('.chart').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
  var startDate = moment()
  var endDate = moment().add(21, 'days')

  function getDates(startDate, stopDate) {
    var dateArray = [];
    var currentDate = moment(startDate);
    while (currentDate <= stopDate) {
        dateArray.push( moment(currentDate).format('YYYY-MM-DD') )
        currentDate = moment(currentDate).add(1, 'days');
    }
    return dateArray;
  }

  console.log(getDates(startDate, endDate))

  fetch( '/api/v1/events' ).then( function ( response ) {
    return response.json()
  } ).then( function ( body ) {
    console.log(body.events)
    var events = body.events
    var chartValues = {}

    events.forEach(function(eachEvent) {
      var dateNode = eachEvent.formatted_time.substring(0,6)

      if (chartValues[ dateNode ]) {
        chartValues[ dateNode ] += 1
      } else {
        chartValues[ dateNode ] = 1
      }
    })

    console.log(chartValues)
  } )

  d3.csv('data.csv', function(error, data) {
    if (error) throw error
    console.log(data)
    var maxY = 0
    data.forEach(function (d) {
      maxY = Math.max(d.events, maxY)
    })

    x.domain(data.map(function(d) { return d.date }))
    y.domain([0, maxY])

    svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + height + ')')
      .call(xAxis)

    svg.append('g')
      .attr('class', 'y axis')
      .call(yAxis)
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '.71em')
      .style('text-anchor', 'end')
      .text('Events')

    svg.selectAll('.column')
      .data(data)
      .enter().append('rect')
      .attr('class', 'column')
      .attr('x', function(d) { return x(d.date) })
      .attr('width', x.rangeBand())
      .attr('y', function(d) { return y(d.events) })
      .attr('height', function(d) { return height - y(d.events) })
  })

  function type(d) {
    d.events = +d.events
    return d
  }
})()
