let graphData = {
    nodes: [],
    links: []
};

let selectedNode = null;

async function loadGraph() {
    try {
        const response = await fetch('http://localhost:5001/api/graph');
        const data = await response.json();
        
        graphData.nodes = data.nodes.map(node => ({
            ...node,
            id: node.id.toString()
        }));
        
        graphData.links = data.edges.map(edge => ({
            source: edge.source.toString(),
            target: edge.target.toString()
        }));
        
        console.log('Loaded graph data:', graphData);
        initializeGraph();
    } catch (error) {
        console.error('Error loading graph:', error);
    }
}

function initializeGraph() {
    const svg = d3.select('#graph');
    const width = +svg.attr('width');
    const height = +svg.attr('height');
    
    svg.selectAll('*').remove();
    
    const simulation = d3.forceSimulation(graphData.nodes)
        .force('link', d3.forceLink(graphData.links)
            .id(d => d.id)
            .distance(100))
        .force('charge', d3.forceManyBody().strength(-300))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius(40));
    
    const link = svg.append('g')
        .attr('class', 'links')
        .selectAll('line')
        .data(graphData.links)
        .enter()
        .append('line')
        .attr('class', 'link')
        .attr('stroke', '#999')
        .attr('stroke-opacity', 0.6)
        .attr('stroke-width', 2);
    
    const node = svg.append('g')
        .attr('class', 'nodes')
        .selectAll('circle')
        .data(graphData.nodes)
        .enter()
        .append('circle')
        .attr('class', 'node')
        .attr('r', 20)
        .attr('fill', d => selectedNode && selectedNode.id === d.id ? '#fabb54ff' : '#f2cc8f')
        .call(d3.drag()
            .on('start', dragStarted)
            .on('drag', dragged)
            .on('end', dragEnded))
        .on('click', handleNodeClick);
    
    const labels = svg.append('g')
        .attr('class', 'labels')
        .selectAll('text')
        .data(graphData.nodes)
        .enter()
        .append('text')
        .attr('class', 'label')
        .attr('text-anchor', 'middle')
        .attr('dy', '.35em')
        .text(d => d.label)
        .style('fill', '#2d3436')
        .style('font-size', '10px')
        .style('pointer-events', 'none');
    
    simulation.on('tick', () => {
        link
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);
        
        node
            .attr('cx', d => d.x)
            .attr('cy', d => d.y);
        
        labels
            .attr('x', d => d.x)
            .attr('y', d => d.y);
    });
    
    function dragStarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }
    
    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }
    
    function dragEnded(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }
}

function handleNodeClick(event, d) {
    selectedNode = d;
    
    d3.selectAll('.node')
        .attr('fill', node => node.id === d.id ? '#fabb54ff' : '#f2cc8f');
    
    document.getElementById('term-name').innerText = d.label;
    document.getElementById('term-definition').innerText = d.definition;
    document.getElementById('term-id').innerText = `ID: ${d.id}`;
    
    const connectedNodeIds = new Set();
    graphData.links.forEach(link => {
        if (link.source.id === d.id || link.source === d.id) {
            connectedNodeIds.add(link.target.id || link.target);
        } else if (link.target.id === d.id || link.target === d.id) {
            connectedNodeIds.add(link.source.id || link.source);
        }
    });
    
    const connectedNodes = graphData.nodes
        .filter(node => connectedNodeIds.has(node.id))
        .map(node => node.label);
    
    const connectionsList = document.getElementById('connected-terms');
    connectionsList.innerHTML = '';
    
    if (connectedNodes.length > 0) {
        connectedNodes.forEach(term => {
            const li = document.createElement('li');
            li.textContent = term;
            connectionsList.appendChild(li);
        });
    } else {
        const li = document.createElement('li');
        li.textContent = 'Нет связанных терминов';
        connectionsList.appendChild(li);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadGraph();
    
    document.getElementById('search-input').addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        
        d3.selectAll('.node')
            .attr('fill', d => {
                if (selectedNode && selectedNode.id === d.id) return '#fabb54ff';
                if (searchTerm && d.label.toLowerCase().includes(searchTerm)) {
                    return '#fabb54ff';
                }
                return '#f2cc8f';
            });
    });
    
    document.getElementById('reset-btn').addEventListener('click', () => {
        selectedNode = null;
        document.getElementById('search-input').value = '';
        
        d3.selectAll('.node')
            .attr('fill', '#f2cc8f');
        
        document.getElementById('term-name').innerText = 'Выберите термин';
        document.getElementById('term-definition').innerText = 'Кликните на узел графа для просмотра деталей';
        document.getElementById('term-id').innerText = '';
        document.getElementById('connected-terms').innerHTML = '';
    });
});