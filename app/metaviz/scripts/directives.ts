'use strict';

'use strict';
namespace metaviz{
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
                if( arcData.length < path.size())
                {
                    console.warn('TODO: Count for case when new data items are less than current selections.');
                }
                path = path.data(arcData).enter().append('path').merge(<any>path);
                path.attr('d', <any> this._arcgen)
                    .attr('fill', (d: any, i: any) => {
                        return this._colors(i);
                    });
            },true);
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

    metavizApp.directive(HelloWorldDirective.directiveName,
        HelloWorldDirective.factory())
        .directive(DonutChartDirective.directiveName,
            DonutChartDirective.factory())
    ;
}