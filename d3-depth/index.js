const svgSize = { width: 600, height: 950 };
const margin = { top: 10, right: 100, bottom: 10, left: 10 };
const width  = svgSize.width  - margin.left - margin.right;
const height = svgSize.height - margin.top  - margin.bottom;

const svg = d3.select('.depth-chart')
    .append('svg')
    .attr('width', svgSize.width)
    .attr('height', svgSize.height)
;

const graph = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)
    .attr('width', width)
    .attr('height', height)
;

const scale = 1;

const price = 3893.5;
const priceFrom = price * (1 - scale/2/100);
const priceTo   = price * (1 + scale/2/100);

d3.json('data.json').then(res => {
    // console.log('res', res);
    // const counter = {};
    // res.forEach(v => counter[ v.price ] = (counter[ v.price ] || 0) + 1);
    // console.log('bigger', _.map(counter, (p, k) => [p, k]));
    // console.log('---', groupBy(res, 10));

    const { sell: sellAll, buy: buyAll } = groupBy(res, 0.5);
    const sell = sellAll.filter(v => v.price <= priceTo);
    const buy  = buyAll.filter(v => v.price >= priceFrom);

    _.forEach(buy, (curr, i, all) => {
        const prevSum = all[ i - 1 ] && all[ i - 1 ].sum || 0;
        curr.sum = prevSum + curr.size;
    });
    _.forEachRight(sell, (curr, i, all) => {
        const prevSum = all[ i + 1 ] && all[ i + 1 ].sum || 0;
        curr.sum = prevSum + curr.size;
    });
    console.log('', sell, buy);
    update([ ...sell, ...buy ]);
});

const groupBy = (data, by) => {
    const { sell: sellRaw, buy: buyRaw } = _.groupBy(data, v => v.side.toLowerCase());

    const group = (d) => _.chain(d)
        // .groupBy(v => Math.floor(v.price / by) * by)
        .map((orders, price) => ({
            // price: +price,
            price: orders.price,
            size: orders.size,
            side: orders.side.toLowerCase(),
            // size: _.sumBy(orders, v => v.size),
            // side: orders[0].side.toLowerCase(),
        }))
        .orderBy(['price'], ['desc'])
        .value()
    ;

    const sell = group(sellRaw);
    const buy = group(buyRaw);
    // console.log('', sell, buy);
    return { sell, buy };
};

const xScale = d3.scaleLinear()
    .range([ 0, width ])
;

const yBandScale = d3.scaleBand()
    .range([ 0, height ])
    .round(false)
    // .paddingInner(0.05)
;
const yScale = d3.scaleLinear()
    .range([ height, 0 ])
;

const yAxisGroup = svg.append('g')
    .attr('transform', `translate(${margin.left + width + 10}, ${margin.top})`)
;
const yAxis = d3.axisRight(yBandScale).ticks(scale * 4);


const update = (data) => {
    // data
    const rects = graph.selectAll('rect').data(data);
    // const texts = graph.selectAll('text').data(data);

    // scales
    const xDomainRange = d3.extent(data.map(v => v.sum));
    xDomainRange[0] *= 0.9;
    xScale.domain(xDomainRange);
    yBandScale.domain(data.map((v) => v.price));
    yScale.domain(d3.extent(data, (v) => v.price));

    rects.enter()
        .append('rect')
        .attr('x', d => width - xScale(d.sum))
        .attr('y', (d) => yBandScale(d.price))
        .attr('width', d => xScale(d.sum))
        .attr('height', yBandScale.bandwidth())
        .attr('fill', d => d.side === 'sell' ? 'green' : 'red')
    ;

    yAxisGroup.call(yAxis);

    // texts.enter()
    //     .append('text')
    //     .text(d => `${d.price} | ${d.size}`)
    //     .attr('fill', 'black')
    //     .attr('x', 0)
    //     .attr('y', (d) => y(d.price) + y.bandwidth())
    // ;
};
