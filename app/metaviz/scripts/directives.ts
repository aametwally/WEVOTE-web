'use strict';

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


    export class DonutChartDirective implements ng.IDirective {
        restrict: string = 'E';
        public replace: boolean = true;
        public static readonly directiveName: string = 'mvDonutchart';
        private static readonly _inject: string[] = [];
        // public require = 'array';
        public scope = {
            data: '=array'
        };

        private readonly _w = 500;
        private readonly _h = 500;
        private readonly _min = Math.min(this._w, this._h);
        private readonly _colors = d3.scaleOrdinal(d3.schemeCategory20);
        private readonly _pie = d3.pie().sort(null);
        private readonly _arcgen = d3.arc()
            .innerRadius(this._min * 0.5 * 0.9)
            .outerRadius(this._min * 0.5 * 0.5);

        public link = (scope: ng.IScope, element: ng.IAugmentedJQuery, attrs: ng.IAttributes, ngModel: any) => {

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
        sets: Array<IAlgorithmsVennSets>
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
        public scope = {
            sets: '=sets'
        };

        private readonly _w = 500;
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

                            // Display a tooltip with the current size
                            tooltip
                                .transition()
                                .duration(400)
                                .style("opacity", .9);

                            tooltip
                                .text( `${ d.sets.join(' ∩ ') } = ${d.size} nodes`);

                            // highlight the current path
                            var selection =
                                d3.select(this)
                                    .transition()
                                    .duration(400);

                            selection.select("path")
                                .style("fill-opacity", d.sets.length == 1 ? .4 : .1)
                                .style("stroke-opacity", 1);
                        })
                        .on("mousemove", function () {
                            tooltip.style("left", `${d3.event.pageX}px`)
                                .style("top", `${d3.event.pageY - 28}px`);
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

    metavizApp
        .directive(HelloWorldDirective.directiveName,
        HelloWorldDirective.factory())
        .directive(DonutChartDirective.directiveName,
        DonutChartDirective.factory())
        .directive(AlgorithmsVennDiagramDirective.directiveName,
        AlgorithmsVennDiagramDirective.factory())
        ;
}