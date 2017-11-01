"use strict";

namespace metaviz {
    export let metavizApp =
        angular.module('metaviz', [
            'ngResource',
            'ui.bootstrap.popover',
            'ui.bootstrap.tpls',
            'ngDialog'])
        ;
}