function createChart(chartSelector, dataURL, width, height, centerPos) {
    var chargeStrength = -150; 
    var simulation; 

    d3.select('#chargeSlider').on('input', function () {
        chargeStrength = +this.value; 
        d3.select('#chargeValue').text(chargeStrength);
        updateChargeStrength(chargeStrength);
    });

    d3.json(dataURL).then(function (data) {
        const links = data.links;
        const nodes = data.nodes;

        simulation = d3.forceSimulation(nodes)
            .force('charge', d3.forceManyBody().strength(chargeStrength))
            .force('center', d3.forceCenter(centerPos[0], centerPos[1]))
            .force('link', d3.forceLink().links(links).distance(10))
            .on('tick', ticked);

        function updateLinks() {
            var u = d3.select(chartSelector + ' .links')
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
                .attr('transform', d => 'translate(' + d.x + ',' + d.y + ') scale(0.7)');

            nodeGroups.selectAll('circle')
                .data(d => [d])
                .join('circle')
                .attr('r', 30)
                .attr('fill', 'cadetblue');

            nodeGroups.selectAll('text')
                .data(d => [d])
                .join('text')
                .text(d => d.name)
                .attr('text-anchor', 'middle')
                .attr('dy', 5)
                .attr('fill', '#666');
        }

        function ticked() {
            updateLinks();
            updateNodes();
        }
    });

    function updateChargeStrength(chargeStrength) {
        simulation.force('charge', d3.forceManyBody().strength(chargeStrength));
        simulation.alpha(0.3).restart(); 
    }
}
