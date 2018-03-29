function DataStack (options) {
    options = options || {};
    this.stack = {};
    this.debug = options.debug || false;
}

DataStack.prototype.get = function (module, property) {
    if(!this.stack[module]){
        this.error('Unexpected module: ' + module);
        return false;
    }
    return this.stack[module][property];
};

DataStack.prototype.set = function (module, property, value) {
    if(!this.stack[module]){
        this.stack[module] = {};
        if(this.debug){
            this.log('Resolved data space for module: ' + module);
        }
    }
    this.stack[module][property] = value;
    return value;
};

DataStack.prototype.error = function (error) {
    console.error('DataStack error:\n',error);
};

DataStack.prototype.log = function (message) {
    console.log('DataStack log message:\n',message);
};

var excessor = excessor || new DataStack();


excessor.set('pirate', 'compileNextState', function (operation) {
    var incidence = 1000 / this.fps;
    var step = (operation.endShift - operation.startShift) / (operation.time / incidence);

    if (operation._shift >= operation.endShift) {
        operation._shift = operation.endShift;
    }

    operation.frame(operation.start + (operation.end - operation.start) * operation.shift);

    if (
        operation._shift >= operation.endShift && !operation.reverse ||
        operation._shift <= operation.startShift && operation.reverse
    ) {
        if (operation.recourse) {
            operation.repeat();
            return;
        }
        this.remove(operation.id);
        operation.callback(operation.callbackAttribute);
        return;
    }

    if (!operation.reverse) {
        operation._shift += step * operation.rate;
    } else {
        operation._shift -= step * operation.rate;
    }
});

(function() {
    function Pirate (fps) {
      this.stack = {};
      this.fps = 0;
      this._fps = fps;
    }

    Pirate.prototype.play = function(fps){
      this.fps = +fps || this.fps;
    };


    Pirate.prototype.pause = function(){
      var fps     = this.fps;
      this.fps    = 0;
      this._fps   = fps;
    };

    Pirate.prototype.render = function(){
        var stack = this.stack;
        for (var key in stack) {
            excessor.get('pirate', 'compileNextState').call(this, stack[key]);
        }
    };

    Pirate.prototype.append = function (operation) {
      if (Object.keys(this.stack).length === 0) {this.play()}
      this.stack[operation.id] = operation;
    };

    Pirate.prototype.remove = function(id){
      delete this.stack[id];
      if (Object.keys(this.stack).length === 0) {this.pause()}
    };

    Object.defineProperty(Pirate.prototype, 'fps', {
      get: function(){
        return this._fps;
      },
      set: function(value){
        var self = this;
        if (this.core) {clearInterval(this.core)}
        if (value) {
          this.core = setInterval(function(){
            self.render();
          }, 1000 / +value);
        }
        this._fps = value
      }
    });

    excessor.set('pirate', 'core', Pirate);
})();



(function () {
    function isNotNegativeNumber (value) {
        return typeof +value === "number" && +value >= 0
    }

    function isHEXColor (string) {
        return (string.length === 7 && string.search(/#[0-9a-f]{6}/i) === 0) || (string.length === 4 && string.search(/#[0-9a-f]{3}/i) === 0)
    }

    function isRGB (string) {
        return string.search(/rgb\(( ?\d{1,3},){2} ?\d{1,3}\)/i) === 0
    }

    function isRGBA (string) {
        return string.search(/rgba\(( ?\d{1,3},){3}( ?\d(\.\d+)?)\)/i) === 0
    }

    function isColor (string) {
        return isHEXColor(string) || isRGB(string) || isRGBA(string);
    }

    var formula = {
        getPointOnCircle: function(radian,radius,centerX,centerY){
            centerX = +centerX || 0;
            centerY = +centerY || 0;
            var y   = +radius * Math.sin(+radian);
            var x   = +radius * Math.cos(+radian);
            return  [centerX + x,centerY + y];
        },

        getPointOnEllipse: function(radiusX, radiusY, shift, tilt, centerX, centerY){
            tilt    = tilt || 0;
            tilt    *= -1;
            centerX = centerX || 0;
            centerY = centerY || 0;

            var x1  = radiusX*Math.cos(+shift),
                y1  = radiusY*Math.sin(+shift),
                x2  = x1 * Math.cos(tilt) + y1 * Math.sin(tilt),
                y2  = -x1 * Math.sin(tilt) + y1 * Math.cos(tilt);

            return [x2 + centerX, y2 + centerY];
        },

        getPointsFromPolygon: function(sidesCount, radian, radius, centerX, centerY){
            var coord = [];
            coord.push(this.getPointOnCircle(radian, radius, centerX, centerY));
            for(var i = 0;i < sidesCount;i++){
                coord.push(this.getPointOnCircle(Math.PI * 2 / sidesCount * i + radian, radius, centerX, centerY));
            }
            return coord;
        },

        getPointOnCurve: function(shift, points){
            var result = [0, 0];
            var powerOfCurve = points.length - 1;
            for(var i = 0; points[i]; i++){
                var polynom = (this.factorial(powerOfCurve) / (this.factorial(i) * this.factorial(powerOfCurve - i))) *
                    Math.pow(shift, i) *
                    Math.pow(1 - shift, powerOfCurve - i);
                result[0] += points[i][0] * polynom;
                result[1] += points[i][1] * polynom;
            }
            return result;
        },

        getPointOnLine: function(shift, points){
            var x   = (points[1][0] - points[0][0]) * shift + points[0][0],
                y   = (points[1][1] - points[0][1]) * shift + points[0][1];
            return [x, y];
        },

        getCenterToPointDistance : function(coordinates){
            return Math.sqrt(Math.pow(coordinates[0], 2) + Math.pow(coordinates[1], 2));
        },

        HEXtoRGBA: function(color){
            var rgba = [];
            if(color.length === 4){
                rgba[0] = parseInt(color.substring(1,2) + color.substring(1,2),16);
                rgba[1] = parseInt(color.substring(2,3) + color.substring(2,3),16);
                rgba[2] = parseInt(color.substring(3) + color.substring(3),16);
            }
            if(color.length === 7){
                rgba[0] = parseInt(color.substring(1,3),16);
                rgba[1] = parseInt(color.substring(3,5),16);
                rgba[2] = parseInt(color.substring(5),16);
            }
            rgba[3] = 1;
            return rgba;
        },

        RGBtoRGBA: function(color){
            var rgba = color.match(/\d{1,3}(\.\d+)?/g);
            if ( rgba[3] === "0" ) {
                rgba[3] = 0;
            } else {
                rgba[3] = +rgba[3] || 1;
            }
            return rgba;
        },

        changeColor: function(start, end, shift){
            var result = [];

            //проверка начальной позиции
            if ( isRGBA(start) || isRGB(start) ) {
                start = formula.RGBtoRGBA(start);
            } else if ( isHEXColor(start) ) {
                start = formula.HEXtoRGBA(start)
            }

            //проверка конечной позиции
            if ( isRGBA(end) || isRGB(end) ) {
                end = formula.RGBtoRGBA(end);
            } else if ( isHEXColor(end) ) {
                end = formula.HEXtoRGBA(end)
            }

            for(var i = 0; i < 3; i++){
                result[i] = Math.round(+start[i] + (+end[i] - +start[i]) * shift);
            }
            var opacity = +(+start[3] + (+end[3] - +start[3]) * shift).toFixed(4);
            return 'rgba(' + result[0] + ',' + result[1] + ',' + result[2] + ',' + opacity + ')';
        },

        factorial : function (number) {
            var result = 1;
            while(number){
                result *= number--;
            }
            return result;
        },

        getAngleOfVector: function (point, center) {
            center = center || [0,0];
            point = point || [0,0];
            point = [point[0] - center[0],point[1] - center[1]];
            var distance = formula.getCenterToPointDistance(point);
            var angle = Math.asin(point[1]/distance);
            var acos  = Math.acos(point[0]/distance);
            if(acos > Math.PI/2){
                return Math.PI - angle;
            }
            return angle;
        },

        getLengthOfCurve: function (points, step) {
            step = step || 1;
            var result = 0;
            var lastPoint = points[0];
            for(var sift = 0;sift <= 100;sift += step){
                var coord = formula.getPointOnCurve(sift,points);
                result += formula.getCenterToPointDistance([
                    coord[0] - lastPoint[0],
                    coord[1] - lastPoint[1]
                ]);
                lastPoint = coord;
            }
            return result;
        },

        getMapOfSpline: function (points, step) {
            var map = [[]];
            var index = 0;
            for(var i = 0;points[i];i++){
                var curvePointsCount = map[index].length;
                map[index][+curvePointsCount] = points[i];
                if(points[i][2] && i != points.length - 1){
                    map[index] = formula.getLengthOfCurve(map[index],step);
                    index++;
                    map[index] = [points[i]];
                }
            }
            map[index] = formula.getLengthOfCurve(map[index],step);
            return map;
        },

        getPointOnSpline: function (shift, points, services) {
            var shiftLength = services.length * shift;
            if(shift >= 1){
                shiftLength = services.length;
            }
            var counter = 0;
            var lastControlPoint = 0;
            var controlPointsCounter = 0;
            var checkedCurve = [];
            for(; services.map[lastControlPoint] && counter + services.map[lastControlPoint] < shiftLength; lastControlPoint++){
                counter += services.map[lastControlPoint];
            }
            for(var pointIndex = 0; points[pointIndex] && controlPointsCounter <= lastControlPoint; pointIndex++){
                if(points[pointIndex][2] === true){
                    controlPointsCounter++;
                }
                if(controlPointsCounter >= lastControlPoint){
                    checkedCurve.push(points[pointIndex]);
                }
            }
            return formula.getPointOnCurve(
                (shiftLength - counter) / (services.map[lastControlPoint] / 100),
                checkedCurve
            );
        },

        getLengthOfEllipticArc: function (radiusX, radiusY, startRadian, endRadian, step) {
            step = step || 1;
            var length = 0;
            var lastPoint = this.getPointOnEllipse(radiusX,radiusY,startRadian);
            var radianPercent = (endRadian - startRadian) / 100;
            for(var i = 0;i<=100;i+=step){
                var radian = startRadian + radianPercent * i;
                var point = this.getPointOnEllipse(radiusX,radiusY,radian);
                length += this.getCenterToPointDistance([point[0]-lastPoint[0],point[1]-lastPoint[1]]);
                lastPoint = point;
            }
            return length;
        },

        getMapOfPath: function (points, step) {
            var map = [[]];
            var index = 0;
            var lastPoint = [];
            for(var i = 0;points[i];i++){
                var point = points[i];
                if(point.length > 3){
                    map[index] = this.getLengthOfEllipticArc(point[0], point[1], point[2], point[3], step);
                    if(!points[i+1]){continue}
                    var centerOfArc = this.getPointOnEllipse(point[0], point[1], point[2] + Math.PI, point[4], lastPoint[0], lastPoint[1]);
                    var endOfArc = this.getPointOnEllipse(point[0], point[1], point[3], point[4], centerOfArc[0], centerOfArc[1]);
                    index++;
                    map[index] = [endOfArc];
                    lastPoint = endOfArc;
                    continue;
                }
                map[index].push(point);
                if(point[2] === true || (points[i+1] && points[i+1].length > 3)){
                    map[index] = formula.getLengthOfCurve(map[index],step);
                    index++;
                    map[index] = [point];
                }
                lastPoint = point;
            }
            if(typeof map[index] !== 'number'){map[index] = formula.getLengthOfCurve(map[index],step);}
            return map;
        },

        getPointOnPath: function (shift, points, services) {
            var shiftLength = services.length * shift;
            if(shift >= 1){
                shiftLength = services.length;
            }
            var counter = 0;
            var lastControlPoint = 0;
            var controlPointsCounter = 0;
            var checkedCurve = [];
            for(; services.map[lastControlPoint] && counter + services.map[lastControlPoint] < shiftLength; lastControlPoint++){
                counter += services.map[lastControlPoint];
            }
            var lastPoint = [];
            for(var pointIndex = 0; points[pointIndex] && controlPointsCounter <= lastControlPoint; pointIndex++){
                var point = points[pointIndex];
                if(point.length > 3){
                    var centerOfArc = this.getPointOnEllipse(point[0], point[1], point[2] + Math.PI, point[4], lastPoint[0], lastPoint[1]);
                    if(controlPointsCounter === lastControlPoint){
                        var percent = (shiftLength - counter) / (services.map[lastControlPoint] / 100);
                        var resultRadian = point[2] + ((point[3] - point[2])/100*percent);
                        return this.getPointOnEllipse(point[0], point[1], resultRadian, point[4], centerOfArc[0], centerOfArc[1]);
                    }
                    lastPoint = this.getPointOnEllipse(point[0], point[1], point[3], point[4], centerOfArc[0], centerOfArc[1]);
                    controlPointsCounter++;
                    if(controlPointsCounter === lastControlPoint){
                        checkedCurve.push(lastPoint);
                    }
                    continue
                }
                if(point[2] === true || (points[pointIndex+1] && points[pointIndex+1].length > 3)){
                    controlPointsCounter++;
                }
                if(controlPointsCounter >= lastControlPoint){
                    checkedCurve.push(point);
                }
                lastPoint = point;
            }
            return this.getPointOnCurve(
                (shiftLength - counter) / (services.map[lastControlPoint] / 100),
                checkedCurve
            );
        }
    };

    excessor.set('pirate', 'formula', formula);
})();

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

