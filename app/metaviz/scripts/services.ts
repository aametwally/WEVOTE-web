/**
 * Created by asem on 06/06/17.
 */
namespace metaviz {
    "use strict";
    export class HelloFactory  {
        static readonly $inject = [HelloFactory.factory()];

        static factory() {
            let instance = () =>
                new HelloFactory();
            return instance;
        }

        public hello = () => {
            console.log("Hello, this is HelloFactory");
        }
    }
    metavizApp
        .factory('HelloService', HelloFactory.$inject)

        ;
}