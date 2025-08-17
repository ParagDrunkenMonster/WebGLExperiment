'use strict';

if (SmartVizXFramework === undefined)
    var SmartVizXFramework = {};

SmartVizXFramework.Application = function(_containerWindow)   {

    var maxPitchAngle = 30.0; //Degrees
    var maxYawAngle = 360.0; //Degrees
    var translateVal = 0.01;
    var rotateVal = 0.5;

    var containerWindow = _containerWindow;
    var smartGLContext = null;
    var projection = null;
    var lastWidth = 0;
    var lastHeight = 0;
    var cameraTransform = null;
    var view = null; //inverse of camera transform
    var inputHandler = null;

    var meshList = {};
    var meshInstances = {};

    var time_old = 0;

    var currYawStart = 0.0;
    var currPitchStart = 0.0;
    var currYaw = 0.0;
    var currPitch = 0.0;
    var currPitchDiff = 0.0;
    var currYawDiff = 0.0;

    var realCurrYawStart = undefined;
    var realCurrPitchStart = undefined;
    var realCurrYaw = 0.0;
    var realCurrPitch = 0.0;
    var camDist = 1.15;

    var lightDir1 = new SmartVizXFramework.Vector3(0.1875174,-0.7660438,-0.6148285);
    var lightDir2 = new SmartVizXFramework.Vector3(-2.0, 0.5, -1.0);

    var directionalLight1Intensity = 1.2;
    var directionalLight2Intensity = 0.0;
    var ambientLightColor = [0.15, 0.15, 0.15, 1.0];

    var nearClip = 0.01;

    var sceneBound = null;

    var scope = this;

    (function(){
        lightDir1.normalize();
        lightDir2.normalize();

        smartGLContext = new SmartVizXFramework.WebGLContext(containerWindow);
        initialize();
        _containerWindow = undefined;

        containerWindow.onunload = function()   {
            scope.destroy();
            containerWindow.onunload = undefined;
        }
    })();

    function initialize()   {

        projection = new SmartVizXFramework.Matrix4();
        lastWidth = -1;
        lastHeight = -1;

        cameraTransform = new SmartVizXFramework.Matrix4();
        currYawStart = 0;
        currPitchStart = 45.0;
        currYaw = currYawStart;
        currPitch = currPitchStart;
        realCurrYaw = 0.0;
        realCurrPitch = 0.0;
        realCurrYawStart = undefined;
        realCurrPitchStart = undefined;
        currPitchDiff = 0.0;
        currYawDiff = 0.0;
        updateRotation();

        view = cameraTransform.getInverse();

        startLoading();

        inputHandler = new SmartVizXFramework.InputHandler();
        inputHandler.addOnEvent('onMoveForward', onMoveForward);
        inputHandler.addOnEvent('onMoveBackward', onMoveBackward);
        inputHandler.addOnEvent('onMoveLeft', onMoveLeft);
        inputHandler.addOnEvent('onMoveRight', onMoveRight);

        inputHandler.addOnEvent('onLookUp', onLookUp);
        inputHandler.addOnEvent('onLookDown', onLookDown);
        inputHandler.addOnEvent('onLookLeft', onLookLeft);
        inputHandler.addOnEvent('onLookRight', onLookRight);

        inputHandler.addOnEvent('onMoveUp', onMoveUp);
        inputHandler.addOnEvent('onMoveDown', onMoveDown);

        inputHandler.addOnEvent('onDeviceOrientation', onDeviceOrientation);
        inputHandler.addOnEvent('onAccelerometer', onAccelerometer);

        render(0);
    }

    function onMoveForward(eventData)    {
        var forward = cameraTransform.getForward();
        forward.multiplyScaler(-translateVal);
        //cameraTransform.translate(forward);
        //var translate = cameraTransform.getTranslate();
        //console.log('Translate : ' + translate.getX() + ', ' + translate.getY() + ',' + translate.getZ() + 'Curr Yaw : ' + currYaw + ', Curr Pitch :' + currPitch);
    }

    function onMoveBackward(eventData)   {
        var forward = cameraTransform.getForward();
        forward.multiplyScaler(translateVal);
        cameraTransform.translate(forward);
        //var translate = cameraTransform.getTranslate();
        //console.log('Translate : ' + translate.getX() + ', ' + translate.getY() + ',' + translate.getZ() + 'Curr Yaw : ' + currYaw + ', Curr Pitch :' + currPitch);
    }

    function onMoveLeft(eventData)   {
        var right = cameraTransform.getRight();
        right.multiplyScaler(-translateVal);
        cameraTransform.translate(right);
        //var translate = cameraTransform.getTranslate();
        //console.log('Translate : ' + translate.getX() + ', ' + translate.getY() + ',' + translate.getZ() + 'Curr Yaw : ' + currYaw + ', Curr Pitch :' + currPitch);
    }

    function onMoveRight(eventData)  {
        var right = cameraTransform.getRight();
        right.multiplyScaler(translateVal);
        cameraTransform.translate(right);
        //var translate = cameraTransform.getTranslate();
        //console.log('Translate : ' + translate.getX() + ', ' + translate.getY() + ',' + translate.getZ() + 'Curr Yaw : ' + currYaw + ', Curr Pitch :' + currPitch);
    }

    function onMoveUp(eventData)    {
        var up = new SmartVizXFramework.Vector3(0,1,0);
        up.multiplyScaler(translateVal);
        cameraTransform.translate(up);
        //var translate = cameraTransform.getTranslate();
        //console.log('Translate : ' + translate.getX() + ', ' + translate.getY() + ',' + translate.getZ() + 'Curr Yaw : ' + currYaw + ', Curr Pitch :' + currPitch);
    }

    function onMoveDown(eventData)  {
        var up = new SmartVizXFramework.Vector3(0,1,0);
        up.multiplyScaler(-translateVal);
        cameraTransform.translate(up);
        //var translate = cameraTransform.getTranslate();
        //console.log('Translate : ' + translate.getX() + ', ' + translate.getY() + ',' + translate.getZ() + 'Curr Yaw : ' + currYaw + ', Curr Pitch :' + currPitch);
    }

    var alpha = 0.0;
    var beta = 0.0;
    function onLookUp(eventData)  {
        if (!sceneBound)
            return;
        beta += rotateVal;
        if (beta >= 360.0) {
            beta = 360.0 - beta;
        }
        var localEventData = {Angles:{alpha:alpha, beta:beta, gamma:0.0}, Orientation:0};
        onDeviceOrientation(localEventData);
    }

    function onLookDown(eventData)  {
        if (!sceneBound)
            return;
        beta -= rotateVal;
        if (beta < 0.0) {
            beta = 360.0 + beta;
        }
        var localEventData = {Angles:{alpha:alpha, beta:beta, gamma:0.0}, Orientation:0};
        onDeviceOrientation(localEventData);
    }


    function onLookLeft(eventData)  {
        if (!sceneBound)
            return;
        rotateAlpha(-rotateVal);
    }

    function onLookRight(eventData)  {
        if (!sceneBound)
            return;
        rotateAlpha(rotateVal);
    }

    function rotateAlpha(rotVal)    {
        alpha += rotVal;
        if (alpha >= 360.0) {
            alpha = 360.0 - alpha;
        }
        if (alpha < 0.0) {
            alpha = 360.0 + alpha;
        }
        var localEventData = {Angles:{alpha:alpha, beta:beta, gamma:0.0}, Orientation:0};
        onDeviceOrientation(localEventData);
    }

    var startOrtMat = undefined;
    function onDeviceOrientation(eventData)  {
        if (eventData && eventData.Angles)  {
            var localAlpha = eventData.Angles.alpha;
            var localBeta = eventData.Angles.beta;
            var localGamma = eventData.Angles.gamma;
            if (eventData.Orientation == 90) {
                localAlpha = eventData.Angles.alpha;
                localBeta = -eventData.Angles.gamma;
            }
            else if (eventData.Orientation == -90) {
                localAlpha = eventData.Angles.alpha;
                localBeta = eventData.Angles.gamma;
            }

            //document.getElementById("magnetometer").innerHTML = "localAlpha " + localAlpha + ', beta :' + localBeta;

            if (realCurrYawStart == undefined)  {
                realCurrYawStart = localAlpha;
            }
            if (realCurrPitchStart == undefined)    {
                realCurrPitchStart = localBeta;
            }

            if (startOrtMat == undefined)   {
                startOrtMat = new SmartVizXFramework.Matrix4();
                startOrtMat.fromEuler(new SmartVizXFramework.Vector3(localAlpha * SmartVizXFramework.Math.DegToRad, localBeta * SmartVizXFramework.Math.DegToRad, localGamma * SmartVizXFramework.Math.DegToRad), 'XYZ');
            }

            var currOrtMat = new SmartVizXFramework.Matrix4();
            currOrtMat.fromEuler(new SmartVizXFramework.Vector3(localAlpha * SmartVizXFramework.Math.DegToRad, localBeta * SmartVizXFramework.Math.DegToRad, localGamma * SmartVizXFramework.Math.DegToRad), 'XYZ');

            var startUp = startOrtMat.getUp();
            var currUp = currOrtMat.getUp();
            var startRight = startOrtMat.getRight();
            var cross = startUp.getCross(currUp);
            startUp.normalize();
            currUp.normalize();
            var dot = startUp.dot(currUp);
            dot = SmartVizXFramework.Math.Clamp(dot, -1.0, 1.0);
            var angle = Math.acos(dot) * SmartVizXFramework.Math.RadToDeg;
            if (cross.dot(startRight) < 0.0)    {
                angle = 360.0 - angle;
            }
            realCurrYaw = angle;
            realCurrPitch = localBeta;


            var rotDiff = getRotationDiff();
            currPitchDiff = currPitchDiff + getShortestAngleDiff(360 + rotDiff.pitchDiff, currPitchDiff) * 0.15;
            currYawDiff = currYawDiff + getShortestAngleDiff(360 + rotDiff.yawDiff, currYawDiff) * 0.15;
            //console.log('yawDiff : ' + currYawDiff);
            //document.getElementById("magnetometer").innerHTML = "YGravity: " + eventData.AccelerationIncludingGravity.z;
            //if (eventData.AccelerationIncludingGravity.z >= 0)


            currYaw = currYawStart + currYawDiff;
            currPitch = currPitchStart + currPitchDiff;

            updateRotation();
        }
    }

    var yAxis = new SmartVizXFramework.Vector3(0.0, 1.0, 0.0);
    function getShortestAngleDiff(a, b, maxVal) {
        var rotMat = new SmartVizXFramework.Matrix4();
        rotMat.setRotationY(SmartVizXFramework.Math.DegToRad * a);
        var forwardA = rotMat.getForward();
        forwardA.normalize();

        rotMat.setRotationY(SmartVizXFramework.Math.DegToRad * b);
        var forwardB = rotMat.getForward();
        forwardB.normalize();

        var cosAngle = forwardA.dot(forwardB);
        cosAngle = SmartVizXFramework.Math.Clamp(cosAngle, -1.0, 1.0);
        var vecAngle = Math.acos(cosAngle) * SmartVizXFramework.Math.RadToDeg;

        if (maxVal && vecAngle > maxVal)  {
            vecAngle = maxVal;
        }

        var cross = forwardA.getCross(forwardB);

        if (cross.dot(yAxis) < 0)   {
            return -vecAngle;
        }

        return vecAngle;
    }

    function getRotationDiff()  {
        if (realCurrYawStart != undefined && realCurrPitchStart != undefined) {
            return {yawDiff: getShortestAngleDiff(realCurrYawStart, realCurrYaw, maxYawAngle), pitchDiff: getShortestAngleDiff(realCurrPitchStart, realCurrPitch, maxPitchAngle)};
        }
        return {yawDiff: 0, pitchDiff: 0};
    }

    function onAccelerometer(eventData)  {

    }

    function updateRotation()   {
        if (!sceneBound)
            return;

        var dir = new SmartVizXFramework.Vector3(0.0, 0.0, 1.0);
        var yawMat = new SmartVizXFramework.Matrix4();
        yawMat.angleAxis(SmartVizXFramework.Math.DegToRad * currYaw, new SmartVizXFramework.Vector3(0.0, 1.0, 0.0));


        var right = yawMat.getRight();
        var pitchMat = new SmartVizXFramework.Matrix4();
        pitchMat.angleAxis(SmartVizXFramework.Math.DegToRad * currPitch, right);

        pitchMat.postMultiply(yawMat);
        cameraTransform.copy(pitchMat);

        var forward = cameraTransform.getForward();
        forward.multiplyScaler(camDist);

        pitchMat.angleAxis(SmartVizXFramework.Math.DegToRad * 5.0, right);//adjusted to center a little hack :)
        cameraTransform.preMultiply(pitchMat);

        cameraTransform.setTranslate(forward);


        /*var viewMatGreen = cameraTransform.getInverse();
        var viewMatPurple = cameraTransform.getInverse();
        var viewMatRed = cameraTransform.getInverse();

        viewMatGreen.postMultiply(meshInstances['green'].transform);
        viewMatPurple.postMultiply(meshInstances['purple'].transform);
        viewMatRed.postMultiply(meshInstances['red'].transform);

        sceneBound = meshInstances['green'].instance.getAABB(viewMatGreen);
        sceneBound.union(meshInstances['purple'].instance.getAABB(viewMatPurple));
        sceneBound.union(meshInstances['red'].instance.getAABB(viewMatRed));

        var min = sceneBound.getMin();
        var max = sceneBound.getMax();

        var centerOffset = sceneBound.getCenter();
        //console.log('X : ' + centerOffset.getX() + ', Y : ' + centerOffset.getY() + ', Z : ' + centerOffset.getZ());
        centerOffset.setZ(0.0);
        centerOffset.multiplyScaler(-1.0);

        centerOffset = cameraTransform.rotateVector(centerOffset);


        cameraTransform.translate(centerOffset);*/
    }

    function render(time) {
        var gl = smartGLContext.getGLContext();

        var dt = time - time_old;
        var minFrameRate = 1.0/30.0;
        dt = dt * 0.001;
        if (dt >= minFrameRate)    {
            dt = minFrameRate;
        }
        animate(dt);
        inputHandler.update(dt);

        time_old = time;

        view = cameraTransform.getInverse();

        SmartVizXFramework.Material.lightDir1.copy(lightDir1);
        SmartVizXFramework.Material.lightDir2.copy(lightDir2);

        SmartVizXFramework.Material.directionalLight1Intensity = directionalLight1Intensity;
        SmartVizXFramework.Material.directionalLight2Intensity = directionalLight2Intensity;
        SmartVizXFramework.Material.ambientLightColor = ambientLightColor;

        if (lastWidth != containerWindow.clientWidth || lastHeight != containerWindow.clientHeight)
        {
            var currAspect = containerWindow.clientWidth/containerWindow.clientHeight;
            if (SmartVizXFramework.Settings.requiredAspect != currAspect)   {
                var requiredHeight = containerWindow.clientWidth * SmartVizXFramework.Settings.requiredAspect;
                containerWindow.style.height = '' + requiredHeight + 'px';
            }

            projection.constructProjectionMatrix(60 * Math.PI / 180.0, containerWindow.clientWidth/containerWindow.clientHeight, nearClip, 50);
            smartGLContext.resize(containerWindow.clientWidth, containerWindow.clientHeight);
            lastWidth = containerWindow.clientWidth;
            lastHeight = containerWindow.clientHeight;
            //console.log(containerWindow.clientHeight);
        }

        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.clearColor(1.0, 1.0, 1.0, 1.0);
        gl.clearDepth(1.0);
        gl.viewport(0.0, 0.0, smartGLContext.getWidth(), smartGLContext.getHeight());
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        for(var prop in meshInstances) {
           meshInstances[prop].instance.render(projection, view, meshInstances[prop].transform);
        }

        window.requestAnimationFrame(render);
    }

    var startDist = 3.0;
    var movementDir = {green:new SmartVizXFramework.Vector3(-0.4772438,0,-0.8787709), red:new SmartVizXFramework.Vector3(-0.4772438,0,-0.8787709), purple:new SmartVizXFramework.Vector3(0.4772438,0,0.8787709)};
    var currPositions = {green:movementDir.green.getMultiplyScaler(startDist), red:movementDir.red.getMultiplyScaler(startDist), purple:movementDir.purple.getMultiplyScaler(startDist)};
    var movementQueue = [{node:'green', startTime:0.0, moving:false, currMovingT:0.0, movingIn:true}, {node:'purple', startTime:0.5, moving:false, currMovingT:0.0, movingIn:true}, {node:'red', startTime:0.5, moving:false, currMovingT:0.0, movingIn:true}];
    var currTime = 0.0;
    var moveInOutAnimSpeed = 6.0;

    var movingRight = true;
    var currT = 0.0;
    var oscilationCounter = 0;
    function animate(dt)    {

        if (meshInstances)  {
            if (meshInstances['green']) {
                meshInstances['green'].transform.setTranslate(currPositions['green']);
            }
            if (meshInstances['red']) {
                meshInstances['red'].transform.setTranslate(currPositions['red']);
            }
            if (meshInstances['purple']) {
                meshInstances['purple'].transform.setTranslate(currPositions['purple']);
            }

            if (meshInstances['green'] && meshInstances['red'] && meshInstances['purple']) {
                var count = movementQueue.length;
                var allReached = true;
                if (count > 0)  {
                    for(var i = 0; i < count; i++)  {
                        var curr = movementQueue[i];
                        if (!curr.moving && currTime >= curr.startTime) {
                            curr.moving = true;
                            curr.currMovingT = 0.0;
                            currTime = 0.0;
                            break;
                        }
                    }

                    for(var i = 0; i < count; i++)  {
                        var curr = movementQueue[i];
                        if (curr.moving)    {
                            var currPos = currPositions[curr.node];
                            var currDir = movementDir[curr.node];
                            var instData = meshInstances[curr.node];

                            var targetPos;
                            if (curr.movingIn) {
                                targetPos = new SmartVizXFramework.Vector3(0,0,0);
                            }
                            else {
                                targetPos = movementDir[curr.node].getCopy();
                                targetPos.multiplyScaler(startDist);
                            }
                            var temp = targetPos.getCopy();
                            temp.subtract(currPos);
                            curr.currMovingT = curr.currMovingT + (moveInOutAnimSpeed - curr.currMovingT) * 2 * dt;
                            temp.multiplyScaler(curr.currMovingT * dt);
                            currPos.add(temp);
                            instData.transform.setTranslate(currPos);
                            var DIST_EPSILON = 0.001;
                            targetPos.subtract(currPos);
                            var magnitude = targetPos.magnitude();
                            if ( magnitude > DIST_EPSILON) {
                                allReached = false;
                            }
                            else {
                                if (!curr.movingIn) {
                                    curr.movingIn = true;
                                }
                            }
                        }
                    }
                }

                var targetAlpha = 30.0;
                var REQUIREDa_OSCILATIONS = 2;
                if (oscilationCounter == REQUIREDa_OSCILATIONS) {
                    targetAlpha = 0;
                }

                function onOscilationCounterChange()    {
                    if (oscilationCounter == REQUIREDa_OSCILATIONS + 1) {
                        oscilationCounter = 0
                        allReached = false;
                        currTime = 0.0;
                        var count = movementQueue.length;
                        for(var i = 0; i < count; i++)  {
                            var curr = movementQueue[i];
                            curr.moving = false;
                            curr.movingIn = false;
                        }
                    }
                }

                if (allReached && (window.orientation == undefined || window.orientation == null))  {
                    var EPSILON = 1;
                    var TARGET_T = 0.5;
                    var TARGET_T_INC_T = 1.0;
                    if (movingRight)    {
                        var currTargetAlpha = targetAlpha;
                        currT = currT + (TARGET_T - currT) * dt * TARGET_T_INC_T;
                        alpha = alpha + (currTargetAlpha - alpha) * dt * currT;
                        if (Math.abs(currTargetAlpha - alpha) < EPSILON)   {
                            movingRight = false;
                            currT = 0.0;
                            oscilationCounter++;
                            onOscilationCounterChange();
                        }
                    }
                    else {
                        var currTargetAlpha = -targetAlpha;
                        currT = currT + (TARGET_T - currT) * dt * TARGET_T_INC_T;
                        alpha = alpha + (currTargetAlpha - alpha) * dt * currT;
                        if (Math.abs(currTargetAlpha - alpha) < EPSILON)   {
                            movingRight = true;
                            currT = 0.0;
                            oscilationCounter++;
                            onOscilationCounterChange();
                        }
                    }

                    var localEventData = {Angles:{alpha:alpha, beta:beta, gamma:0.0}, Orientation:0};
                    onDeviceOrientation(localEventData);
                    //rotateAlpha(-rotateVal);
                }
            }

            currTime += dt;
        }
    }

    function startLoading()
    {
        var meshesToLoad = ['themes/demo/assets/media/green.sgb', 'themes/demo/assets/media/purple.sgb', 'themes/demo/assets/media/red.sgb'];
        loadAllMeshes(meshesToLoad, function()  {
            createScene();
        });
    }

    function createScene()  {
        //meshList = {};
        meshInstances['green'] = craeteMeshInstance(meshList['green'], [1,0,0,1], new SmartVizXFramework.Vector3(0, 0, 0));
        meshInstances['purple'] = craeteMeshInstance(meshList['purple'], [1,0,0,1], new SmartVizXFramework.Vector3(0, 0, 0));
        meshInstances['red'] = craeteMeshInstance(meshList['red'], [1,0,0,1], new SmartVizXFramework.Vector3(0, 0, 0));

        sceneBound = meshInstances['green'].instance.getAABB();
        sceneBound.union(meshInstances['purple'].instance.getAABB());
        sceneBound.union(meshInstances['red'].instance.getAABB());
        rotateAlpha(0.0);
    }

    function craeteMeshInstance(mesh, color, position, degrees, axis)   {
        var instance = new SmartVizXFramework.MeshInstance(mesh);
        var mat = new SmartVizXFramework.Material(smartGLContext);
        mat.setMainColor(color[0], color[1], color[2], color[3])
        instance.setMaterial(mat);
        var transform = new SmartVizXFramework.Matrix4();
        if (degrees && SmartVizXFramework.Utils.isValidNum(degrees) && axis && axis instanceof SmartVizXFramework.Vector3)  {
            axis.normalize();
            transform.angleAxis(degrees * SmartVizXFramework.Math.DegToRad, axis);
        }

        if (position && position instanceof SmartVizXFramework.Vector3) {
            transform.setTranslate(position);
        }

        return {instance:instance, material:mat, transform:transform};
    }

    function loadAllMeshes(meshesToLoad, onMeshesLoadFinished)   {
        var length = meshesToLoad.length;
        var currMesh = 0;

        function onMeshLoadedLocal(_mesh, _fileURL, _userData)  {
            meshList[SmartVizXFramework.Utils.getFileNameFromPathWithoutExtension(_fileURL)] = _mesh;
            currMesh++;
            if (currMesh >= length) {
                onMeshesLoadFinished();
            }
            else {
                var loader = new SmartVizXFramework.BinaryLoader(smartGLContext, meshesToLoad[currMesh], onMeshLoadedLocal, onMeshLoadFailedLocal);
                loader.loadFile();
            }
        }

        function onMeshLoadFailedLocal(_error, _fileURL, _userData)  {
            meshList[SmartVizXFramework.Utils.getFileNameFromPathWithoutExtension(_fileURL)] = null;
            currMesh++;
            if (currMesh >= length) {
                onMeshesLoadFinished();
            }
            else {
                var loader = new SmartVizXFramework.BinaryLoader(smartGLContext, meshesToLoad[currMesh], onMeshLoadedLocal, onMeshLoadFailedLocal);
                loader.loadFile();
            }
        }

        var binaryLoader = new SmartVizXFramework.BinaryLoader(smartGLContext, meshesToLoad[currMesh], onMeshLoadedLocal, onMeshLoadFailedLocal);
        binaryLoader.loadFile();
    }

    scope.destroy = function()  {
        inputHandler.removeOnEvent(onMoveForward);
        inputHandler.removeOnEvent(onMoveBackward);
        inputHandler.removeOnEvent(onMoveLeft);
        inputHandler.removeOnEvent(onMoveRight);

        inputHandler.removeOnEvent(onLookUp);
        inputHandler.removeOnEvent(onLookDown);
        inputHandler.removeOnEvent(onLookLeft);
        inputHandler.removeOnEvent(onLookRight);

        inputHandler.removeOnEvent(onDeviceOrientation);
        inputHandler.removeOnEvent(onAccelerometer);

        inputHandler.destroy();
        inputHandler = null;

        var containerWindow = _containerWindow;
        smartGLContext.destroy();
        projection = null;
        cameraTransform = null;
        view = null; //inverse of camera transform

        for(var prop in meshInstances) {
           meshInstances[prop].material.destroy();
           meshInstances[prop].instance.destroy();
        }

        for(var prop in meshList) {
           meshList[prop].destroy();
        }

        meshList = {};
        meshInstances = {};
        scope = null;
    }
}
