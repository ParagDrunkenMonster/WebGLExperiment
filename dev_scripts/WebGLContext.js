'use strict';

if (SmartVizXFramework === undefined)
    var SmartVizXFramework = {};

SmartVizXFramework.WebGLContext = function(_parent)   {

    var canvas = null;
    var parentElement = _parent;
    var glContext = null;

    var scope = this;

    (function(){
        canvas = document.createElement('canvas');

        var width = _parent.clientWidth;
        var height = _parent.clientHeight;
        if (width > SmartVizXFramework.Settings.maxWidth)    {
            width = SmartVizXFramework.Settings.maxWidth;
            height = width * SmartVizXFramework.Settings.requiredAspect;
        }

        canvas.id = 'SmartVizXFrameworkCanvas';
        canvas.width = width;
        canvas.height = height;
        canvas.style.width = 100 + '%';
        canvas.style.height = 100 + '%';

        parentElement.appendChild(canvas);

        glContext = canvas.getContext('webgl', { antialias: true, stencil: false });

        _parent = undefined;
    })();

    scope.WebGLContext_getCanvasInternal = function() {
        return canvas;
    }

    scope.WebGLContext_getGLContextInternal = function()  {
        return glContext;
    }

    scope.WebGLContext_resizeInternal = function(width, height)  {
        if (width > SmartVizXFramework.Settings.maxWidth)    {
            width = SmartVizXFramework.Settings.maxWidth;
            height = width * SmartVizXFramework.Settings.requiredAspect;
        }

        canvas.width = width;
        canvas.height = height;
        canvas.style.width = 100 + '%';
        canvas.style.height = 100 + '%';
    }

    scope.WebGLContext_getWidthInternal = function()    {
        return canvas.width;
    }

    scope.WebGLContext_getHeightInternal = function()    {
        return canvas.height;
    }

    scope.WebGLContext_destroyInternal = function() {
        if (canvas != null) {
            canvas.remove();
            canvas = null;
        }
        parentElement = null;
        glContext = null;
        scope = null;
    }
}

SmartVizXFramework.WebGLContext.prototype.getCanvas = function()  {
    return this.WebGLContext_getCanvasInternal();
}

SmartVizXFramework.WebGLContext.prototype.getGLContext = function()  {
    return this.WebGLContext_getGLContextInternal();
}

SmartVizXFramework.WebGLContext.prototype.resize = function(width, height)  {
    return this.WebGLContext_resizeInternal(width, height);
}

SmartVizXFramework.WebGLContext.prototype.getWidth = function()  {
    return this.WebGLContext_getWidthInternal();
}

SmartVizXFramework.WebGLContext.prototype.getHeight = function()  {
    return this.WebGLContext_getHeightInternal();
}

SmartVizXFramework.WebGLContext.prototype.destroy = function()  {
    return this.WebGLContext_destroyInternal();
}
