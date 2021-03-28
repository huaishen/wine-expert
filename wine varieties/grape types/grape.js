

d3.csv('wine_name_grapes.csv').then((data) =>{
    const indexByName = new Map;
    const nameByIndex = new Map;
    const matrix = [];
    const colores = new Map;
    let n = 0;

    color = d3.scaleOrdinal()
    .domain(data.map(d => d.type))
    .range(["#76da91","#f8cb7f","#f89588","#7cd6cf","#9987ce", "#63b2ee"])
    // .unknown("#ccc")

    // color_grapes = d3.scaleOrdinal()
    //               .domain([1])
    //               .interpolator(d3.interpolateRgb("rgb(151, 151, 151)", "rgb(100, 100, 100)"))

    data.forEach(d => {
        type = d.type
        if (!indexByName.has(d = d.name)) {
          colores.set(n, color(type));
          nameByIndex.set(n, d);
          indexByName.set(d, n++);
        }
      });

    // let n_obj = 0;
    data.forEach(d => {
        if (!indexByName.has(d = d.grapes)) {
          colores.set(n, d3.rgb(121, 121, 121));
          nameByIndex.set(n, d);
          indexByName.set(d, n++);
        }
    });


    data.forEach(d => {
        const source = indexByName.get(d.name)
        let row = matrix[source];
        if (!row) row = matrix[source] = Array.from({length: n}).fill(0);
        row[indexByName.get(d.grapes)] ++;

    });

    data.forEach(d => {
        const source = indexByName.get(d.grapes)
        let row = matrix[source];
        if (!row) row = matrix[source] = Array.from({length: n}).fill(0);
        row[indexByName.get(d.name)] ++;

    });


    chord = d3.chord()
    .padAngle(.04)
    .sortSubgroups(d3.descending)
    .sortChords(d3.descending)

    arc = d3.arc()
    .innerRadius(innerRadius)
    .outerRadius(innerRadius + 20)

    ribbon = d3.ribbon()
    .radius(innerRadius)

    const chords = chord(matrix);


    g = svg.append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
    .datum(chord(matrix));

    const group = g.append("g")
    .selectAll("g")
    .data(chords.groups)
    .join("g");

    group.append("path")
    .attr("fill", d => d3.rgb(colores.get(d.index)).darker())
    .attr("stroke", d => d3.rgb(colores.get(d.index)).darker())
    .attr("d", arc)
    .on("mouseover", onMouseOver)
    .on("mouseout", onMouseOut);

    group.append("text")
    .each(d => { d.angle = (d.startAngle + d.endAngle) / 2; })
    .attr("dy", ".35em")
    .attr("transform", d => `
      rotate(${(d.angle * 180 / Math.PI - 90)})
      translate(${innerRadius + 26})
      ${d.angle > Math.PI ? "rotate(180)" : ""}
    `)
    .attr("font-size", 8)
    .attr("text-anchor", d => d.angle > Math.PI ? "end" : null)
    .text(d => nameByIndex.get(d.index))
    .on("mouseover", d => onMouseOver(d))
    .on("mouseout", d => onMouseOut(d));

    function onMouseOver(selected) {

        target_index = []
        for(i=0;i<matrix[selected.index].length;i++){
            if(matrix[selected.index][i] == 1)
                target_index.push(i)
        }
        group
          .filter(function(d){
              flag = true
              for(i in target_index){
                  if(d.index == target_index[i])
                    flag = false
              }
              return d.index !== selected.index && flag
          })
          .style("opacity", 0.2);

        g.selectAll(".chord")
          .filter( d => (d.source.index !== selected.index && d.target.index !== selected.index))
          .style("opacity", 0.1);
      }

      function onMouseOut() {
        group.style("opacity", 1);
        g.selectAll(".chord")
          .style("opacity", 1);
      }

    g.append("g")
    .attr("fill-opacity", 0.85)
    .selectAll("path")
    .data(chords)
    .join("path")
    .attr("class", "chord")
    .attr("stroke", d => d3.rgb(colores.get(d.source.index)))
    .attr("fill", d => colores.get(d.source.index))
    .attr("d", ribbon)
    .on("mouseover", d => onMouseOver(d.source))
    .on("mouseout", d => onMouseOut(d.source));


    var svgLegned = svg.append("g")
    .attr("transform", "translate(1050,500)");

    var legend = svgLegned.selectAll('g')
            .data(color.domain())
            .enter().append('g')
            .attr("class", "legends")
            .attr("transform", function (d, i) {
            {
                return "translate(0," + i * 20 + ")"
            }
        })

    legend.append('rect')
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 10)
        .attr("height", 10)
        .style("fill", function (d, i) {
        return color(i)
    })

    legend.append('text')
        .attr("x", 20)
        .attr("y", 5)
    .attr("dy", ".35em")
    .text(function (d, i) {
        return d
    })
    .attr("class", "textselected")
    .style("text-anchor", "start")
    .style("font-size", 10)


});
