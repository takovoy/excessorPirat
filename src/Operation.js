
@import './formula.js'

(function() {
    var formula = excessor.get('pirate', 'formula');

    function Operation (options) {
        options                 = options || {};
        this.id                 = options.id || ('' + Math.random());
        this.frame              = options.frame || function () {};
        this.callback           = options.callback || function () {};
        this.callbackAttribute  = options.callbackAttribute;
        this.endShift           = options.endShift || 1;
        this.startShift         = options.startShift || 0;
        this._shift             = options.shift || this.startShift;
        this.start              = options.start || 0;
        this.end                = options.end || 1;
        this.time               = +options.time;
        this.rate               = options.rate || 1;
        this.factor             = options.factor || 1;
        this.recourse           = !!options.recourse;
        this.reverse            = !!options.reverse;
        this.timingFunction     = options.timingFunction;
        if (options.end === 0) {this.end = 0}
        this.defaultTimingFunctions = {
            'ease': [[0.25, 0.1], [0.25, 1]],
            'ease-in': [[0.42, 0], [1, 1]],
            'ease-out': [[0, 0], [0.58, 1]],
            'ease-in-out': [[0.42, 0], [0.58, 1]]
        };
    }

    Object.defineProperties(Operation.prototype, {
        shift : {
            get: function(){
                if (this._timingFunction) {
                    return formula.getPointOnCurve(this._shift, this.timingFunction)[1];
                }

                return +this._shift;
            },
            set: function(value){
                return this.shift;
            }
        },
        timingFunction : {
            get: function(){
                var array = [[0, 0]];
                if (typeof this._timingFunction === 'string') {
                    array = array.concat(this.defaultTimingFunctions[this._timingFunction]);
                } else {
                    array = array.concat(this._timingFunction);
                }
                array.push([1, 1]);

                return array;
            },
            set: function(value){
                this._timingFunction = value;
            }
        }
    });

    Operation.prototype.play = function(rate){
        this.rate = rate || 1;
        return this;
    };

    Operation.prototype.pause = function(){
        this.rate = 0;
        return this
    };

    Operation.prototype.stop = function(){
        this.rate = 0;
        if (!this.reverse) {
            this._shift  = this.startShift;
        } else {
            this._shift  = this.endShift;
        }
        return this;
    };

    Operation.prototype.repeat = function(){
        if (!this.reverse) {
            this._shift  = this.startShift;
        } else {
            this._shift  = this.endShift;
        }
    };

    excessor.set('pirate', 'operation', Operation);
})();
