'use strict';

if (SmartVizXFramework === undefined)
    var SmartVizXFramework = {};

SmartVizXFramework.Utils = {

}

SmartVizXFramework.Utils.isValidNum = function(_value)   {
    return isFinite(_value) && !isNaN(_value);
}

SmartVizXFramework.Utils.getFileNameFromPath = function(_fileURL)    {
    var localURL = _fileURL;
    var filename = localURL.split("/").pop();
    return filename;
}

SmartVizXFramework.Utils.getFileNameFromPathWithoutExtension = function(_fileURL)    {
    var filename = SmartVizXFramework.Utils.getFileNameFromPath(_fileURL);
    var ind = filename.lastIndexOf('.');
    return filename.substr(0, ind);
}

SmartVizXFramework.Utils.LerpDegrees = function(_start, _end, _amount)
 {
     var difference = Math.abs(_end - _start);
     if (difference > 180)  {
         if (_end > _start)   {
             _start += 360;
         }
         else {
             _end += 360;
         }
     }

     var value = (_start + ((_end - _start) * _amount));
     var rangeZero = 360;

     if (value >= 0 && value <= 360)
         return value;

     return (value % rangeZero);
 }
