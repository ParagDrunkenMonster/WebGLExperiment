'use strict';

if (SmartVizXFramework === undefined)
    var SmartVizXFramework = {};

SmartVizXFramework.Vector3 = function(_x, _y, _z)   {
    var x = _x?_x:0.0;
    var y = _y?_y:0.0;
    var z = _z?_z:0.0;

    var scope = this;

    scope.set = function(_x, _y, _z)  {
        x = _x;
        y = _y;
        z = _z;
    }

    scope.setX = function(_x)   {
        x = _x;
    }

    scope.setY = function(_y)   {
        y = _y;
    }

    scope.setZ = function(_z)   {
        z = _z;
    }

    scope.getX = function()   {
        return x;
    }

    scope.getY = function()   {
        return y;
    }

    scope.getZ = function()   {
        return z;
    }

    scope.copy = function(_other)   {
        x = _other.getX();
        y = _other.getY();
        z = _other.getZ();
    }

    scope.getCopy = function()  {
        var newVec = new SmartVizXFramework.Vector3(x, y, z);
        return newVec;
    }

    scope.multiplyScaler = function(_scaler)    {
        x *= _scaler;       y *= _scaler;       z *= _scaler;
    }

    scope.getMultiplyScaler = function(_scaler)    {
        var res = new SmartVizXFramework.Vector3(x, y, z);
        res.multiplyScaler(_scaler);
        return res;
    }

    scope.dot = function(_other)    {
        return (x * _other.getX() + y * _other.getY() + z * _other.getZ());
    }

    scope.cross = function(_right) {
		var _x = scope.getX(), _y = scope.getY(),   _z = scope.getZ();

		x = _y * _right.getZ() - _z * _right.getY();
		y = _z * _right.getX() - _x * _right.getZ();
		z = _x * _right.getY() - _y * _right.getX();
	}

    scope.getCross = function(_right) {
		var _x = scope.getX(), _y = scope.getY(),   _z = scope.getZ();

		var resX = _y * _right.getZ() - _z * _right.getY();
		var resY = _z * _right.getX() - _x * _right.getZ();
		var resZ = _x * _right.getY() - _y * _right.getX();

        return new SmartVizXFramework.Vector3(resX, resY, resZ);
	}

    scope.add = function(_right) {
		x = x + _right.getX();
        y = y + _right.getY();
        z = z + _right.getZ();
	}

    scope.addComponent = function(_rightX, _rightY, _rightZ) {
		x = x + _rightX?_rightX:0.0;
        y = y + _rightY?_rightY:0.0;
        z = z + _rightZ?_rightZ:0.0;
	}

    scope.subtract = function(_right) {
		x = x - _right.getX();
        y = y - _right.getY();
        z = z - _right.getZ();
	}

    scope.subtractComponent = function(_rightX, _rightY, _rightZ) {
		x = x - _rightX?_rightX:0.0;
        y = y - _rightY?_rightY:0.0;
        z = z - _rightZ?_rightZ:0.0;
	}

    scope.sqrMagnitude = function()    {
        return (x * x + y * y + z * z);
    }

    scope.magnitude = function()    {
        return Math.sqrt(scope.sqrMagnitude());;
    }

    scope.normalize = function()    {
        var mag = scope.magnitude();
        if (mag > SmartVizXFramework.Math.EPSILON)  {
            scope.multiplyScaler(1.0/mag);
        }
        else {
            console.error('Can not normalize Vector3');
        }
    }

    // Special Thanks to Johnathan, Shaun and Geof!
    scope.slerp = function(_end, _percent)   {

        var start = new SmartVizXFramework.Vector3(x, y, z);
        var end = new SmartVizXFramework.Vector3(_end.getX(), _end.getY(), _end.getZ());

        var dot = start.dot(end);
        dot = SmartVizXFramework.Math.Clamp(dot, -1.0, 1.0);
        // Acos(dot) returns the angle between start and _end,
        // And multiplying that by _percent returns the angle between
        // start and the final result.
        var theta = Math.acos(dot) * _percent;

        var startIntoDot = new SmartVizXFramework.Vector3(start.getX(), start.getY(), start.getZ())
        startIntoDot.multiplyScaler(dot);
        end.subtract(startIntoDot);
        end.normalize();     // Orthonormal basis
        // The final result.

        start.multiplyScaler(Math.cos(theta));
        end.multiplyScaler(Math.sin(theta));

        x = start.getX() + end.getX();
        x = start.getY() + end.getY();
        x = start.getZ() + end.getZ();
    }
}
