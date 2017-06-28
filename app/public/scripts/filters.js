'use strict';
angular.module('wevoteApp')
    .filter('shortNumber', function () {
        return function (number) {
            if (number) {
                var abs = Math.abs(number);
                if (abs >= Math.pow(10, 12)) {
                    // trillion
                    number = (number / Math.pow(10, 12)).toFixed(1) + "T";
                } else if (abs < Math.pow(10, 12) && abs >= Math.pow(10, 9)) {
                    // billion
                    number = (number / Math.pow(10, 9)).toFixed(1) + "B";
                } else if (abs < Math.pow(10, 9) && abs >= Math.pow(10, 6)) {
                    // million
                    number = (number / Math.pow(10, 6)).toFixed(1) + "M";
                } else if (abs < Math.pow(10, 6) && abs >= Math.pow(10, 3)) {
                    // thousand
                    number = (number / Math.pow(10, 3)).toFixed(1) + "K";
                }
                return number;
            }
        };
    });