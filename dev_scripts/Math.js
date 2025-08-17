'use strict';

if (SmartVizXFramework === undefined)
    var SmartVizXFramework = {};

SmartVizXFramework.Math = {

}

SmartVizXFramework.Math.EPSILON = 0.000001;

SmartVizXFramework.Math.Sign = function(_value)  {
    return _value >= 0.0 ? 1.0 : -1.0;
}

SmartVizXFramework.Math.Abs = function(_value)  {
    return SmartVizXFramework.Math.Sign(_value) * _value;
}

SmartVizXFramework.Math.Clamp = function(_value, _min, _max)  {
    return (_value < _min) ? _min : ((_value > _max) ? _max : _value);
}

SmartVizXFramework.Math.MinVec3 = function(_vec1, _vec2)    {
    return new SmartVizXFramework.Vector3(Math.min(_vec1.getX(), _vec2.getX()), Math.min(_vec1.getY(), _vec2.getY()), Math.min(_vec1.getZ(), _vec2.getZ()));
}

SmartVizXFramework.Math.MaxVec3 = function(_vec1, _vec2)    {
    var x1 = _vec1.getX();
    var x2 = _vec2.getX();
    var max = Math.max(x1, x2);
    return new SmartVizXFramework.Vector3(Math.max(_vec1.getX(), _vec2.getX()), Math.max(_vec1.getY(), _vec2.getY()), Math.max(_vec1.getZ(), _vec2.getZ()));
}

SmartVizXFramework.Math.DegToRad = 0.0174533;
SmartVizXFramework.Math.RadToDeg = 57.2958;
