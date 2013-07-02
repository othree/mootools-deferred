/**
 * @fileOverview Mimic deferred from jQuery
 * @author othree othree_kao@htc.com
 */

(function () {

var Deferred = new Class({
    Implements: Events,

    context: null,
    args: [],

    doneCallbacks: [],
    failCallbacks: [],
    alwaysCallbacks: [],

    resolved: false,
    rejected: false,

    initialize: function () {
        
        this.context = this;

        this.addEvent('resolve', function () {
            if (this.resolved || this.rejected) {
                return false;
            } else {
                this.resolved = true;
            }
            var i, len;

            while (this.doneCallbacks[0]) {
                this.doneCallbacks.shift().apply(this.context, this.args);
            }
            while (this.alwaysCallbacks[0]) {
                this.alwaysCallbacks.shift().apply(this.context, this.args);
            }
        });
        this.addEvent('reject', function () {
            if (this.resolved || this.rejected) {
                return false;
            } else {
                this.rejected = true;
            }
            var i, len;

            while (this.failCallbacks[0]) {
                this.failCallbacks.shift().apply(this.context, this.args);
            }
            while (this.alwaysCallbacks[0]) {
                this.alwaysCallbacks.shift().apply(this.context, this.args);
            }
        });

    },

    _addDone: function (func) {
        if ($type(func) === 'function') {
            if (this.resolved) {
                func.call(this.context);
            } else {
                this.doneCallbacks.push(func);
            }
        }
    },

    _addFail: function (func) {
        if ($type(func) === 'function') {
            if (this.rejected) {
                func.call(this.context);
            } else {
                this.failCallbacks.push(func);
            }
        }
    },

    _addAlways: function (func) {
        if ($type(func) === 'function') {
            if (this.resolved || this.rejected) {
                func.call(this.context);
            } else {
                this.alwaysCallbacks.push(func);
            }
        }
    },

    done: function () {
        var args = Array.prototype.slice.call(arguments),
            i, len;

        for (i = 0, len = args.length; i < len; i++) {
            this._addDone(args[i]);
        }

        return this;
    },

    fail: function () {
        var args = Array.prototype.slice.call(arguments),
            i, len;

        for (i = 0, len = args.length; i < len; i++) {
            this._addFail(args[i]);
        }

        return this;
    },

    always: function () {
        var args = Array.prototype.slice.call(arguments),
            i, len;

        for (i = 0, len = args.length; i < len; i++) {
            this._addAlways(args[i]);
        }

        return this;
    },

    then: function (doneCallback, failCallback) {
        this._addDone(doneCallback);
        this._addFail(failCallback);

        return this;
    },

    resolve: function () {
        if (this.resolved || this.rejected) { return false; }
        this.args = Array.prototype.slice.call(arguments);
        this.fireEvent('resolve');
    },
    resolveWith: function (context) {
        if (this.resolved || this.rejected) { return false; }
        this.args = Array.prototype.slice.call(arguments).slice(1);
        this.context = context;
        this.fireEvent('resolve');
    },

    reject: function () {
        if (this.resolved || this.rejected) { return false; }
        this.args = Array.prototype.slice.call(arguments);
        this.fireEvent('reject');
    },
    rejectWith: function (context) {
        if (this.resolved || this.rejected) { return false; }
        this.args = Array.prototype.slice.call(arguments).slice(1);
        this.context = context;
        this.fireEvent('reject');
    },

    isResolved: function () {
        return this.resolved;
    },

    isRejected: function () {
        return this.rejected;
    }
});

$deferred = function (obj) {
    var _deferred = new Deferred();

    function resolve() {
        args = Array.prototype.slice.call(arguments);
        args.unshift(this);
        _deferred.resolveWith.apply(_deferred, args);
    }

    function reject() {
        args = Array.prototype.slice.call(arguments);
        args.unshift(this);
        _deferred.rejectWith.apply(_deferred, args);
    }

    if (obj && obj.addEvent) {
        obj.addEvent('resolve', resolve);
        obj.addEvent('reject', reject);

        // For Request object
        obj.addEvent('success', resolve);
        obj.addEvent('failure', reject);
    }

    return _deferred;
};

$when = function () {
    var _deferred = new Deferred(),
        
        args = Array.prototype.slice.call(arguments),
        obj,

        count = args.length,

        i, len;

    function resolve() {
        count--;
        if (!count) {
            _deferred.fireEvent('resolve');
        }
    }

    function reject() {
        _deferred.fireEvent('reject');
    }

    for (i = 0, len = args.length; i < len; i++) {
        obj = args[i];

        if (obj.addEvent) {
            obj.addEvent('resolve', resolve);
            obj.addEvent('reject', reject);

            // For Request object
            obj.addEvent('success', resolve);
            obj.addEvent('failure', reject);

            if (obj.resolved) {
                count--;
            }
        } else {
            count--;
        }
    }

    _deferred.getCount = function () {return count;};

    return _deferred;
};

}());
