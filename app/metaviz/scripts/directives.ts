'use strict';
namespace metaviz {
    export interface IHellloWorldDirectiveScope extends ng.IScope {
        name: string;
    }

    export class HelloWorldDirective implements ng.IDirective {
        restrict: string = 'EA';
        public replace: boolean = true;

        public static readonly directiveName: string = 'mvHelloworld';

        private static readonly _inject: string[] = [];
        public link = (scope: IHellloWorldDirectiveScope, element: ng.IAugmentedJQuery, attrs: ng.IAttributes) => {
            element.text('Hello World3');
        };

        constructor() {

        }

        public static factory(): ng.IDirectiveFactory {
            let d = () => {
                return new HelloWorldDirective();
            };
            d.$inject = HelloWorldDirective._inject;
            return d;
        }
    }

    declare let DCC: any;
    export class DonutChartDirective implements ng.IDirective {
        restrict: string = 'E';
        public static readonly directiveName: string = 'mvDonutchart';
        private static readonly _inject: string[] = [];
        public controller = DonutChartController.$inject;
        public scope = true;
        public bindToController = {
            data: '='
        };


        private readonly _w = 500;
        private readonly _h = 500;
        private readonly _min = Math.min(this._w, this._h);
        private readonly _colors = d3.scaleOrdinal(d3.schemeCategory20);
        private readonly _pie = d3.pie().sort(null);
        private readonly _arcgen = d3.arc()
            .innerRadius(this._min * 0.5 * 0.9)
            .outerRadius(this._min * 0.5 * 0.5);

        public link = (scope: any, element: ng.IAugmentedJQuery, attrs: ng.IAttributes, ngModel: any) => {

            let svg = d3.select(element[0]).append('svg').attr('width', this._w).attr('height', this._h);
            let g = svg.append('g').attr('transform', `translate(${this._w / 2},${this._h / 2})`);

            scope.$watch('data', (data: IDonutChartData) => {
                let svg = d3.select(element[0]).select('svg');
                let g = svg.select('g');
                let arcData = this._pie(data.array);
                let path = g.selectAll('path');
                if (arcData.length < path.size()) {
                    console.warn('TODO: Count for case when new data items are less than current selections.');
                }
                path = path.data(arcData).enter().append('path').merge(<any>path);
                path.attr('d', <any>this._arcgen)
                    .attr('fill', (d: any, i: any) => {
                        return this._colors(i);
                    });
            }, true);
        };

        constructor() {
        }


        public static factory(): ng.IDirectiveFactory {
            let d = () => {
                return new DonutChartDirective();
            };
            d.$inject = DonutChartDirective._inject;
            return d;
        }
    }

    export interface IVennDiagramDirectiveScope extends ng.IScope {
        results: common.IResults,
        config: common.IConfig,
        wevoteContribution: boolean,
        sets: Array<IVennDiagramSet>
    }

    declare var venn: any

    export class AlgorithmsVennDiagramDirective implements ng.IDirective {
        // References: 
        /**
         * References:
         * 1. https://codepen.io/anon/pen/xLgZqb
         * 2. https://github.com/benfred/venn.js
         * 3. https://github.com/christophe-g/d3-venn
         * 4. http://bl.ocks.org/bessiec/986e971203b4b8ddc56d3d165599f9d0 (good)
         * 5. https://codepen.io/ghiden/pen/bGAIg (good)
         */
        restrict: string = 'E';
        public replace: boolean = false;
        public static readonly directiveName: string = 'mvAlgorithmsVenn';
        private static readonly _inject: string[] = [];

        public controller = VennDiagramController.$inject;
        public scope = {
            wevoteContribution: '=wevoteContribution',
            results: '=results',
            config: '=config'
        };
        public bindToController = {
            sets: '=',
            results: '=',
            wevoteContribution: '=',
            config: '='
        };

        private readonly _w = 750;
        private readonly _h = 500;
        private readonly _min = Math.min(this._w, this._h);


        public link = (scope: IVennDiagramDirectiveScope, element: ng.IAugmentedJQuery, attrs: ng.IAttributes, ngModel: any) => {
            scope.$watch('sets', (sets: Array<IAlgorithmsVennSets>) => {
                if (sets) {
                    let chart = venn.VennDiagram();

                    let tooltip = d3.select('body').append('div')
                        .attr('class', 'venntooltip');

                    let svg =
                        d3.select(element[0]).append('svg')
                            .attr('width', this._w)
                            .attr('height', this._h);

                    let diagram = svg.append('g');
                    diagram.datum(sets).call(chart);
                    diagram.selectAll("path")
                        .style("stroke-opacity", 0)
                        .style("stroke", "#fff")
                        .style("stroke-width", 3);

                    diagram.selectAll("g")
                        .on("mouseover", function (d: any, i: any) {
                            // sort all the areas relative to the current item
                            venn.sortAreas(diagram, d);

                            tooltip
                                .style("left", `${d3.event.pageX}px`)
                                .style("top", `${d3.event.pageY - 28}px`);

                            // Display a tooltip with the current size
                            tooltip
                                .transition()
                                .duration(50)
                                .style("opacity", .9);

                            tooltip
                                .text(`${d.sets.join(' ∩ ')} = ${d.size} nodes`);

                            // highlight the current path
                            var selection =
                                d3.select(this)
                                    .transition()
                                    .duration(100);

                            selection.select("path")
                                .style("fill-opacity", d.sets.length == 1 ? .4 : .1)
                                .style("stroke-opacity", 1);
                        })
                        .on("mousemove", function () {
                            // if (Math.abs(parseInt(tooltip.style('left').split("px")[0]) - d3.event.pageX) < 15 &&
                            //     Math.abs(parseInt(tooltip.style('top').split("px")[0]) - (d3.event.pageY - 28)) < 15)
                            //     return;
                            // else
                            //     tooltip
                            //         .style("left", `${d3.event.pageX}px`)
                            //         .style("top", `${d3.event.pageY - 28}px`);
                        })
                        .on("mouseout", function (d: any, i: any) {
                            tooltip.transition().duration(400).style("opacity", 0);
                            var selection = d3.select(this).transition().duration(400);
                            selection.select("path")
                                .style("fill-opacity", d.sets.length == 1 ? .25 : .0)
                                .style("stroke-opacity", 0);
                        });
                }
            }, false);
        };

        constructor() {
        }


        public static factory(): ng.IDirectiveFactory {
            let d = () => {
                return new AlgorithmsVennDiagramDirective();
            };
            d.$inject = AlgorithmsVennDiagramDirective._inject;
            return d;
        }
    }


    export interface IAbundanceSunburstDirectiveScope extends ng.IScope {
        hierarchy: any,
        totalSize: number
    }

    export interface IAbundanceSubburstHTMLElement {
        main: any,
        sequence: any,
        chart: any,
        explanation: any,
        percentage: any,
        svg: any,
        trail: any,
        endlabel: any
    }

    export class AbundanceSunburstDirective implements ng.IDirective {
        // References: 
        /**
         * References:
         * 1. https://bl.ocks.org/kerryrodden/766f8f6d31f645c39f488a0befa1e3c8
         */
        restrict: string = 'E';
        public replace: boolean = false;
        public static readonly directiveName: string = 'mvAbundanceSunburst';
        private static readonly _inject: string[] = [];
        public scope = {
            hierarchy: '=hierarchy'
        };

        // Breadcrumb dimensions: width, height, spacing, width of tip/tail.
        readonly b = {
            w: 135, h: 30, s: 3, t: 10
        };
        readonly maxVisibleTrailAncestry = 5;

        // Dimensions of sunburst.

        private readonly _w = 700;
        private readonly _h = 600;
        private readonly _radius = Math.min(this._w, this._h) / 2;

        public link = (scope: IAbundanceSunburstDirectiveScope, element: ng.IAugmentedJQuery, attrs: ng.IAttributes, ngModel: any) => {
            // Total size of all segments; we set this later, after loading the data.
            scope.totalSize = 0;

            let vis: IAbundanceSubburstHTMLElement = <any>{};
            const row = d3.select(element[0]).append('div').attr('class', 'row tab-content');
            vis.main = row.append('div').attr('class', 'row sunburst-main');
            vis.sequence = vis.main.append('div').attr('style',
                `
width: ${this._w}px;
height: 70px;
`
            );
            vis.chart = vis.main.append('div').attr('class', 'sunburst-chart');
            vis.explanation = vis.chart.append('div')
                .attr('style',
                `
position: absolute;
text-align: center;
color: #666;
sz-index: -1;
visibility: hidden;
width:${140}px; 
top: ${this._h / 2 - 70}px;
left: ${this._w / 2 - 70}px;
`
                );
            vis.percentage = vis.explanation.append('span').attr('class', 'sunburst-percentage');
            vis.explanation.append('p').html('<br> Abundance');

            vis.svg = vis.chart.append('svg')
                .attr("width", this._w)
                .attr("height", this._h)
                .append('g')
                .attr("transform", `translate(${this._w / 2}, ${this._h / 2})`);

            let partition = d3.partition()
                .size([2 * Math.PI, this._radius * this._radius]);

            let arc = d3.arc()
                .startAngle(function (d: any) { return d.x0; })
                .endAngle(function (d: any) { return d.x1; })
                .innerRadius(function (d: any) { return Math.sqrt(d.y0); })
                .outerRadius(function (d: any) { return Math.sqrt(d.y1); });

            scope.$watch('hierarchy', (hierarchy: any) => {
                if (hierarchy) {
                    // Basic setup of page elements.
                    this.initializeBreadcrumbTrail(vis);
                    // Bounding circle underneath the sunburst, to make it easier to detect
                    // when the mouse leaves the parent g.
                    vis.svg.append('circle')
                        .attr("r", this._radius)
                        .style("opacity", 0);

                    // Turn the data into a d3 hierarchy and calculate the sums.
                    const root = d3.hierarchy(hierarchy)
                        .sum(function (d: any) { return d.size; })
                        .sort(function (a: any, b: any) { return b.value - a.value; });

                    // For efficiency, filter nodes to keep only those large enough to see.
                    const nodes = partition(root).descendants()
                        .filter(function (d: any) {
                            return (d.x1 - d.x0 > 0.005); // 0.005 radians = 0.29 degrees
                        });

                    const mouseOverCB = this.mouseover(scope, vis);
                    const path = vis.svg.data([hierarchy]).selectAll("path")
                        .data(nodes)
                        .enter().append('path')
                        .attr("display", function (d: any) { return d.depth ? null : "none"; })
                        .attr("d", arc) // Suspected Bug.
                        .attr("fill-rule", "evenodd")
                        .style("fill", (d: any) => {
                            return d3.hcl(d.data.color.H, d.data.color.C, d.data.color.L);
                        })
                        .style("opacity", 1)
                        .on("mouseover", mouseOverCB)
                        ;

                    // Add the mouseleave handler to the bounding circle.
                    // vis.svg.on("mouseleave", this.mouseleave(mouseOverCB, vis));

                    // Get total size of the tree = value of root node from partition.
                    scope.totalSize = path.datum().value;
                }
            }, false);
        };

        // Fade all but the current sequence, and show it in the breadcrumb trail.
        private mouseover(
            scope: IAbundanceSunburstDirectiveScope,
            vis: IAbundanceSubburstHTMLElement):
            (d: any) => void {

            let mouseoverCallback = (d: any) => {

                const percentage = (100 * d.value / scope.totalSize).toPrecision(3);
                let percentageString = percentage + "%";
                if (parseFloat(percentage) < 0.1) {
                    percentageString = "< 0.1%";
                }

                vis.percentage
                    .text(percentageString);

                vis.explanation
                    .style("visibility", "");

                const ancestry: Array<any> = d.ancestors();
                ancestry.pop(); // remove the root node.
                while (ancestry.length > this.maxVisibleTrailAncestry)
                    ancestry.pop();

                const nodesSequence = ancestry.reverse();
                this.updateBreadcrumbs(nodesSequence, percentageString, vis);

                // Fade all the segments.
                d3.selectAll("path")
                    .style("opacity", 0.7);

                // Then highlight only those that are an ancestor of the current segment.
                vis.svg.selectAll("path")
                    .filter(function (node: any) {
                        return (nodesSequence.indexOf(node) >= 0);
                    })
                    .style("opacity", 1);
            };

            return mouseoverCallback;
        }

        // Restore everything to full opacity when moving off the visualization.
        private mouseleave = (mouseOverCB: (d: any) => void, vis: IAbundanceSubburstHTMLElement):
            ((d: any) => void) => {
            let mouseLeaveCB = (d: any) => {

                // Hide the breadcrumb trail
                vis.trail
                    .style("visibility", "hidden");

                // Deactivate all segments during transition.
                d3.selectAll("path").on("mouseover", null);

                // Transition each segment to full opacity and then reactivate it.
                d3.selectAll("path")
                    .transition()
                    .duration(1000)
                    .style("opacity", 1)
                    .on("end", function () {
                        d3.select(this).on("mouseover", mouseOverCB);
                    });

                vis.explanation
                    .style("visibility", "hidden");
            }
            return mouseLeaveCB;
        }


        private initializeBreadcrumbTrail = (vis: IAbundanceSubburstHTMLElement) => {
            // Add the svg area.
            vis.trail = vis.sequence.append('svg')
                .attr("width", this._w)
                .attr("height", 50);

            // Add the label at the end, for the percentage.
            vis.endlabel = vis.trail.append("svg:text")
                .style("fill", "#000");
        }

        // Generate a string that describes the points of a breadcrumb polygon.
        private breadcrumbPoints = (d: any, i: any) => {
            var points = [];
            points.push("0,0");
            points.push(`${this.b.w},0`);
            points.push(`${this.b.w + this.b.t},${this.b.h / 2}`);
            points.push(`${this.b.w},${this.b.h}`);
            points.push(`0,${this.b.h}`);
            if (i > 0) { // Leftmost breadcrumb; don't include 6th vertex.
                points.push(`${this.b.t},${this.b.h / 2}`);
            }
            return points.join(" ");
        }

        // Update the breadcrumb trail to show the current sequence and percentage.
        updateBreadcrumbs = (nodeArray: any, percentageString: any, vis: IAbundanceSubburstHTMLElement) => {

            // Data join; key function combines name and depth (= position in sequence).
            let trail = vis.trail.selectAll("g")
                .data(nodeArray, function (d: any) {
                    return d.data.name + d.depth;
                });

            // Remove exiting nodes.
            trail.exit().remove();

            // Add breadcrumb and label for entering nodes.
            var entering = trail.enter().append("svg:g");

            entering.append("svg:polygon")
                .attr("points", this.breadcrumbPoints)
                .style("fill", (d: any) => { return d3.hcl(d.data.color.H, d.data.color.C, d.data.color.L); });

            entering.append("svg:text")
                .attr("x", (this.b.w + this.b.t) / 2)
                .attr("y", this.b.h / 2)
                .attr("dy", "0.35em")
                .attr("text-anchor", "middle")
                .text(function (d: any) { return d.data.name; });

            // Merge enter and update selections; set position for all nodes.
            entering.merge(trail).attr("transform", (d: any, i: any) => {
                return `translate( ${i * (this.b.w + this.b.s)}, ${0})`;
            });

            // Now move and update the percentage at the end.
            vis.endlabel
                .attr("x", (nodeArray.length + 0.3) * (this.b.w + this.b.s))
                .attr("y", this.b.h / 2)
                .attr("dy", "0.35em")
                .attr("text-anchor", "middle")
                .text(percentageString);

            // Make the breadcrumb trail visible, if it's hidden.
            vis.trail
                .style("visibility", "");
        }

        constructor() {
        }

        public static factory(): ng.IDirectiveFactory {
            let d = () => {
                return new AbundanceSunburstDirective();
            };
            d.$inject = AbundanceSunburstDirective._inject;
            return d;
        }
    }

    export class WevoteTableDirective implements ng.IDirective {

        restrict: string = 'E';
        public replace: boolean = false;
        public static readonly directiveName: string = 'mvWevoteTable';
        private static readonly _inject: string[] = [];

        public controller = WevoteTableController.$inject;
        public scope = {
            results: '=results',
            config: '=config'
        };
        public bindToController = {
            results: '=',
            config: '=',
            header: '=',
            entries: '='
        };

        readonly heatmapMaxEntries = 20;

        private downloadWevolteClassification = (header: string[], data: IWevoteTableEntry[], seperator: string = ',') => {
            const textual: string = [header.join(seperator)].concat(data.map((entry: IWevoteTableEntry) => {
                return [entry.seqId]
                    .concat(<any>entry.votes)
                    .concat(<any>[entry.resolvedTaxon])
                    .concat(<any>entry.distances) 
                    .concat(<any>[ entry.cost , entry.score ]).join(seperator);
            })).join("\n");

            const a = window.document.createElement('a');
            a.href = window.URL.createObjectURL(new Blob([textual], { type: 'text/csv' }));
            a.download = `wevote_classification.${(seperator === ',') ? 'csv' : 'txt'}`;
            // Append anchor to body.
            document.body.appendChild(a);
            a.click();
            // Remove anchor from body
            document.body.removeChild(a);
        };

        public link = (scope: ITableScope<IWevoteTableEntry>,
            element: ng.IAugmentedJQuery, attrs: ng.IAttributes, ngModel: any) => {

            const container = d3.select(element[0]).append('div').attr('class', 'row tab-content');
            const downloadsContainer = container.append('div').attr('class', 'row').append('div').attr('class', 'col-xs-12');
            const tableContainer = container.append('div').attr('class', 'row');
            const pagingDiv = tableContainer.append('div').attr('class', 'col-xs-1');
            const heatmapDiv = tableContainer.append('div').attr('class', 'col-xs-11')
                .style('width', '700px')
                .style('height', '800px');
            pagingDiv.append('p').html('<br><br><br><br><br><br><br><br>');
            const btnUp = pagingDiv.append('button');
            pagingDiv.append('p').html('<br>');
            const btnDn = pagingDiv.append('button');

            [btnUp, btnDn].forEach((btn: any) => {
                btn.attr('type', 'button');
                btn.attr('class', 'btn btn-warning btn-xs');
            });
            btnUp.append('i').attr('class', 'fa fa-arrow-circle-up');
            btnDn.append('i').attr('class', 'fa fa-arrow-circle-down');
            const btnUpController = <any>$(<any>btnUp.node());
            const btnDnController = <any>$(<any>btnDn.node());

            const heatmap = heatmapDiv.append('div');
            const heatmapElement = <any>heatmap.node();
            scope.$watch('entries', (entries: Array<IWevoteTableEntry>) => {
                interface IMinMax {
                    max: number,
                    min: number
                };

                if (entries && scope.header) {
                    const minMax = new Array<IMinMax>();
                    for (let i = 0; i < (<any>entries[0]).distances.length + 2; ++i)
                        minMax.push({ max: -Infinity, min: Infinity });


                    const xValues = scope.header.slice(1);
                    const yValues = entries.map((entry: IWevoteTableEntry) => { return entry.seqId; });
                    const zValues = entries.map((entry: IWevoteTableEntry) => {
                        const zRow = entry.votes.map((v: number) => { return 0; })
                            .concat(0)
                            .concat((<any>entry).distances.map((d:number)=>{return -d;}))
                            .concat([-(<any>entry).cost, (<any>entry).score]);

                        for (let i = 0; i < minMax.length; ++i) {
                            let col = 0;
                            const values = zRow.slice( entry.votes.length + 1 );
                            for (let value of values ) {
                                if (value > minMax[col].max)
                                    minMax[col].max = value;
                                if (value < minMax[col].min)
                                    minMax[col].min = value;
                                ++col;
                            }
                        }
                        return zRow;
                    });
                    
                    const offset = (<any>entries[0]).votes.length + 1;
                    zValues.forEach((row: number[],index:number) => {
                        for (let i = offset; i < row.length ; ++i)
                            zValues[index][i] = (row[i] - minMax[i-offset].min) / (minMax[i-offset].max - minMax[i-offset].min);
                    });

                    const txt = entries.map((entry: IWevoteTableEntry) => {
                        return entry.votes.map((tax: number) => { return `${tax}`; })
                            .concat([`${entry.resolvedTaxon}`])
                            .concat( (<any>entry).distances.map((d: number) => { return `${d.toFixed(2)}`; }))
                            .concat([`${(<any>entry).cost.toFixed(2)}`, `${(<any>entry).score.toFixed(2)}`]);
                    });

                    const data: any = {
                        x: xValues,
                        y: yValues,
                        z: zValues,
                        text: entries.map((entry: IWevoteTableEntry) => {
                            return entry.votes.map((tax: number, index: number) => {
                                return `
seq: ${entry.seqId}<br>
${xValues[index]}: ${tax}<br>
`;
                            }).concat([
                                `
seq: ${entry.seqId}<br>
WEVOTE: ${entry.resolvedTaxon}<br>
score: ${(<any>entry).score.toFixed(2)}
`
                            ]).concat((<any>entry).distances.map((d: number, index: number) => {
                                return `
seq: ${entry.seqId}<br>
${xValues[entry.votes.length + index]}: ${d.toFixed(2)}<br>
`
                            })).concat([
                                `
seq: ${entry.seqId}<br>
cost: ${(<any>entry).cost.toFixed(2)} 
`                               ,

                                `
seq: ${entry.seqId}<br>
score: ${(<any>entry).score.toFixed(2)} 
`
                            ]);
                        }),
                        hoverinfo: 'text',
                        type: 'heatmap',
                        colorscale: 'Viridis',
                        showscale: false
                    };

                    let layout: any = {
                        xaxis: {
                            visible: true,
                            type: 'category',
                            ticks: '',
                            side: 'top',
                            autosize: false,
                            fixedrange: true
                        },
                        yaxis: {
                            visible: true,
                            type: 'category',
                            ticks: '',
                            ticksuffix: ' ',
                            autosize: false,
                            fixedrange: true
                        }
                    };
                    let annotations = new Array<any>();

                    type Range = [Plotly.Datum, Plotly.Datum];

                    for (let i = 0; i < yValues.length; i++)
                        for (let j = 0; j < xValues.length; j++) {
                            const currentValue = zValues[i][j];
                            const result = {
                                xref: 'x1',
                                yref: 'y1',
                                x: xValues[j],
                                y: yValues[i],
                                text: txt[i][j],
                                font: {
                                    family: 'Arial',
                                    size: 12,
                                    color: 'white'
                                },
                                showarrow: false
                            };
                            annotations.push(result);
                        }

                    const pagesCount = Math.ceil(yValues.length / this.heatmapMaxEntries);
                    const pages = new Array<Array<number>>();
                    for (let i = 0; i < pagesCount; i++)
                        pages.push([i * this.heatmapMaxEntries, (i + 1) * this.heatmapMaxEntries]);

                    let currentPage = 0;
                    const changePage = (delta: number) => {
                        currentPage += delta;
                        if (currentPage < 0) {
                            currentPage = 0;
                            return;
                        }
                        if (currentPage >= pagesCount) {
                            currentPage = pagesCount - 1;
                            return;
                        }
                        const range: any = [pages[currentPage][0], pages[currentPage][1]];
                        data.y = yValues.slice(pages[currentPage][0], pages[currentPage][1]);
                        data.z = zValues.slice(pages[currentPage][0], pages[currentPage][1]);

                        layout.title = `WEVOTE Classification (${currentPage + 1}/${pagesCount})`;
                        layout.annotations = annotations.slice(
                            pages[currentPage][0] * xValues.length,
                            pages[currentPage][1] * xValues.length);

                        let initialized = false;
                        if (!initialized) {
                            initialized = true;
                            Plotly.newPlot(heatmapElement, <any>[data], <any>layout);
                        }
                        else {
                            Plotly.deleteTraces(heatmapElement, 0);
                            Plotly.addTraces(heatmapElement, <any>[data]);
                        }

                    };
                    btnUpController.click(() => { changePage(1); });
                    btnDnController.click(() => { changePage(-1); });
                    const downloads = downloadsContainer.append('p');
                    downloads.append('b').text(' Download WEVOTE classification: ');
                    const downloadCSVBtn = downloads.append('button')
                        .attr('class', 'btn btn-primary btn-xs');
                    const downloadTabBtn = downloads.append('button')
                        .attr('class', 'btn btn-primary btn-xs');
                    downloadCSVBtn.text('csv');
                    downloadTabBtn.text('tab-delimeted');
                    $(<any>downloadCSVBtn.node()).click(() => {
                        this.downloadWevolteClassification(['SeqId'].concat(xValues), entries);
                    });
                    $(<any>downloadTabBtn.node()).click(() => {
                        this.downloadWevolteClassification(['SeqId'].concat(xValues), entries, "\t");
                    });
                    changePage(0);
                }
            }, false);
        };

        constructor() {
        }


        public static factory(): ng.IDirectiveFactory {
            let d = () => {
                return new WevoteTableDirective();
            };
            d.$inject = WevoteTableDirective._inject;
            return d;
        }
    }


    export class AbundanceTableDirective implements ng.IDirective {
        restrict: string = 'E';
        public replace: boolean = false;
        public static readonly directiveName: string = 'mvAbundanceTable';
        private static readonly _inject: string[] = [];

        public controller = AbundanceTableController.$inject;
        public scope = {
            results: '=results',
            config: '=config'
        };
        public bindToController = {
            results: '=',
            config: '=',
            header: '=',
            entries: '='
        };

        readonly heatmapMaxEntries = 10;

        private downloadAbundance = (header: string[], data: IAbundanceTableEntry[], seperator: string = ',') => {
            const textual: string = [header.concat([
                'superkingdom', 'kingdom', 'phylum', 'class', 'order', 'family', 'genus', 'species'
            ]).join(seperator)].concat(data.map((entry: IAbundanceTableEntry) => {
                return [entry.taxon, entry.count,
                entry.taxline.superkingdom,
                entry.taxline.kingdom,
                entry.taxline.phylum,
                entry.taxline.class,
                entry.taxline.order,
                entry.taxline.family,
                entry.taxline.genus,
                entry.taxline.species].join(seperator);
            })).join("\n");

            const a = window.document.createElement('a');
            a.href = window.URL.createObjectURL(new Blob([textual], { type: 'text/csv' }));
            a.download = `abundance.${(seperator === ',') ? 'csv' : 'txt'}`;
            // Append anchor to body.
            document.body.appendChild(a);
            a.click();
            // Remove anchor from body
            document.body.removeChild(a);
        };

        public link = (scope: ITableScope<IAbundanceTableEntry>,
            element: ng.IAugmentedJQuery, attrs: ng.IAttributes, ngModel: any) => {

            const container = d3.select(element[0]).append('div').attr('class', 'row tab-content');
            const downloadsContainer = container.append('div').attr('class', 'row').append('div').attr('class', 'col-xs-12');
            const tableContainer = container.append('div').attr('class', 'row');
            const pagingDiv = tableContainer.append('div').attr('class', 'col-xs-1');
            const heatmapDiv = tableContainer.append('div').attr('class', 'col-xs-11')
                .style('width', '700px')
                .style('height', '800px');
            pagingDiv.append('p').html('<br/><br/><br/><br/><br/><br/><br/><br/>');
            const btnUp = pagingDiv.append('button');
            pagingDiv.append('p').html('<br/>');
            const btnDn = pagingDiv.append('button');

            [btnUp, btnDn].forEach((btn: any) => {
                btn.attr('type', 'button');
                btn.attr('class', 'btn btn-warning btn-xs');
            });
            btnUp.append('i').attr('class', 'fa fa-arrow-circle-up');
            btnDn.append('i').attr('class', 'fa fa-arrow-circle-down');
            const btnUpController = <any>$(<any>btnUp.node());
            const btnDnController = <any>$(<any>btnDn.node());

            const heatmap = heatmapDiv.append('div');
            const heatmapElement = <any>heatmap.node();
            scope.$watch('entries', (entries: Array<IAbundanceTableEntry>) => {
                if (entries && scope.header) {
                    const xValues = scope.header.slice(1);
                    const yValues = entries.map((entry: IAbundanceTableEntry) => { return entry.taxon; });
                    const zValues = entries.map((entry: IAbundanceTableEntry) => {
                        return [Math.log(entry.count)];
                    });
                    const txt = entries.map((entry: IAbundanceTableEntry) => {
                        return [`${entry.count}`];
                    });

                    let layout: any = {
                        annotations: new Array<any>(),
                        xaxis: {
                            visible: true,
                            type: 'category',
                            ticks: '',
                            side: 'top',
                            fixedrange: true,
                            autosize: false
                        },
                        yaxis: {
                            visible: true,
                            type: 'category',
                            ticks: '',
                            ticksuffix: ' ',
                            fixedrange: true,
                            autosize: false
                        }
                    };

                    const data = {
                        x: xValues,
                        y: yValues,
                        z: zValues,
                        text: entries.map((entry: IAbundanceTableEntry) => {
                            const line = [
                                entry.taxline.superkingdom,
                                entry.taxline.kingdom,
                                entry.taxline.phylum,
                                entry.taxline.class,
                                entry.taxline.order,
                                entry.taxline.family,
                                entry.taxline.genus,
                                entry.taxline.species
                            ].filter((s: string) => { return s != ''; })
                                .join('; ');
                            return (line.length < 105) ? [line] : ['.. ' + line.slice(line.length - 105)];
                        }),
                        hoverinfo: 'text',
                        type: 'heatmap',
                        colorscale: 'Viridis',
                        showscale: false
                    }

                    type Range = [Plotly.Datum, Plotly.Datum];

                    for (let i = 0; i < yValues.length; i++)
                        for (let j = 0; j < xValues.length; j++) {
                            const currentValue = zValues[i][j];
                            const result = {
                                xref: 'x1',
                                yref: 'y1',
                                x: xValues[j],
                                y: yValues[i],
                                text: txt[i][j],
                                font: {
                                    family: 'Arial',
                                    size: 12,
                                    color: 'white'
                                },
                                showarrow: false
                            };
                            layout.annotations.push(result);
                        }

                    const pagesCount = Math.ceil(yValues.length / this.heatmapMaxEntries);
                    const pages = new Array<Array<number>>();
                    for (let i = 0; i < pagesCount; i++)
                        pages.push([i * this.heatmapMaxEntries, (i + 1) * this.heatmapMaxEntries]);

                    let currentPage = 0;
                    const changePage = (delta: number) => {
                        currentPage += delta;
                        if (currentPage < 0) {
                            currentPage = 0;
                            return;
                        }
                        if (currentPage >= pagesCount) {
                            currentPage = pagesCount - 1;
                            return;
                        }
                        const range: any = [pages[currentPage][0], pages[currentPage][1]];


                        layout.title = `Abundance (${currentPage + 1}/${pagesCount})`;
                        layout.yaxis.range = range;
                        let initialized = false;
                        if (!initialized) {
                            initialized = true;
                            Plotly.newPlot(heatmapElement, <any>[data], <any>layout);
                        }
                        else Plotly.relayout(heatmapElement, <any>layout);


                    };
                    btnUpController.click(() => { changePage(1); });
                    btnDnController.click(() => { changePage(-1); });
                    const downloads = downloadsContainer.append('p');
                    downloads.append('b').text(' Download Abundance: ');
                    const downloadCSVBtn = downloads.append('button')
                        .attr('class', 'btn btn-primary btn-xs');
                    const downloadTabBtn = downloads.append('button')
                        .attr('class', 'btn btn-primary btn-xs');
                    downloadCSVBtn.text('csv');
                    downloadTabBtn.text('tab-delimeted');
                    $(<any>downloadCSVBtn.node()).click(() => {
                        this.downloadAbundance(scope.header, entries);
                    });
                    $(<any>downloadTabBtn.node()).click(() => {
                        this.downloadAbundance(scope.header, entries, "\t");
                    });
                    changePage(0);
                }
            }, false);
        };

        constructor() {
        }


        public static factory(): ng.IDirectiveFactory {
            let d = () => {
                return new AbundanceTableDirective();
            };
            d.$inject = AbundanceTableDirective._inject;
            return d;
        }
    }

    metavizApp
        .directive(HelloWorldDirective.directiveName,
        HelloWorldDirective.factory())
        .directive(DonutChartDirective.directiveName,
        DonutChartDirective.factory())
        .directive(AlgorithmsVennDiagramDirective.directiveName,
        AlgorithmsVennDiagramDirective.factory())
        .directive(AbundanceSunburstDirective.directiveName,
        AbundanceSunburstDirective.factory())
        .directive(WevoteTableDirective.directiveName,
        WevoteTableDirective.factory())
        .directive(AbundanceTableDirective.directiveName,
        AbundanceTableDirective.factory())
        ;
}