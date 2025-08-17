'use strict';

if (SmartVizXFramework === undefined)
    var SmartVizXFramework = {};

SmartVizXFramework.AABB = function(_min, _max)   {
    var min = new SmartVizXFramework.Vector3(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
    var max = new SmartVizXFramework.Vector3(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE);
    var boundSet = false;

    (function() {
        if (_min && _min instanceof SmartVizXFramework.Vector3)   {
            min.copy(_min);
        }

        if (_max && _max instanceof SmartVizXFramework.Vector3)   {
            max.copy(_max);
        }
        _min = undefined;
        _max = undefined;
    })();

    var scope = this;

    scope.getCenter = function()    {
        var center = max.getCopy();
        center.add(min);
        center.multiplyScaler(0.5);
        return center;
    }

    scope.addPoint = function(_point)   {
        if (_point instanceof SmartVizXFramework.Vector3)   {
            min = SmartVizXFramework.Math.MinVec3(min, _point);
            max = SmartVizXFramework.Math.MaxVec3(max, _point);
        }
    }

    scope.union = function(_other)  {
        if (_other instanceof SmartVizXFramework.AABB)   {
            scope.addPoint(_other.getMin());
            scope.addPoint(_other.getMax());
        }
    }

    scope.getMin = function()   {
        return min.getCopy();
    }

    scope.getMax = function()   {
        return max.getCopy();
    }
}
