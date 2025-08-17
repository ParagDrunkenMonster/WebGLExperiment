'use strict';

if (SmartVizXFramework === undefined)
    var SmartVizXFramework = {};

SmartVizXFramework.VertexShader =
    'attribute vec3 Position;'+
    'attribute vec3 Normal;'+
    'attribute vec4 VertexColor;'+
    'uniform mat4 ProjectionMatrix;'+
    'uniform mat4 ViewMatrix;'+
    'uniform mat4 ModelMatrix;'+
    'uniform mat4 NormalMatrix;'+

    'uniform vec3 LightDirection1;'+
    'uniform vec3 LightDirection2;'+

    'varying vec3 TransformedNormal;'+
    'varying vec3 TransformedLightDir1;'+
    'varying vec3 TransformedLightDir2;'+
    'varying vec4 VColor;'+

    'void main(void) { '+//pre-built function
        'TransformedLightDir1 = (NormalMatrix * vec4(-LightDirection1, 1.)).xyz;'+
        'TransformedLightDir2 = (NormalMatrix * vec4(-LightDirection2, 1.)).xyz;'+
        'TransformedNormal = (NormalMatrix * vec4(Normal, 1.)).xyz;'+
        'VColor = VertexColor;'+
        'gl_Position = ProjectionMatrix * ViewMatrix * ModelMatrix * vec4(Position, 1.);'+
    '}';

SmartVizXFramework.FragmentShader =
    'uniform mediump float DirectionalLight1Intensity;'+
    'uniform mediump float DirectionalLight2Intensity;'+
    'uniform mediump vec4 MainColor;'+
    'uniform mediump vec4 AmbientLightColor;'+

    'varying highp vec3 TransformedNormal;'+
    'varying highp vec3 TransformedLightDir1;'+
    'varying highp vec3 TransformedLightDir2;'+
    'varying highp vec4 VColor;'+

    'void main(void) {' +
        'mediump float dotVal1 = dot(TransformedNormal, TransformedLightDir1);'+
        'mediump float dotVal2 = dot(TransformedNormal, TransformedLightDir2);'+
        'mediump float dotVal = min((max(0.0, dotVal1) * DirectionalLight1Intensity + max(0.0, dotVal2) * DirectionalLight2Intensity), 1.0);'+
        'mediump vec4 color = vec4(VColor.rgb * MainColor.xyz * dotVal, MainColor.w * VColor.a);' +
        'color = vec4(color.rgb + AmbientLightColor.rgb, color.a);'+
        'color = clamp(color, 0.0, 1.0);'+
        'gl_FragColor = color;'+
        //'gl_FragColor = vec4(dotVal2,dotVal2, dotVal2, 1.0);' +
        //'gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);' +
    '}';

// TODO: these things shouldn't be here :)
SmartVizXFramework.ShaderAttributeTypes = {
    Position:'Position',
    Normal:'Normal',
    VertexColor:'VertexColor'
};

SmartVizXFramework.ShaderUniforms = {
    ProjectionMatrix:'ProjectionMatrix',
    ViewMatrix:'ViewMatrix',
    ModelMatrix:'ModelMatrix',
    NormalMatrix:'NormalMatrix',
    AmbientLightColor:'AmbientLightColor',
    LightDirection1:'LightDirection1',
    LightDirection2:'LightDirection2',
    DirectionalLight1Intensity:'DirectionalLight1Intensity',
    DirectionalLight2Intensity:'DirectionalLight2Intensity',
    MainColor:'MainColor'
};

// TODO: right now i am hardcoding shader into material
// Shader should have own class so that it can be instanced
SmartVizXFramework.Material = function(_smartVizCntxt)   {
    var fragmehtShader = null;
    var vertexShader = null;
    var shaderProgram = null;
    var ProjectionMatrix = null;
    var ViewMatrix = null;
    var ModelMatrix = null;
    var NormalMatrix = null;
    var AmbientLightColor = null;
    var LightDirection1 = null;
    var LightDirection2 = null;
    var DirectionalLight1Intensity = null;
    var DirectionalLight2Intensity = null;
    var MainColor = null;
    var smartVizContext = _smartVizCntxt;

    var mainColorValue = [1, 1, 1, 1];

    var scope = this;

    (function() {

        var gl = smartVizContext.getGLContext();

        vertexShader = gl.createShader(gl.VERTEX_SHADER);

        // Attach vertex shader source code
        gl.shaderSource(vertexShader, SmartVizXFramework.VertexShader);

        // Compile the vertex shader
        gl.compileShader(vertexShader);
        checkCompileError(vertexShader);

        // Create fragment shader object
        fragmehtShader = gl.createShader(gl.FRAGMENT_SHADER);

        // Attach fragment shader source code
        gl.shaderSource(fragmehtShader, SmartVizXFramework.FragmentShader);

        // Compile the fragmentt shader
        gl.compileShader(fragmehtShader);
        checkCompileError(fragmehtShader);

        // Create a shader program object to
        // store the combined shader program
        shaderProgram = gl.createProgram();

        // Attach a vertex shader
        gl.attachShader(shaderProgram, vertexShader);

        // Attach a fragment shader
        gl.attachShader(shaderProgram, fragmehtShader);

        gl.linkProgram(shaderProgram);

        ProjectionMatrix = gl.getUniformLocation(shaderProgram, SmartVizXFramework.ShaderUniforms.ProjectionMatrix);
        ViewMatrix = gl.getUniformLocation(shaderProgram, SmartVizXFramework.ShaderUniforms.ViewMatrix);
        ModelMatrix = gl.getUniformLocation(shaderProgram, SmartVizXFramework.ShaderUniforms.ModelMatrix);
        NormalMatrix = gl.getUniformLocation(shaderProgram, SmartVizXFramework.ShaderUniforms.NormalMatrix);
        AmbientLightColor = gl.getUniformLocation(shaderProgram, SmartVizXFramework.ShaderUniforms.AmbientLightColor);
        LightDirection1 = gl.getUniformLocation(shaderProgram, SmartVizXFramework.ShaderUniforms.LightDirection1);
        LightDirection2 = gl.getUniformLocation(shaderProgram, SmartVizXFramework.ShaderUniforms.LightDirection2);
        DirectionalLight1Intensity = gl.getUniformLocation(shaderProgram, SmartVizXFramework.ShaderUniforms.DirectionalLight1Intensity);
        DirectionalLight2Intensity = gl.getUniformLocation(shaderProgram, SmartVizXFramework.ShaderUniforms.DirectionalLight2Intensity);
        MainColor = gl.getUniformLocation(shaderProgram, SmartVizXFramework.ShaderUniforms.MainColor);

        _smartVizCntxt = null;
    })();

    scope.Material_destroyInternal = function() {
        var gl = smartVizContext.getGLContext();
        if (shaderProgram != null)  {
            gl.detachShader(shaderProgram, vertexShader);
            gl.detachShader(shaderProgram, fragmehtShader);
            gl.deleteProgram(shaderProgram);

            gl.deleteShader(vertexShader);
            gl.deleteShader(fragmehtShader);
        }

        fragmehtShader = null;
        vertexShader = null;
        shaderProgram = null;
        smartVizContext = null;
        ProjectionMatrix = null;
        ViewMatrix = null;
        ModelMatrix = null;
        NormalMatrix = null;
        AmbientLightColor = null;
        LightDirection1 = null;
        LightDirection2 = null;
        DirectionalLight1Intensity = null;
        DirectionalLight2Intensity = null;
        MainColor = null;
        smartVizContext = null;
        mainColorValue = null
        scope = null;
    }

    scope.Material_beginInternal = function(_projection, _view, _model)   {
        var gl = smartVizContext.getGLContext();
        gl.useProgram(shaderProgram);

        gl.uniformMatrix4fv(ProjectionMatrix, false, _projection.getElements());
        gl.uniformMatrix4fv(ViewMatrix, false, _view.getElements());
        gl.uniformMatrix4fv(ModelMatrix, false, _model.getElements());

        if (AmbientLightColor != null)  {
            gl.uniform4fv(AmbientLightColor, SmartVizXFramework.Material.ambientLightColor);
        }

        if (LightDirection1 != null) {
            var lightDir = [SmartVizXFramework.Material.lightDir1.getX(), SmartVizXFramework.Material.lightDir1.getY(), SmartVizXFramework.Material.lightDir1.getZ()];
            gl.uniform3fv(LightDirection1, lightDir);
        }

        if (LightDirection2 != null) {
            var lightDir = [SmartVizXFramework.Material.lightDir2.getX(), SmartVizXFramework.Material.lightDir2.getY(), SmartVizXFramework.Material.lightDir2.getZ()];
            gl.uniform3fv(LightDirection2, lightDir);
        }

        if (DirectionalLight1Intensity != null) {
            gl.uniform1f(DirectionalLight1Intensity, SmartVizXFramework.Material.directionalLight1Intensity);
        }

        if (DirectionalLight2Intensity != null) {
            gl.uniform1f(DirectionalLight2Intensity, SmartVizXFramework.Material.directionalLight2Intensity);
        }

        if (MainColor != null) {
            gl.uniform4fv(MainColor, mainColorValue);
        }

        var normalMatrix = new SmartVizXFramework.Matrix4(_model.getElements());
        if (normalMatrix)   {
            normalMatrix.preMultiply(_view);
            normalMatrix.inverse();
            normalMatrix.transpose();
            gl.uniformMatrix4fv(NormalMatrix, false, normalMatrix.getElements());
        }
    }

    scope.Material_endInternal = function() {

    }

    scope.Material_getShaderProgramInternal = function()    {
        return shaderProgram;
    }

    scope.Material_setMainColorInternal = function(r, g, b, a)    {
        mainColorValue[0] = r?r:mainColorValue[0];
        mainColorValue[1] = g?r:mainColorValue[1];
        mainColorValue[2] = b?r:mainColorValue[2];
        mainColorValue[3] = a?r:mainColorValue[3];
    }

    function checkCompileError(shader)    {
        var gl = smartVizContext.getGLContext();
        var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (!compiled)  {
            var compilationLog = gl.getShaderInfoLog(shader);
            console.log('Shader compiler log: ' + compilationLog);
        }
    }
}

SmartVizXFramework.Material.prototype.destroy = function()  {
    return this.Material_destroyInternal();
}

SmartVizXFramework.Material.prototype.begin = function(_projection, _view, _model)  {
    return this.Material_beginInternal(_projection, _view, _model);
}

SmartVizXFramework.Material.prototype.end = function()  {
    return this.Material_endInternal();
}

SmartVizXFramework.Material.prototype.getShaderProgram = function()  {
    return this.Material_getShaderProgramInternal();
}

SmartVizXFramework.Material.prototype.setMainColor = function(r, g, b, a)  {
    return this.Material_setMainColorInternal(r, g, b, a);
}

// TODO, temporarily here, need to create light class
SmartVizXFramework.Material.ambientLightColor = [0,0,0,1];

SmartVizXFramework.Material.lightDir1 = new SmartVizXFramework.Vector3(1.0, -1.0, 2.0);
SmartVizXFramework.Material.lightDir1.normalize();

SmartVizXFramework.Material.lightDir2 = new SmartVizXFramework.Vector3(2.0, -1.0, 1.0);
SmartVizXFramework.Material.lightDir2.normalize();

SmartVizXFramework.Material.directionalLight1Intensity = 1.0;
SmartVizXFramework.Material.directionalLight2Intensity = 0.5;
