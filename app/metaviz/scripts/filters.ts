"use strict";
namespace metaviz {
    export class ShortNumberFilter {
        static readonly $inject: any = [ShortNumberFilter.filter];

        public static filter() {
            return (num: any) => {
                if (num) {
                    let abs = Math.abs(num);
                    if (abs >= Math.pow(10, 12)) {
                        // trillion
                        num = (num / Math.pow(10, 12)).toFixed(1) + "T";
                    } else if (abs < Math.pow(10, 12) && abs >= Math.pow(10, 9)) {
                        // billion
                        num = (num / Math.pow(10, 9)).toFixed(1) + "B";
                    } else if (abs < Math.pow(10, 9) && abs >= Math.pow(10, 6)) {
                        // million
                        num = (num / Math.pow(10, 6)).toFixed(1) + "M";
                    } else if (abs < Math.pow(10, 6) && abs >= Math.pow(10, 3)) {
                        // thousand
                        num = (num / Math.pow(10, 3)).toFixed(1) + "K";
                    }
                    return num;
                }
            };
        }
    }

    metavizApp
        .filter('shortNumber', ShortNumberFilter.$inject)
        ;


}