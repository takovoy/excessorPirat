
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