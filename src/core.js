
@import './compileNextState.js'

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

    Pirate.prototype.compileNextState = excessor.get('pirate', 'compileNextState');

    Pirate.prototype.render = function(){
        var stack = this.stack;
        for (var key in stack) {
            this.compileNextState(stack[key]);
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
