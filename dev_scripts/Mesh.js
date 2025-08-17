'use strict';

if (SmartVizXFramework === undefined)
    var SmartVizXFramework = {};

SmartVizXFramework.Mesh = function(_smartVizCntxt, _name)   {
    var vertexBuffer = null;
    var name = _name;
    var verticesCount = 0;
    var smartVizContext = _smartVizCntxt;
    var indexBuffer = null;
    var indicesCount = 0;
    var vertexStride = 3; // now only supports 3
    var rawVertices = null;
    var rawIndices = null;
    var rawNormals = null;
    var normalBuffer = null;
    var rawVertexColors = null;
    var vertexColorBuffer = null;

    var scope = this;

    (function() {
        _smartVizCntxt = undefined;
        _name = undefined;
    })();

    scope.Mesh_destroyInternal = function() {
        clearVertexData();

        name = undefined;
        smartVizContext = undefined;
        scope = undefined;
        scope = null;
    }

    scope.Mesh_setVerticesInternal = function(_vertices) {
        if (_vertices != null && _vertices != undefined && _vertices['length'] != undefined)    {
            clearVertexData();

            rawVertices = getFloat32ArrayFromVector3Array(_vertices);

            if (rawVertices)   {
                verticesCount = rawVertices.length / vertexStride;

                var gl = smartVizContext.getGLContext();

                vertexBuffer = gl.createBuffer();

                // Bind appropriate array buffer to it
                gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

                // Pass the vertex data to the buffer
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rawVertices), gl.STATIC_DRAW);

                // Unbind the buffer
                gl.bindBuffer(gl.ARRAY_BUFFER, null);
            }
        }
    }

    scope.Mesh_setIndicesInternal = function(_indices)   {
        if (_indices != null && _indices != undefined && _indices['length'] != undefined && _indices.length >= 3 && Number.isInteger(_indices[0]))    {
            var gl = smartVizContext.getGLContext();
            rawIndices = _indices;
            indicesCount = _indices.length;

            // Create an empty buffer object to store Index buffer
            indexBuffer = gl.createBuffer();

            // Bind appropriate array buffer to it
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

            var uint16Arr = new Uint16Array(_indices);

            // Pass the vertex data to the buffer
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, uint16Arr, gl.STATIC_DRAW);

            // Unbind the buffer
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        }
    }

    scope.Mesh_prepareRenderInternal = function(_material)  {
        if (vertexBuffer != null && vertexBuffer != undefined)   {
            var gl = smartVizContext.getGLContext();

            var shaderProgram = _material.getShaderProgram();
            if (shaderProgram != null && shaderProgram != undefined)
            {
                // Bind appropriate array buffer to it
                gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

                // TODO:move this to material
                var position = gl.getAttribLocation(shaderProgram, SmartVizXFramework.ShaderAttributeTypes.Position);
                gl.vertexAttribPointer(position, vertexStride, gl.FLOAT, false, 0, 0) ; //position
                gl.enableVertexAttribArray(position);

                if (normalBuffer)   {
                    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
                    var normal = gl.getAttribLocation(shaderProgram, SmartVizXFramework.ShaderAttributeTypes.Normal);
                    if (normal >= 0) {
                        gl.vertexAttribPointer(normal, vertexStride, gl.FLOAT, false, 0, 0) ; //position
                        gl.enableVertexAttribArray(normal);
                    }
                }

                if (vertexColorBuffer != null)   {
                    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
                    var color = gl.getAttribLocation(shaderProgram, SmartVizXFramework.ShaderAttributeTypes.VertexColor);
                    if (color >= 0) {
                        gl.vertexAttribPointer(color, 4, gl.FLOAT, false, 0, 0) ; //position
                        gl.enableVertexAttribArray(color);
                    }
                }

                gl.bindBuffer(gl.ARRAY_BUFFER, null);
            }
        }
    }

    scope.Mesh_renderInternal = function()  {
        if (indexBuffer != null && indexBuffer != undefined)    {
            var gl = smartVizContext.getGLContext();

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
            gl.drawElements(gl.TRIANGLES, indicesCount, gl.UNSIGNED_SHORT, 0);
        }
    }

    scope.Mesh_computeNormalsInternal = function()  {
        if (rawVertices != null && rawVertices != undefined && rawIndices != null && rawIndices != undefined)    {
            clearNormalData();

            var vertsCount = rawVertices.length / vertexStride;
            var trianglesCount = rawIndices.length / 3;
            rawNormals = [];
            rawNormals.length = rawVertices.length;

            for (var i = 0; i < rawNormals.length; i++)    {
                rawNormals[i] = 0.0;
            }

            var shareCounts = [];
            shareCounts.length = vertsCount;
            for (var i = 0; i < shareCounts.length; i++)    {
                shareCounts[i] = 0;
            }

            for (var i = 0; i < trianglesCount; i++)    {
                var ind1 = rawIndices[i * 3 + 0];
                var ind2 = rawIndices[i * 3 + 1];
                var ind3 = rawIndices[i * 3 + 2];

                var vert1 = new SmartVizXFramework.Vector3(rawVertices[ind1 * vertexStride + 0], rawVertices[ind1 * vertexStride + 1], rawVertices[ind1 * vertexStride + 2]);
                var vert2 = new SmartVizXFramework.Vector3(rawVertices[ind2 * vertexStride + 0], rawVertices[ind2 * vertexStride + 1], rawVertices[ind2 * vertexStride + 2]);
                var vert3 = new SmartVizXFramework.Vector3(rawVertices[ind3 * vertexStride + 0], rawVertices[ind3 * vertexStride + 1], rawVertices[ind3 * vertexStride + 2]);

                var dir1 = new SmartVizXFramework.Vector3(vert1.getX(), vert1.getY(), vert1.getZ());
                var dir2 = new SmartVizXFramework.Vector3(vert3.getX(), vert3.getY(), vert3.getZ());

                dir1.subtract(vert2);
                dir2.subtract(vert2);

                dir1.cross(dir2);
                dir1.normalize();

                rawNormals[ind1 * vertexStride + 0] += -dir1.getX();        rawNormals[ind1 * vertexStride + 1] += -dir1.getY();        rawNormals[ind1 * vertexStride + 2] += -dir1.getZ();
                rawNormals[ind2 * vertexStride + 0] += -dir1.getX();        rawNormals[ind2 * vertexStride + 1] += -dir1.getY();        rawNormals[ind2 * vertexStride + 2] += -dir1.getZ();
                rawNormals[ind3 * vertexStride + 0] += -dir1.getX();        rawNormals[ind3 * vertexStride + 1] += -dir1.getY();        rawNormals[ind3 * vertexStride + 2] += -dir1.getZ();

                shareCounts[ind1]++;
                shareCounts[ind2]++;
                shareCounts[ind3]++;
            }

            for (var i = 0; i < shareCounts.length; i++)    {
                var shareCount = shareCounts[i];
                if (shareCount == 0)    {
                    console.error('Share count can not be zero, some problem in the algorithm');
                }
                else {
                    rawNormals[i * vertexStride + 0] /= shareCount;
                    rawNormals[i * vertexStride + 1] /= shareCount;
                    rawNormals[i * vertexStride + 2] /= shareCount;
                }
            }

            var gl = smartVizContext.getGLContext();

            normalBuffer = gl.createBuffer();

            // Bind appropriate array buffer to it
            gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);

            // Pass the vertex data to the buffer
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rawNormals), gl.STATIC_DRAW);

            // Unbind the buffer
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
        }
    }

    scope.Mesh_setNormalsInternal = function(_normals)   {
        if (_normals != null && _normals != undefined && _normals['length'] != undefined)    {
            rawNormals = getFloat32ArrayFromVector3Array(_normals);

            if (rawNormals)   {
                clearNormalData();

                var normalsCount = rawNormals.length / vertexStride;//only 3 stride supported

                var gl = smartVizContext.getGLContext();

                normalBuffer = gl.createBuffer();

                // Bind appropriate array buffer to it
                gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);

                // Pass the vertex data to the buffer
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rawNormals), gl.STATIC_DRAW);

                // Unbind the buffer
                gl.bindBuffer(gl.ARRAY_BUFFER, null);
            }
        }
    }

    scope.Mesh_setVertexColorInternal = function(_vertexColorData)   {
        //rawVertexColors = _vertexColorData;
        //var vertexColorBuffer = null;

        var colors = [];
        var colorCount = _vertexColorData.length/4;
        if (colorCount == verticesCount)    {
            var index = 0;
            for (var i = 0; i < colorCount; i++)    {
                colors.push(_vertexColorData[index++]/255.0);     colors.push(_vertexColorData[index++]/255.0);     colors.push(_vertexColorData[index++]/255.0);     colors.push(_vertexColorData[index++]/255.0);
            }

            rawVertexColors = colors

            var gl = smartVizContext.getGLContext();

            vertexColorBuffer = gl.createBuffer();

            // Bind appropriate array buffer to it
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);

            // Pass the vertex data to the buffer
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rawVertexColors), gl.STATIC_DRAW);

            // Unbind the buffer
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
        }
    }

    scope.getAABB = function(_transform)  {
        if (_transform == undefined || _transform == null || !(_transform instanceof SmartVizXFramework.Matrix4))   {
            _transform = new SmartVizXFramework.Matrix4();
        }

        if (rawVertices)    {
            var vCount = rawVertices.length / vertexStride;
            var bound = new SmartVizXFramework.AABB();

            for (var i = 0; i < vCount; i++)    {
                var point = new SmartVizXFramework.Vector3(rawVertices[i * 0], rawVertices[i * 1], rawVertices[i * 2]);
                point = _transform.transformVector(point);
                bound.addPoint(point);
            }

            return bound;
        }

        return null;
    }

    function getFloat32ArrayFromVector3Array(_vertices)  {

        if (_vertices.length >= 3 && _vertices[0] instanceof SmartVizXFramework.Vector3) {
            var floatArray = [];
            var length = _vertices.length;
            for (var i = 0; i < length; i++)    {
                floatArray.push(_vertices[i].getX());
                floatArray.push(_vertices[i].getY());
                floatArray.push(_vertices[i].getZ());
            }

            return floatArray;
        }
        else if ( (_vertices.length / vertexStride) >= 3 && SmartVizXFramework.Utils.isValidNum(_vertices[0]) )    {
            return _vertices;
        }

        return undefined;
    }

    function clearVertexData()    {
        if (vertexBuffer != null)   {
            var gl = smartVizContext.getGLContext();
            gl.deleteBuffer(vertexBuffer);
            vertexBuffer = null;
            verticesCount = 0;
            rawVertices = null;
        }

        if (indexBuffer)   {
            gl.deleteBuffer(indexBuffer);
            indexBuffer = null;
            indicesCount = 0;
            rawIndices = null;
        }

        clearNormalData();
    }

    function clearNormalData()  {
        if (normalBuffer != null)   {
            var gl = smartVizContext.getGLContext();
            gl.deleteBuffer(normalBuffer);
            normalBuffer = null;
            rawNormals = null;
        }
    }
}

SmartVizXFramework.Mesh.prototype.destroy = function()  {
    return this.Mesh_destroyInternal();
}

SmartVizXFramework.Mesh.prototype.setVertices = function(_vertices)  {
    return this.Mesh_setVerticesInternal(_vertices);
}

SmartVizXFramework.Mesh.prototype.setIndices = function(_indices)  {
    return this.Mesh_setIndicesInternal(_indices);
}

SmartVizXFramework.Mesh.prototype.prepareRender = function(_material)  {
    return this.Mesh_prepareRenderInternal(_material);
}

SmartVizXFramework.Mesh.prototype.render = function(_material)  {
    return this.Mesh_renderInternal(_material);
}

SmartVizXFramework.Mesh.prototype.computeNormals = function()  {
    return this.Mesh_computeNormalsInternal();
}

SmartVizXFramework.Mesh.prototype.setNormals = function(_normals)  {
    return this.Mesh_setNormalsInternal(_normals);
}

SmartVizXFramework.Mesh.prototype.setVertexColor = function(_vertexColorData)  {
    return this.Mesh_setVertexColorInternal(_vertexColorData);
}
