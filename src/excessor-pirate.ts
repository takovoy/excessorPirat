import {TRIGONOMETRY} from 'excessor-trigonometry';

export namespace ExcessorPirate {
    export enum DefaultTimingFunctionsEnum {
        ease = "ease",
        easeIn = 'ease-in',
        easeOut = 'ease-out',
        easeInOut = 'ease-in-out',
    }

    export const DEFAULT_TIMING_FUNCTIONS: {[key: string]: [number, number][]} = {
        ease: [[0.25, 0.1], [0.25, 1]],
        'ease-in': [[0.42, 0], [1, 1]],
        'ease-out': [[0, 0], [0.58, 1]],
        'ease-in-out': [[0.42, 0], [0.58, 1]]
    };

    type TimingFunctionType = [number, number][];
    type ComposedTimingFunctionType = TimingFunctionType | DefaultTimingFunctionsEnum;

    export interface IOperationOptions {
        time: number;
        id?: string;
        frame?: (shift: number) => void;
        callback?: () => void;
        shift?: number;
        startShift?: number;
        endShift?: number;
        start?: number;
        end?: number;
        factor?: number;
        rate?: number;
        recourse?: boolean;
        reverse?: boolean;
        timingFunction: ComposedTimingFunctionType;
    }

    export interface IOperation {
        id: string;
        time: number;
        shift: number;
        start: number;
        end: number;
        startShift: number;
        endShift: number;
        rawShift: number;
        frame: (shift: number) => void;
        callback: () => void;
        recourse: boolean;
        reverse: boolean;
        rate: number;
        play(rate: number): void;
        pause(): void;
        stop(): void;
        repeat(): void;
    }

    export class Operation implements IOperation {
        public readonly id: string;
        public readonly start: number;
        public readonly end: number;
        public readonly time: number;
        public readonly factor: number;
        public rate: number;
        public recourse: boolean;
        public reverse: boolean;
        public readonly frame: (shift: number) => void;
        public readonly callback: () => void;
        public readonly startShift: number;
        public readonly endShift: number;
        public rawShift: number;
        private _timingFunction: [number, number][] | string;
        public get shift() {
            if (this._timingFunction) {
                return +this.rawShift * TRIGONOMETRY.getPointOnCurve(this.rawShift, <TimingFunctionType>this.timingFunction)[1];
            }
            return +this.rawShift;
        }
        private get timingFunction() {
            let array: TimingFunctionType = [[0, 0]];
            if (typeof this._timingFunction === 'string' && DEFAULT_TIMING_FUNCTIONS[this._timingFunction]) {
                array = array.concat(DEFAULT_TIMING_FUNCTIONS[this._timingFunction]);
            } else if (typeof this._timingFunction !== 'string') {
                array = array.concat(this._timingFunction);
            }
            array.push([1, 1]);
            return array;
        }
        private set timingFunction(value: ComposedTimingFunctionType) {
            this._timingFunction = value;
        }

        constructor(options: IOperationOptions) {
            this.id = options.id || ('' + Math.random());
            this.frame = options.frame || (() => {});
            this.callback = options.callback || (() => {});
            this.endShift = options.endShift || 1;
            this.startShift = options.startShift || 0;
            this.rawShift = options.shift || this.startShift;
            this.start = options.start || 0;
            this.end = options.end || 1;
            this.time = options.time;
            this.rate = options.rate || 1;
            this.factor = options.factor || 1;
            this.recourse = !!options.recourse;
            this.reverse = !!options.reverse;
            if (options.end === 0) {
                this.end = 0
            }
            if (options.timingFunction) {
                this.timingFunction = options.timingFunction;
            }
        }

        play(rate?: number) {
            this.rate = rate || 1;
        }

        pause() {
            this.rate = 0;
        }

        stop() {
            this.rate = 0;
            if (!this.reverse) {
                this.rawShift = this.startShift;
            } else {
                this.rawShift = this.endShift;
            }
        }

        repeat() {
            if (!this.reverse) {
                this.rawShift = this.startShift;
            } else {
                this.rawShift = this.endShift;
            }
        }
    }

    export function compileNextState (operation: IOperation) {
        const incidence = 1000 / this.fps;
        const step = (operation.endShift - operation.startShift) / (operation.time / incidence);

        if (operation.rawShift >= operation.endShift) {
            operation.rawShift = operation.endShift;
        }

        operation.frame(operation.start + (operation.end - operation.start) * operation.shift);

        if (
            operation.rawShift >= operation.endShift && !operation.reverse ||
            operation.rawShift <= operation.startShift && operation.reverse
        ) {
            if (operation.recourse) {
                operation.repeat();
                return;
            }
            this.remove(operation.id);
            operation.callback();
            return;
        }

        if (!operation.reverse) {
            operation.rawShift += step * operation.rate;
        } else {
            operation.rawShift -= step * operation.rate;
        }
    }

    export interface IPirate {
        play(fps: number): void;
        pause(): void;
        render(): void;
        append(operation: IOperation): void;
        remove(operation: IOperation): void;
    }

    export class Pirate implements IPirate {
        private stack: {[key: string]: IOperation} = {};
        private _fps: number;
        private core: NodeJS.Timer;
        private get fps(): number {
            return this._fps;
        }
        private set fps(value: number) {
            const self = this;
            if (this.core) {
                clearInterval(this.core)
            }
            if (value) {
                this.core = setInterval(function () {
                    self.render();
                }, 1000 / +value);
            }
            this._fps = value
        };
        private compileNextState = compileNextState;

        constructor(fps?: number) {
            this.fps = 0;
            this._fps = fps;
        }

        play(fps?: number) {
            this.fps = +fps || this.fps;
        }

        pause() {
            const fps = this.fps;
            this.fps = 0;
            this._fps = fps;
        }

        render() {
            const stack = this.stack;
            Object.keys(stack).forEach(key => {
                this.compileNextState(stack[key]);
            });
        }

        append(operation: IOperation) {
            if (Object.keys(this.stack).length === 0) {
                this.play()
            }
            this.stack[operation.id] = operation;
        }

        remove(operation: IOperation) {
            delete this.stack[operation.id];
            if (Object.keys(this.stack).length === 0) {
                this.pause()
            }
        }
    }
}
