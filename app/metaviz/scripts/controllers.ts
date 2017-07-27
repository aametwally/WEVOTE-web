/**
 * Created by asem on 06/06/17.
 */
"use strict";
namespace metaviz {
    interface MainControllerScope extends ng.IScope {
        message: String,
    }
    export class MainController {
        static readonly $inject: any = ['$scope', MainController];
        private _scope: MainControllerScope;

        constructor($scope: ng.IScope) {
            this._scope = <MainControllerScope>$scope;
            this._scope.message = "Hello, this is metaviz ...";
            console.log(this._scope.message);
        }

    }

    export interface IDonutChartData {
        description: string,
        array: Array<number>
    }
    export interface IDonutChartScope extends ng.IScope {
        data: IDonutChartData
    }

    export class DonutChartController {
        static readonly $inject: any = ['$scope', '$interval', DonutChartController];
        private _scope: IDonutChartScope;

        constructor(private $scope: ng.IScope, private $interval: ng.IIntervalService) {
            this._scope = <IDonutChartScope>$scope;
            this._scope.data = {
                array: [1, 2, 3, 4],
                description: "some description"
            };
            // Either use setInterval then invoke $apply, or just use $interval angular's service.
            $interval(() => {
                this._scope.data.array = d3.range(10).map(function (d) {
                    return Math.random();
                });
            }, 1000);
        }
    }
/** 
    enum Normalization {
        LOG,
        SQRT
    }
    enum LayerType {
        NEWICK_TREE,
        STACKBAR_LAYER,
        CATEGORICAL_LAYER,
        NUMERICAL_LAYER
    }

    export interface ILayerFonts {

    }
    export interface IViewSetting {
        normalization?: any, //css:normalization
        min?: any, // css:input-min
        minDisabled?: Boolean, // css:input-min:disbled
        max?: any // css:input-max
        maxDisabled?: Boolean // css:input-max:disbaled
    }
    export interface ILayerSetting {
        color: string | number | string[], // css:colorpicker:last
        height: string | number | string[], // css:input-height
        margin: string | number | string[], // css:input-margin
        type: string | number | string[], // css:type  if type=='text', height=0;
        colorStart: string | number | string[] // css:colorpicker:first
    }

    export interface ILayerData {

    }

    export interface ILayer {
        layerSetting?: ILayerSetting,
        layerData?: ILayerData
        name?: string,
        order?: number,
        fonts?: ILayerFonts,
    }

    export interface IView {
        setting?: Map<any, IViewSetting>,
        layers?: Map<any, ILayer>
        layersOrder?: Array<any>
    }

    export interface ITimer {

    }


    export interface ITreeDrawerScope extends ng.IScope {
        timer: ITimer,
        view: IView,
        treeSVGId: string,
        fontHeight: number,
        rootLength: number,
        hasTree: Boolean
    }

    export class TreeDrawerController {

        static readonly $inject: any = ['$scope', '$interval', TreeDrawerController];
        private _scope: ITreeDrawerScope;
        private _currentView: string;

        constructor(private $scope: ng.IScope, private $interval: ng.IIntervalService) {
            this._scope = <ITreeDrawerScope>$scope;
        }

        private populateDrawerData = () => {

        }

        private getLayerId = (layerName: string) => {
            const layers = this._scope.view.layers;
            const layersCount = layers.size;
            for (let i = 0; i < layersCount; i++)
                if (layers[i].name == layerName)
                    return i;

            return -1;
        }

        private getLayerName = (layerId: any): string => {
            return this._scope.view.layers[layerId].name;
        }

        // From table to model.
        private syncViews = () => {
            let view = this._scope.view;
            let layersOrder = view.layersOrder;
            let viewSetting = view.setting;
            let layers = view.layers;

            layersOrder = new Array();
            viewSetting = new Map();
            $('#tbody_layers tr').each(
                (index, layer) => {

                    const layerIdStr: string = $(layer).find('.input-height')[0].id.replace('height', '');
                    const layerId: any = this.getLayerId(layerIdStr);
                    layers[layerId] = {};
                    layersOrder.push(layerId);

                    let vSetting: IViewSetting = viewSetting[layerId];
                    vSetting.normalization = $(layer).find('.normalization').val();
                    vSetting.min = $(layer).find('.input-min').val();
                    vSetting.minDisabled = $(layer).find('.input-min').is(':disabled');
                    vSetting.max = $(layer).find('.input-max').val();
                    vSetting.maxDisabled = $(layer).find('.input-max').is(':disabled');

                    let lSetting: ILayerSetting = layers[layerId].layerSetting;
                    lSetting.color = $(layer).find('.colorpicker:last').attr('color');
                    lSetting.height = $(layer).find('.input-height').val();
                    lSetting.margin = $(layer).find('.input-margin').val();
                    lSetting.type = $(layer).find('.type').val();
                    lSetting.colorStart = $(layer).find('.colorpicker:first').attr('color');

                    if (lSetting.type === 'text')
                        lSetting.height = '0';
                }
            );
        }


        private drawTree = () => {
            var settings = serializeSettings();
            tree_type = settings['tree-type'];

            $('#draw_delta_time').html('');
            $('#btn_draw_tree').prop('disabled', true);
            $('#bin_settings_tab').removeClass("disabled"); // enable bins tab
            $('#sample_settings_tab').removeClass("disabled"); // enable bins tab
            $('#mouse_tooltips_tab').removeClass("disabled"); // enable bins tab
            $('#search_panel_tab').removeClass("disabled"); // enable bins tab


            // clear existing diagram, if any
            document.getElementById('svg').innerHTML = "";

            waitingDialog.show('Drawing ...',
                {
                    dialogSize: 'sm',
                    onShow: function () {
                        var drawer = new Drawer(settings);
                        drawer.draw();

                        // last_settings used in export svg for layer information,
                        // we didn't use "settings" sent to draw_tree because draw_tree updates layer's min&max
                        last_settings = serializeSettings();

                        redrawBins();

                        waitingDialog.hide();
                        $('#btn_draw_tree').prop('disabled', false);
                        $('#btn_redraw_samples').prop('disabled', false);

                        if (settings['tree-radius'] == 0) {
                            $('#tree-radius-container').show();
                            $('#tree-radius').val(Math.max(VIEWER_HEIGHT, VIEWER_WIDTH));
                        }

                        if (autoload_collection !== null) {
                            loadCollection(autoload_collection);
                            autoload_collection = null;
                        }
                    },
                });
        }


    }
    **/
    
    metavizApp
        .controller('MainController', MainController.$inject)
        .controller('DonutChartController', DonutChartController.$inject)
        ;
}