'use strict';

if (SmartVizXFramework === undefined)
  var SmartVizXFramework = {};

SmartVizXFramework.InputHandler = function(_domElement)   {

    var EventFlags = {
        Forward : 1 << 0,
        Backward : 1 << 1,
        Right : 1 << 2,
        Left : 1 << 3,
        LookUp : 1 << 4,
        LookDown : 1 << 5,
        LookLeft : 1 << 6,
        LookRight : 1 << 7,
        MoveUp : 1 << 8,
        MoveDown : 1 << 9,
    }

    var domElement = ( _domElement !== undefined ) ? _domElement : document;
    var onEventCallbacks = {};
    var currKeyEventsType = 0;

	var scope = this;

    (function(){
        window.addEventListener( 'keydown', onKeyDown, false );
        window.addEventListener( 'keyup', onKeyUp, false );

        if(window.DeviceMotionEvent)
        {
            window.addEventListener("devicemotion", motion, false);
        }

        if(window.DeviceOrientationEvent)   {
            window.addEventListener("deviceorientation", orientation, false);
        }

        _domElement = null;
        currKeyEventsType = 0;
    })();


    function onKeyDown(event)    {
        if (event.keyCode == 87)  {//w keyCode
            currKeyEventsType = currKeyEventsType | EventFlags.Forward;
        }

        if (event.keyCode == 83)    {//s keyCode
            currKeyEventsType = currKeyEventsType | EventFlags.Backward;
        }

        if (event.keyCode == 65)    {//a keyCode
            currKeyEventsType = currKeyEventsType | EventFlags.Left;
        }

        if (event.keyCode == 68)    {//d keyCode
            currKeyEventsType = currKeyEventsType | EventFlags.Right;
        }

        if (event.keyCode == 37)    {//left keyCode
            currKeyEventsType = currKeyEventsType | EventFlags.LookLeft;
        }

        if (event.keyCode == 39)    {//Right keyCode
            currKeyEventsType = currKeyEventsType | EventFlags.LookRight;
        }

        if (event.keyCode == 38)    {//Up keyCode
            currKeyEventsType = currKeyEventsType | EventFlags.LookUp;
        }

        if (event.keyCode == 40)    {//Down keyCode
            currKeyEventsType = currKeyEventsType | EventFlags.LookDown;
        }

        if (event.keyCode == 33)    {//page up
            currKeyEventsType = currKeyEventsType | EventFlags.MoveUp;
        }

        if (event.keyCode == 34)    {//page down
            currKeyEventsType = currKeyEventsType | EventFlags.MoveDown;
        }
    }

    function onKeyUp(event)  {
        if (event.keyCode == 87)  {//w keyCode
            currKeyEventsType = currKeyEventsType ^ EventFlags.Forward;
        }

        if (event.keyCode == 83)    {//s keyCode
            currKeyEventsType = currKeyEventsType ^ EventFlags.Backward;
        }

        if (event.keyCode == 65)    {//a keyCode
            currKeyEventsType = currKeyEventsType ^ EventFlags.Left;
        }

        if (event.keyCode == 68)    {//d keyCode
            currKeyEventsType = currKeyEventsType ^ EventFlags.Right;
        }

        if (event.keyCode == 37)    {//left keyCode
            currKeyEventsType = currKeyEventsType ^ EventFlags.LookLeft;
        }

        if (event.keyCode == 39)    {//Right keyCode
            currKeyEventsType = currKeyEventsType ^ EventFlags.LookRight;
        }

        if (event.keyCode == 38)    {//Up keyCode
            currKeyEventsType = currKeyEventsType ^ EventFlags.LookUp;
        }

        if (event.keyCode == 40)    {//Down keyCode
            currKeyEventsType = currKeyEventsType ^ EventFlags.LookDown;
        }

        if (event.keyCode == 33)    {//page up
            currKeyEventsType = currKeyEventsType ^ EventFlags.MoveUp;
        }

        if (event.keyCode == 34)    {//page down
            currKeyEventsType = currKeyEventsType ^ EventFlags.MoveDown;
        }
    }

    function motion(event){
        if(window.DeviceMotionEvent)
        {
            var ort = window.orientation;
            var eventData = {Acceleration:{x:event.acceleration.x, y:event.acceleration.y, z:event.acceleration.z}
                        , AngleAcceleration:{alpha:event.rotationRate.alpha, beta:event.rotationRate.beta, gamma:event.rotationRate.gamma}
                        , AccelerationIncludingGravity:{x:event.accelerationIncludingGravity.x, y:event.accelerationIncludingGravity.y, z:event.accelerationIncludingGravity.z}
                        , Orientation:ort};
            //document.getElementById("magnetometer").innerHTML = "Orientation: " + eventData.Orientation;
            executeEventCallbacks('onAccelerometer', eventData);
        }
    }

    function orientation(event){
        if(window.DeviceOrientationEvent)   {
            var ort = window.orientation;
            var eventData = {Angles:{alpha:event.alpha, beta:event.beta, gamma:event.gamma}, Orientation:ort};
            executeEventCallbacks('onDeviceOrientation', eventData);
        }
    }

    scope.InputHandler_destroyInternal = function() {

        window.removeEventListener( 'keydown', onKeyDown, false );
        window.removeEventListener( 'keyup', onKeyUp, false );

        if(window.DeviceMotionEvent){
            window.removeEventListener("devicemotion", motion, false);
        }

        if(window.DeviceOrientationEvent)   {
            window.removeEventListener("deviceorientation", orientation, false);
        }

        scope = null;
        domElement = null;

        onEventCallbacks = {};
        currKeyEventsType = 0;
    }

    scope.InputHandler_updateInternal = function(delta_time) {
        if (currKeyEventsType & EventFlags.Forward)  {
            executeEventCallbacks('onMoveForward');
        }

        if (currKeyEventsType & EventFlags.Backward)    {
            executeEventCallbacks('onMoveBackward');
        }

        if (currKeyEventsType & EventFlags.Left)    {
            executeEventCallbacks('onMoveLeft');
        }

        if (currKeyEventsType & EventFlags.Right)    {
            executeEventCallbacks('onMoveRight');
        }

        if (currKeyEventsType & EventFlags.LookUp)    {
            executeEventCallbacks('onLookUp');
        }

        if (currKeyEventsType & EventFlags.LookDown)    {
            executeEventCallbacks('onLookDown');
        }

        if (currKeyEventsType & EventFlags.LookLeft)    {
            executeEventCallbacks('onLookLeft');
        }

        if (currKeyEventsType & EventFlags.LookRight)    {
            executeEventCallbacks('onLookRight');
        }

        if (currKeyEventsType & EventFlags.MoveUp)    {
            executeEventCallbacks('onMoveUp');
        }

        if (currKeyEventsType & EventFlags.MoveDown)    {
            executeEventCallbacks('onMoveDown');
        }
    }

    //---
    scope.InputHandler_addOnEventInternal = function(event, callbackFun, callBackID) {
        if (event == undefined || event == null || event == '' || callbackFun == undefined || callbackFun == null)
            return;

        if (onEventCallbacks[event] == undefined || onEventCallbacks[event] == null)
        {
            onEventCallbacks[event] = [];
        }

        onEventCallbacks[event].push({callbackFun: callbackFun, callBackID:callBackID});
    }

    scope.InputHandler_removeOnEventInternal = function(callbackFun) {
        if (callbackFun == null || callbackFun == undefined)    {
            console.error('Unable to remove callback function');
        }

        for (var event in onEventCallbacks)    {
            var callbacks = onEventCallbacks[event];
            var count = callbacks.length;
            var itemsToRemove = [];
            for (var i = 0; i < count; i++) {
                var currCallback = callbacks[i];
                if (currCallback.callbackFun == callbackFun)    {
                    itemsToRemove.push(i);
                }
            }

            count = itemsToRemove.length;
            for (var i = 0; i < count; i++) {
                callbacks.splice(itemsToRemove[i], 1);
            }
        }
    }

    function executeEventCallbacks(event, eventData)   {
        var callbacks = onEventCallbacks[event];
        if (callbacks)   {
            if (eventData == null || eventData == undefined)
                eventData = {};
            var count = callbacks.length;
            for (var i = 0; i < count; i++) {
                eventData['callBackID'] = callbacks[i].callBackID;
                callbacks[i].callbackFun(eventData);
            }
        }
    }
}

SmartVizXFramework.InputHandler.prototype.update = function(delta_time)  {
    this.InputHandler_updateInternal(delta_time);
}

SmartVizXFramework.InputHandler.prototype.destroy = function() {
    this.InputHandler_destroyInternal();
};

SmartVizXFramework.InputHandler.prototype.addOnEvent = function(event, callbackFun, callBackID) {
    this.InputHandler_addOnEventInternal(event, callbackFun, callBackID);
};

SmartVizXFramework.InputHandler.prototype.removeOnEvent = function(callbackFun) {
    this.InputHandler_removeOnEventInternal(callbackFun);
};
