
function createChart(chartSelector, dataURL, centerPos,linkedChartSelector) {
  
    // ----------------- DATA FUNCTION ----------------- //
    var simulation; 
    d3.json(dataURL).then(function (data) {
        const links = data.links;
        const nodes = data.nodes;

        simulation = d3.forceSimulation(nodes)
            .force('charge', d3.forceManyBody().strength(chargeStrength))
            .force('center', d3.forceCenter(centerPos[0], centerPos[1]))
            .force('link', d3.forceLink().links(links).distance(10))
            .on('tick', ticked);

        function updateLinks() {
            d3.select(chartSelector + ' .links')
                .selectAll('line')
                .data(links)
                .join('line')
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y)
                .attr('stroke-width', 2);
        }

        function updateNodes() {
            var nodeGroups = d3.select(chartSelector + ' .nodes')
                .selectAll('g')
                .data(nodes)
                .join('g')
                .attr('transform', d => 'translate(' + d.x + ',' + d.y + ') scale(' + 0.5 + ')')
                .on('mouseover', (event, d) => handleMouseOver(event, d, chartSelector, linkedChartSelector, nodes))
                .on('mouseout', (event, d) => handleMouseOut(event, d, chartSelector));

            nodeGroups.selectAll('circle')
                .data(d => [d])
                .join('circle')
                .attr('r', 35);

            nodeGroups.selectAll('text')
                .data(d => [d])
                .join('text')
                .text(d => d.name);
        }

        function ticked() {
            updateLinks();
            updateNodes();
        }
    });

    // ------------- MOUSEOVER FUNCTION ---------------- //

    function handleMouseOver(event, d, chartSelector, linkedChartSelector, nodes) {

        d3.select(event.currentTarget).selectAll('circle').attr('r', 55);
    
        var tooltip1 = d3.select("#Display_chart_one_tooltip-container"); 
        tooltip1.select("#tooltip-name").text("Characters name: " + d.name);
        tooltip1.select("#tooltip-value").text("Characters value: " + d.value);
    
        const hoveredNodeName = d.name;
    
        d3.select(linkedChartSelector).selectAll('.nodes circle')
            .attr('r', function(linkedNodeData) {

                const nodeName = linkedNodeData.name;
                const nodeValue = linkedNodeData.value;
                var tooltip2 = d3.select("#Display_chart_two_tooltip-container"); 
    
                if (nodeName === hoveredNodeName) {
                    tooltip2.select("#tooltip-name-2").text("Characters name: " + nodeName);
                    tooltip2.select("#tooltip-value-2").text("Characters value: " + nodeValue);
                    return 55;
                } else {
               
                    return 30;
                }
            });
    }
    
    

    // ------------- MOUSEOUT FUNCTION ---------------- //

    function handleMouseOut(event, d, chartSelector, linkedChartSelector) {
        // Reset circle size in all nodes in the current chart
        d3.selectAll(chartSelector + ' .nodes circle').attr('r', 30);
        
        // Reset circle size in all nodes in the linked chart
        d3.selectAll(linkedChartSelector + ' .nodes circle').attr('r', 30);

        var tooltip1 = d3.select("#Display_chart_one_tooltip-container"); 
        tooltip1.select("#tooltip-name").text("Characters name: ");
        tooltip1.select("#tooltip-value").text("Characters value: ");

        var tooltip2 = d3.select("#Display_chart_two_tooltip-container");
        tooltip2.select("#tooltip-name-2").text("Characters name: ");
        tooltip2.select("#tooltip-value-2").text("Characters value: ");
    }
    
    // Initialize mouseover event handlers for nodes
    function mouseOverNodes(selector) {
        d3.select(selector).selectAll('.nodes g')
            .on('mouseover', (event, d) => handleMouseOver(event, d, selector, linkedChartSelector, nodes))
            .on('mouseout', (event, d) => handleMouseOut(event, d, selector));
    }
    
    // Initialize mouseover event handlers for both charts
    mouseOverNodes(chartSelector);


    // ----------------- ZOOM FUNCTION ----------------- // 
    var zoom = d3.zoom()
        .scaleExtent([0.1, 4])
        .on('zoom', zoomed);

    d3.select(chartSelector + ' svg').call(zoom);

    d3.select('#zoomSlider').on('input', function () {
        var zoomLevel = +this.value;
        d3.select('#zoomValue').text(zoomLevel);
        d3.select(chartSelector + ' svg').call(zoom.transform, d3.zoomIdentity.scale(zoomLevel));
    });

    function zoomed(event) {
        d3.select(chartSelector + ' .chart-container')
            .attr('transform', event.transform)
            .attr('transform-origin', 'center');
    }

    // ----------------- GRAVITY FUNCTION ----------------- //

    var chargeStrength = -300;

    d3.select('#chargeSlider').on('input', function () {

        chargeStrength = +this.value;

        d3.select('#chargeValue').text(chargeStrength);
        updateChargeStrength(chargeStrength);
    });

    function updateChargeStrength(chargeStrength) {
        simulation.force('charge', d3.forceManyBody().strength(chargeStrength));
        simulation.alpha(0.3).restart();
    }

    // ----------------- WEIGHT FUNCTION ----------------- //
    d3.select('#weightSlider').on('input', function () {

        var weightThreshold = +this.value - 1;

        d3.select('#weightValue').text(weightThreshold);
        selectOnWeight(weightThreshold);
    });

    function selectOnWeight(weightThreshold) {

        var links = d3.selectAll('line');

        links.style('stroke', function (d) {
            return d.value > weightThreshold ? 'red' : 'lightgray';
        });
    }
}

  // ----------------- CHANGE GRAPH FUNCTION ----------------- //
  var currentChart = '.chart_one';

  function toggleChart() {
      if (currentChart === '.chart_one') {
          currentChart = '.chart_two';
          document.getElementById('selectedChart').innerText = 'Chart two';
      } else {
          currentChart = '.chart_one';
          document.getElementById('selectedChart').innerText = 'Chart one';
      }

      createChart(currentChart, 'default-data.json', [250, 200], '.chart_two');
  }
  