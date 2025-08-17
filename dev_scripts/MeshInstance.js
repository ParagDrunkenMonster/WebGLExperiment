'use strict';

if (SmartVizXFramework === undefined)
    var SmartVizXFramework = {};

SmartVizXFramework.MeshInstance = function(_mesh)   {
    var mesh = _mesh
    var material = null;

    var scope = this;

    (function() {
        _mesh = undefined;
    })();

    scope.MeshInstance_destroyInternal = function() {
        mesh = null;
    }

    scope.MeshInstance_renderInternal = function(_projection, _view, _model)  {
        if (material != null)   {
            material.begin(_projection, _view, _model);
            mesh.prepareRender(material);
            mesh.render();
            material.end();
        }
    }

    scope.MeshInstance_setMaterialInternal = function(_material)    {
        material = _material;
    }

    scope.MeshInstance_getAABBInternal = function(_transform)   {
        if (mesh)   {
            return mesh.getAABB(_transform);
        }
        return null;
    }
}

SmartVizXFramework.MeshInstance.prototype.destroy = function()  {
    return this.MeshInstance_destroyInternal();
}

SmartVizXFramework.MeshInstance.prototype.render = function(_projection, _view, _model)  {
    return this.MeshInstance_renderInternal(_projection, _view, _model);
}

SmartVizXFramework.MeshInstance.prototype.setMaterial = function(_material)  {
    return this.MeshInstance_setMaterialInternal(_material);
}

SmartVizXFramework.MeshInstance.prototype.getAABB = function(_transform)  {
    return this.MeshInstance_getAABBInternal(_transform);
}
