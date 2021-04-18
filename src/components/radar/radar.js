import React from "react";
import * as d3 from 'd3';
import {RadarChart} from "./RadarChart"
import originData from '../../data/sliced.csv'
import '../../css/radarChart.css'

var type_id = 1
var type_data = {
    1: ['Cabernet Sauvignon',
        'Pinot Noir',
        'Syrah',
        'Malbec',
        'Côte de Nuits Red',
        'Merlot',],
    2: ['Chardonnay',
        'Riesling',
        'Sauvignon Blanc',
        'Chablis',
        'Chenin Blanc',
        'Pinot Grigio'],
    3: ['Champagne', 'Prosecco', 'Cava', 'Cremant'],
    4: ['Rosé', 'Pinot Grigio', 'Pinot Noir'],
    5: ['Sherry', 'Madeira', 'Pedro Ximenez'],
}


var margin = {top: 50, right: 25, bottom: 50, left: 25},
    width = Math.min(700, window.innerWidth * 0.8 / 4 - 10) - margin.left - margin.right,
    height = Math.min(width, window.innerHeight * 0.8 - margin.top - margin.bottom - 20);

var labels = ['rating', 'price', 'tannin', 'sweetness', 'intensity', 'acidity', 'fizziness']
var type_labels = {
    1: ['rating', 'price', 'sweetness', 'intensity', 'tannin', 'acidity'],
    2: ['rating', 'price', 'sweetness', 'intensity', 'acidity'],
    3: ['rating', 'price', 'fizziness', 'intensity', 'acidity'],
    4: ['rating', 'price', 'sweetness', 'intensity', 'acidity'],
    5: ['rating', 'price', 'sweetness', 'intensity', 'acidity'],
}
var color = {
    1: d3.scaleOrdinal().range(['rgba(177,18,38,0.73)']),
    2: d3.scaleOrdinal().range(['#e4b953']),
    3: d3.scaleOrdinal().range(['#898ebe']),
    4: d3.scaleOrdinal().range(['#CC337F']),
    5: d3.scaleOrdinal().range(['#722f37']),
}
var radarDescMap = { 1:{
    'Cabernet Sauvignon':
    'Form a full-bodied, complex, fruit forward and dry wine when vinified correctly',

    'Pinot Noir':
    'World\'s most popular light-bodied red wine, it’s loved for its red fruit aromas that are accentuated by a long, smooth finish',

    'Syrah':
    'Darkest full-bodied red wines in the world with dark fruit flavors from sweet blueberry to savory black olive',

    'Malbec':
    'Known for its plump, dark fruit flavors and smoky finish that offers a great alternative to higher priced',

    'Côte de Nuits Red':
    'The sturdiest wines with most depth of flavour come from the steeper slopes',

    'Merlot':
    'A varietal that sits smack dab in the middle of the red wine spectrum, with easy-drinking tannins and super-soft finish',},

    2: {
    'Chardonnay':
    'The most compelling white wine in the world as “the red wine of whites”, for the reasons of barrel fermentation and malolactic',

    'Riesling':
    'This aromatic wine offers primary fruit aromas of orchard fruits like nectarine and apricot, with a taste of high acidity, that similar to the levels in lemonade',

    'Sauvignon Blanc':
    'A popular and unmistakable white wine that\'s loved for its “green” herbal flavors and racy acidity',

    'Chablis':
    'Produced in the northernmost district of the Burgundy region in France, where the cool climate produces wines with more acidity and flavors less fruity',

    'Chenin Blanc':
    'A very adaptable light-bodied white wine which is made in range of styles from dry to sweet',

    'Pinot Grigio':
    'A zesty white wine that is as refreshing as a cold glass of lemonade on a hot summer\'s day, as the second most popular white wine in America',},

    3: {
    'Champagne':
    'Subtly aromatic that the effervescence may mask their delicate bouquet', 

    'Prosecco':
    'Produced by Glera grapes using an affordable method called the “Tank Method. It’s apt for celebration parties and inaugural events', 

    'Cava':
    'A wine with significant levels of carbon dioxide in it that make it fizzy. It have unique flavors of lemon, quince, pear', 

    'Cremant':
    'A group of sparkling wines that will satisfy your desire for high quality bubbly',
    },

    4: {
    'Rosé':
    'Resembles the flavor profile of a light red wine, but with brighter and crisper tasting notes, with a pleasant crunchy green flavor on the finish', 

    'Pinot Grigio':
    'Uses the pale purple skins of the grape to stain the wine a pale copper hue. Floral and fruit aromas of violets and roses with berries and black currant', 

    'Pinot Noir':
    'A delicate and crisp rosé with notes of apple, strawberry, and melon',
    },

    5: {
    'Sherry':
    'A fortified wine, produced in Spain\'s sherry triangle, can be dry (Vinos Generosos), naturally sweet (Vinos Dulces Naturales) or sweetened through blending (Vinos Generosos de Licor)',

    'Madeira':
    'Often served as an aperitif or dessert wine and is used in cooking, especially for making sauces. Dry Madeira makes a good aperitif and pairs nicely with creamy soups',

    'Pedro Ximenez':
    'Probably the sweetest wine in the world. Its complexity of aroma and flavor make it fresh and harmonious on the palate as a result of the natural process of drying the grapes in the sun',
    }
}



const type_map = {"Red": 1, "White": 2, "Sparkling": 3, "Rose": 4, "Fortified": 5, "Dessert": 6}

var radarChartOptions = {
    w: width,
    h: height,
    margin: margin,
    maxValue: 0.5,
    levels: 1,
    roundStrokes: true,
    color: color,
    labels: labels
};


export default class StyleRadar extends React.Component {
    constructor(props) {
        super(props);
    }


    componentDidMount() {
        d3.csv(originData)
            .then((dataset) => {

                const sum = (a, b) => a + b


                // build scales
                let parseF = str => (str ? parseFloat(str) : 0)
                let parseS = str => (str ? str : 'Unknown')
                let range = [0.03, 0.001]
                let scales = {}
                labels.map(l => {
                    let sorted = dataset.map(d => d[l])
                        .filter(v => v)
                        .sort((a, b) => a - b)

                    let lrange = l == 'rating' || l == 'price' ? range[1] : range[0]

                    scales[l] = d3.scaleLinear()
                        .domain([d3.min(dataset, (d) => parseF(sorted[Math.floor(sorted.length * lrange)])),
                            d3.max(dataset, (d) => parseF(sorted[Math.floor(sorted.length * (1 - lrange))]))])
                        .range([0.1, 1])
                })


                // function to get data & draw chart
                const key_filter = (key, chart_id) => {
                    console.log(key, chart_id)
                    let count = key => dataset.filter(d => d.style_varietal_name === key).length
                    d3.select('#count').text(`Count: ${count(key)}`)

                    let new_data = []
                    let tlabels = type_labels[type_id]
                    const valid = d => (tlabels.map(l => (d[l] ? 1 : 0)).reduce(sum, 0) >= tlabels.length)
                    let filtered = dataset
                        .filter(d => valid(d))
                        .filter(d => d['style_varietal_name'] == key)
                    filtered = d3.shuffle(filtered)
						.filter((d,i) => i < 400)

                    filtered.forEach((d, i) => {
                        new_data.push(tlabels.map(l => {
                            let lowbound = 0, upbound = 1.1
                            let value = scales[l](parseF(d[l]))
                            value = Math.min(Math.max(value, lowbound), upbound)
                            return {axis: l, value: value, actValue: parseS(d[l])}
                        }))
                    })
                    radarChartOptions.labels = tlabels
                    radarChartOptions.color = color[type_id]
                    RadarChart(`#${chart_id}`, new_data, radarChartOptions);
                }


                // tap header click event
                d3.selectAll('.tablink').on('click', function (e) {
                    let type_name = e.toElement.name
                    type_id = type_map[type_name]
                    d3.selectAll(".tabcontent").style("display", "none")
                    d3.selectAll(".tablink").style('background-color', '')

                    let block = d3.select(`#${type_name}`).style("display", "grid")

                    // build contents
                    block.selectAll('.grid-item').remove()
                    const items = block.selectAll('.grid-item')
                        .data(type_data[type_id])
                        .enter()
                        .append('div')
                        .attr('class', 'grid-item')

                    items.append('div')
                        .attr('class', 'radar-chart')
                        .attr('id', (d, i) => `${type_name}${i}`)
                        .each((d, i) => {
                            key_filter(d, `${type_name}${i}`)
                        })
                    e.toElement.style.backgroundColor = '#d62728';

					items.append('h2')
						.attr('class', 'radarTitle')
						.text(d => d)
					
					items.append('p')
						.attr('class', 'radarDesc')
						.text(d => radarDescMap[type_id][d])
                })

                document.getElementsByName("Red")[0].click();

            })
    }

    render() {
        return (
            <div id="radarContainer">
                <button className="tablink" name="Red">Red Wine</button>
                <button className="tablink" name="White">White Wine</button>
                <button className="tablink" name="Sparkling">Sparkling</button>
                <button className="tablink" name="Rose">Rose</button>
                <button className="tablink" name="Fortified">Fortified</button>


                <div id="Red" className="tabcontent grid-container">
                </div>

                <div id="White" className="tabcontent grid-container">
                </div>

                <div id="Sparkling" className="tabcontent grid-container">
                </div>

                <div id="Rose" className="tabcontent grid-container">
                </div>

                <div id="Fortified" className="tabcontent grid-container">
                </div>
            </div>

        )

    }
}
