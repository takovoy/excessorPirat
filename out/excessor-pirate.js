'use strict';Object.defineProperty(exports,'__esModule',{value:true});var excessor_trigonometry_1=require('excessor-trigonometry');var ExcessorPirate;(function(ExcessorPirate){var DefaultTimingFunctionsEnum;(function(DefaultTimingFunctionsEnum){DefaultTimingFunctionsEnum['ease']='ease';DefaultTimingFunctionsEnum['easeIn']='ease-in';DefaultTimingFunctionsEnum['easeOut']='ease-out';DefaultTimingFunctionsEnum['easeInOut']='ease-in-out';}(DefaultTimingFunctionsEnum=ExcessorPirate.DefaultTimingFunctionsEnum||(ExcessorPirate.DefaultTimingFunctionsEnum={})));ExcessorPirate.DEFAULT_TIMING_FUNCTIONS={ease:[[0.25,0.1],[0.25,1]],'ease-in':[[0.42,0],[1,1]],'ease-out':[[0,0],[0.58,1]],'ease-in-out':[[0.42,0],[0.58,1]]};var Operation=function(){function Operation(options){this.id=options.id||''+Math.random();this.frame=options.frame||function(){};this.callback=options.callback||function(){};this.endShift=options.endShift||1;this.startShift=options.startShift||0;this.rawShift=options.shift||this.startShift;this.start=options.start||0;this.end=options.end||1;this.time=options.time;this.rate=options.rate||1;this.factor=options.factor||1;this.recourse=!!options.recourse;this.reverse=!!options.reverse;if(options.end===0){this.end=0;}if(options.timingFunction){this.timingFunction=options.timingFunction;}}Object.defineProperty(Operation.prototype,'shift',{get:function(){if(this._timingFunction){return+this.rawShift*excessor_trigonometry_1.TRIGONOMETRY.getPointOnCurve(this.rawShift*100,this.timingFunction)[1];}return+this.rawShift;},enumerable:true,configurable:true});Object.defineProperty(Operation.prototype,'timingFunction',{get:function(){var array=[[0,0]];if(typeof this._timingFunction==='string'&&ExcessorPirate.DEFAULT_TIMING_FUNCTIONS[this._timingFunction]){array=array.concat(ExcessorPirate.DEFAULT_TIMING_FUNCTIONS[this._timingFunction]);}else if(typeof this._timingFunction!=='string'){array=array.concat(this._timingFunction);}array.push([1,1]);return array;},set:function(value){this._timingFunction=value;},enumerable:true,configurable:true});Operation.prototype.play=function(rate){this.rate=rate||1;};Operation.prototype.pause=function(){this.rate=0;};Operation.prototype.stop=function(){this.rate=0;if(!this.reverse){this.rawShift=this.startShift;}else{this.rawShift=this.endShift;}};Operation.prototype.repeat=function(){if(!this.reverse){this.rawShift=this.startShift;}else{this.rawShift=this.endShift;}};return Operation;}();ExcessorPirate.Operation=Operation;function compileNextState(operation){var incidence=1000/this.fps;var step=(operation.endShift-operation.startShift)/(operation.time/ incidence);if(operation.rawShift>=operation.endShift){operation.rawShift=operation.endShift;}operation.frame(operation.start+(operation.end-operation.start)*operation.shift);if(operation.rawShift>=operation.endShift&&!operation.reverse||operation.rawShift<=operation.startShift&&operation.reverse){if(operation.recourse){operation.repeat();return;}this.remove(operation);operation.callback();return;}if(!operation.reverse){operation.rawShift+=step*operation.rate;}else{operation.rawShift-=step*operation.rate;}}ExcessorPirate.compileNextState=compileNextState;var Pirate=function(){function Pirate(fps){this.stack={};this.compileNextState=compileNextState;this.fps=0;this._fps=fps;}Object.defineProperty(Pirate.prototype,'fps',{get:function(){return this._fps;},set:function(value){var self=this;if(this.core){clearInterval(this.core);}if(value){this.core=setInterval(function(){self.render();},1000/+value);}this._fps=value;},enumerable:true,configurable:true});;Pirate.prototype.play=function(fps){this.fps=+fps||this.fps;};Pirate.prototype.pause=function(){var fps=this.fps;this.fps=0;this._fps=fps;};Pirate.prototype.render=function(){var _this=this;var stack=this.stack;Object.keys(stack).forEach(function(key){_this.compileNextState(stack[key]);});};Pirate.prototype.append=function(operation){if(Object.keys(this.stack).length===0){this.play();}this.stack[operation.id]=operation;};Pirate.prototype.remove=function(operation){delete this.stack[operation.id];if(Object.keys(this.stack).length===0){this.pause();}};return Pirate;}();ExcessorPirate.Pirate=Pirate;}(ExcessorPirate=exports.ExcessorPirate||(exports.ExcessorPirate={})));