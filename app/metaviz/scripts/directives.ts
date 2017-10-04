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
            element.text('Hello World');
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
        sidebar: any,
        togglelegend: any,
        legend: any,
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

        // Mapping of step names to colors.
        readonly colors = {
            "home": "#5687d1",
            "product": "#7b615c",
            "search": "#de783b",
            "account": "#6ab975",
            "other": "#a173d1",
            "end": "#5687d1"
        };
        // Dimensions of sunburst.

        private readonly _w = 750;
        private readonly _h = 600;
        private readonly _radius = Math.min(this._w, this._h) / 2;

        public link = (scope: IAbundanceSunburstDirectiveScope, element: ng.IAugmentedJQuery, attrs: ng.IAttributes, ngModel: any) => {
            // Total size of all segments; we set this later, after loading the data.
            scope.totalSize = 0;

            let vis: IAbundanceSubburstHTMLElement = <any>{};
            vis.main = d3.select(element[0]).append('div').attr('class', 'sunburst-main');
            vis.sequence = vis.main.append('div').attr('class', 'sunburst-sequence');
            vis.chart = vis.main.append('div').attr('class', 'sunburst-chart');
            vis.explanation = vis.chart.append('div').attr('class', 'sunburst-explanation').attr('style', 'visibility: hidden;');
            vis.percentage = vis.explanation.append('span').attr('class', 'sunburst-percentage');
            vis.explanation.append('p').html('<br/> Abundance in sample');
            vis.sidebar = d3.select(element[0]).append('div').attr('class', 'sunburst-sidebar');
            vis.togglelegend = vis.sidebar.append('input').attr('type', 'checkbox');
            vis.sidebar.append('p').html(' Legend<br/>');
            vis.legend = vis.sidebar.append('div').attr('class', 'sunburst-legend').attr('style', "visibility: hidden;");

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
                    this.drawLegend(vis);
                    vis.togglelegend.on("click", this.toggleLegend(vis));

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

        private drawLegend = (vis: IAbundanceSubburstHTMLElement) => {

            // Dimensions of legend item: width, height, spacing, radius of rounded rect.
            const li = {
                w: 75, h: 30, s: 3, r: 3
            };

            vis.legend.append("svg:svg")
                .attr("width", li.w)
                .attr("height", d3.keys(this.colors).length * (li.h + li.s));

            let g = vis.legend.selectAll("g")
                .data(d3.entries(this.colors))
                .enter().append("svg:g")
                .attr("transform", function (d: any, i: any) {
                    return "translate(0," + i * (li.h + li.s) + ")";
                });

            g.append("svg:rect")
                .attr("rx", li.r)
                .attr("ry", li.r)
                .attr("width", li.w)
                .attr("height", li.h)
                .style("fill", function (d: any) { return d.value; });

            g.append("svg:text")
                .attr("x", li.w / 2)
                .attr("y", li.h / 2)
                .attr("dy", "0.35em")
                .attr("text-anchor", "middle")
                .text(function (d: any) { return d.key; });
        }

        private toggleLegend = (vis: IAbundanceSubburstHTMLElement) => {
            let cb = () => {
                if (vis.legend.style("visibility") == "hidden") {
                    vis.legend.style("visibility", "");
                } else {
                    vis.legend.style("visibility", "hidden");
                }
            }
            return cb;
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


    metavizApp
        .directive(HelloWorldDirective.directiveName,
        HelloWorldDirective.factory())
        .directive(DonutChartDirective.directiveName,
        DonutChartDirective.factory())
        .directive(AlgorithmsVennDiagramDirective.directiveName,
        AlgorithmsVennDiagramDirective.factory())
        .directive(AbundanceSunburstDirective.directiveName,
        AbundanceSunburstDirective.factory())
        ;
}