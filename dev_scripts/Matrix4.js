'use strict';

if (SmartVizXFramework === undefined)
    var SmartVizXFramework = {};

SmartVizXFramework.Matrix4 = function(_elements)   {
    var elements = [1, 0, 0, 0,
                    0, 1, 0, 0,
                    0, 0, 1, 0,
                    0, 0, 0, 1];

    var scope = this;

    (function()    {
        if (_elements && _elements['length'] && _elements.length == 16 && validateElements(_elements)) {
            copyElements(_elements);
        }
        _elements = undefined;
    })();

    scope.setElement = function(_index, _value) {
        elements[_index] = _value;
    }

    scope.getElement = function(_index) {
        return elements[_index];
    }

    scope.getElements = function() {
        return elements;
    }

    scope.copy = function(_matrix) {
        if (_matrix instanceof SmartVizXFramework.Matrix4)  {
            copyElements(_matrix.getElements());
        }
    }

    scope.setTranslate = function(_translate)    {
        elements[12] = _translate.getX();
        elements[13] = _translate.getY();
        elements[14] = _translate.getZ();
    }

    scope.translate = function(_translate)    {
        elements[12] += _translate.getX();
        elements[13] += _translate.getY();
        elements[14] += _translate.getZ();
    }

    scope.getTranslate = function()    {
        return new SmartVizXFramework.Vector3(elements[12], elements[13], elements[14]);
    }

    scope.getRight = function() {
        return new SmartVizXFramework.Vector3(elements[0], elements[1], elements[2]);
    }

    scope.getUp = function() {
        return new SmartVizXFramework.Vector3(elements[4], elements[5], elements[6]);
    }

    scope.getForward = function() {
        return new SmartVizXFramework.Vector3(elements[8], elements[9], elements[10]);
    }

    scope.setRotationX = function(_radians)   {
        var c = Math.cos(_radians);
        var s = Math.sin(_radians);

        elements[0] = 1.0;          elements[1] = 0.0;          elements[2] = 0.0;

        elements[4] = 0.0;          elements[5] = c;            elements[6] = -s;

        elements[8] = 0.0;          elements[9] = s;            elements[10] = c;
    }

    scope.setRotationY = function(_radians)   {
        var c = Math.cos(_radians);
        var s = Math.sin(_radians);

        elements[0] = c;            elements[1] = 0.0;          elements[2] = s;

        elements[4] = 0.0;          elements[5] = 1.0;          elements[6] = 0.0;

        elements[8] = -s;           elements[9] = 0.0;          elements[10] = c;
    }

    scope.setRotationZ = function(_radians)   {
        var c = Math.cos(_radians);
        var s = Math.sin(_radians);

        elements[0] = c;            elements[1] = -s;           elements[2] = 0.0;

        elements[4] = s;            elements[5] = c;            elements[6] = 0.0;

        elements[8] = 0.0;          elements[9] = 0.0;          elements[10] = 1.0;
    }

    scope.setRotationXCosSine = function(_cos, _sin)   {
        elements[0] = 1.0;          elements[1] = 0.0;             elements[2] = 0.0;

        elements[4] = 0.0;          elements[5] = _cos;            elements[6] = -_sin;

        elements[8] = 0.0;          elements[9] = _sin;            elements[10] = _cos;
    }

    scope.setRotationYCosSine  = function(_cos, _sin)   {
        elements[0] = _cos;            elements[1] = 0.0;          elements[2] = _sin;

        elements[4] = 0.0;             elements[5] = 1.0;          elements[6] = 0.0;

        elements[8] = -_sin;           elements[9] = 0.0;          elements[10] = _cos;
    }

    scope.setRotationZCosSine  = function(_cos, _sin)   {
        elements[0] = _cos;            elements[1] = -_sin;           elements[2] = 0.0;

        elements[4] = _sin;            elements[5] = _cos;            elements[6] = 0.0;

        elements[8] = 0.0;             elements[9] = 0.0;             elements[10] = 1.0;
    }

    scope.postMultiply = function(_right)   {
        var result = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

        var ae = elements;
		var be = _right.getElements();

		var a11 = ae[ 0 ], a12 = ae[ 4 ], a13 = ae[ 8 ], a14 = ae[ 12 ];
		var a21 = ae[ 1 ], a22 = ae[ 5 ], a23 = ae[ 9 ], a24 = ae[ 13 ];
		var a31 = ae[ 2 ], a32 = ae[ 6 ], a33 = ae[ 10 ], a34 = ae[ 14 ];
		var a41 = ae[ 3 ], a42 = ae[ 7 ], a43 = ae[ 11 ], a44 = ae[ 15 ];

		var b11 = be[ 0 ], b12 = be[ 4 ], b13 = be[ 8 ], b14 = be[ 12 ];
		var b21 = be[ 1 ], b22 = be[ 5 ], b23 = be[ 9 ], b24 = be[ 13 ];
		var b31 = be[ 2 ], b32 = be[ 6 ], b33 = be[ 10 ], b34 = be[ 14 ];
		var b41 = be[ 3 ], b42 = be[ 7 ], b43 = be[ 11 ], b44 = be[ 15 ];

		result[ 0 ] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
		result[ 4 ] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
		result[ 8 ] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
		result[ 12 ] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;

		result[ 1 ] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
		result[ 5 ] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
		result[ 9 ] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
		result[ 13 ] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;

		result[ 2 ] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
		result[ 6 ] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
		result[ 10 ] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
		result[ 14 ] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;

		result[ 3 ] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
		result[ 7 ] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
		result[ 11 ] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
		result[ 15 ] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;

        copyElements(result);
    }

    scope.preMultiply = function(_left)   {
        var result = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

        var ae = _left.getElements();
		var be = elements;

		var a11 = ae[ 0 ], a12 = ae[ 4 ], a13 = ae[ 8 ], a14 = ae[ 12 ];
		var a21 = ae[ 1 ], a22 = ae[ 5 ], a23 = ae[ 9 ], a24 = ae[ 13 ];
		var a31 = ae[ 2 ], a32 = ae[ 6 ], a33 = ae[ 10 ], a34 = ae[ 14 ];
		var a41 = ae[ 3 ], a42 = ae[ 7 ], a43 = ae[ 11 ], a44 = ae[ 15 ];

		var b11 = be[ 0 ], b12 = be[ 4 ], b13 = be[ 8 ], b14 = be[ 12 ];
		var b21 = be[ 1 ], b22 = be[ 5 ], b23 = be[ 9 ], b24 = be[ 13 ];
		var b31 = be[ 2 ], b32 = be[ 6 ], b33 = be[ 10 ], b34 = be[ 14 ];
		var b41 = be[ 3 ], b42 = be[ 7 ], b43 = be[ 11 ], b44 = be[ 15 ];

		result[ 0 ] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
		result[ 4 ] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
		result[ 8 ] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
		result[ 12 ] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;

		result[ 1 ] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
		result[ 5 ] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
		result[ 9 ] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
		result[ 13 ] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;

		result[ 2 ] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
		result[ 6 ] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
		result[ 10 ] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
		result[ 14 ] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;

		result[ 3 ] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
		result[ 7 ] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
		result[ 11 ] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
		result[ 15 ] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;

        copyElements(result);
    }

    scope.multiplyScalar = function ( s ) {
		elements[ 0 ] *= s; elements[ 4 ] *= s; elements[ 8 ] *= s; elements[ 12 ] *= s;
		elements[ 1 ] *= s; elements[ 5 ] *= s; elements[ 9 ] *= s; elements[ 13 ] *= s;
		elements[ 2 ] *= s; elements[ 6 ] *= s; elements[ 10 ] *= s; elements[ 14 ] *= s;
		elements[ 3 ] *= s; elements[ 7 ] *= s; elements[ 11 ] *= s; elements[ 15 ] *= s;
	}

    scope.constructProjectionMatrix = function(_radian, _aspect, _near, _far)  {
        var ang = Math.tan(_radian * 0.5);

        elements[0] = 0.5 / ang;            elements[1] = 0;                        elements[2] = 0;                                        elements[3] = 0;
        elements[4] = 0;                    elements[5] = 0.5 * _aspect / ang;      elements[6] = 0;                                        elements[7] = 0;
        elements[8] = 0;                    elements[9] = 0;                        elements[10] = -(_far + _near) / (_far - _near);        elements[11] = -1;
        elements[12] = 0;                   elements[13] = 0;                       elements[14] = (-2 * _far * _near) / (_far - _near);    elements[15] = 0;
    }

    scope.getInverse = function()
    {
        var newMat = new SmartVizXFramework.Matrix4(elements);
        newMat.inverse();
        return newMat;
    }

	scope.inverse = function()
	{
        var result = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

		var n11 = elements[ 0 ], n12 = elements[ 4 ], n13 = elements[ 8 ], n14 = elements[ 12 ];
		var n21 = elements[ 1 ], n22 = elements[ 5 ], n23 = elements[ 9 ], n24 = elements[ 13 ];
		var n31 = elements[ 2 ], n32 = elements[ 6 ], n33 = elements[ 10 ], n34 = elements[ 14 ];
		var n41 = elements[ 3 ], n42 = elements[ 7 ], n43 = elements[ 11 ], n44 = elements[ 15 ];

		result[ 0 ] = n23 * n34 * n42 - n24 * n33 * n42 + n24 * n32 * n43 - n22 * n34 * n43 - n23 * n32 * n44 + n22 * n33 * n44;
		result[ 4 ] = n14 * n33 * n42 - n13 * n34 * n42 - n14 * n32 * n43 + n12 * n34 * n43 + n13 * n32 * n44 - n12 * n33 * n44;
		result[ 8 ] = n13 * n24 * n42 - n14 * n23 * n42 + n14 * n22 * n43 - n12 * n24 * n43 - n13 * n22 * n44 + n12 * n23 * n44;
		result[ 12 ] = n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34;
		result[ 1 ] = n24 * n33 * n41 - n23 * n34 * n41 - n24 * n31 * n43 + n21 * n34 * n43 + n23 * n31 * n44 - n21 * n33 * n44;
		result[ 5 ] = n13 * n34 * n41 - n14 * n33 * n41 + n14 * n31 * n43 - n11 * n34 * n43 - n13 * n31 * n44 + n11 * n33 * n44;
		result[ 9 ] = n14 * n23 * n41 - n13 * n24 * n41 - n14 * n21 * n43 + n11 * n24 * n43 + n13 * n21 * n44 - n11 * n23 * n44;
		result[ 13 ] = n13 * n24 * n31 - n14 * n23 * n31 + n14 * n21 * n33 - n11 * n24 * n33 - n13 * n21 * n34 + n11 * n23 * n34;
		result[ 2 ] = n22 * n34 * n41 - n24 * n32 * n41 + n24 * n31 * n42 - n21 * n34 * n42 - n22 * n31 * n44 + n21 * n32 * n44;
		result[ 6 ] = n14 * n32 * n41 - n12 * n34 * n41 - n14 * n31 * n42 + n11 * n34 * n42 + n12 * n31 * n44 - n11 * n32 * n44;
		result[ 10 ] = n12 * n24 * n41 - n14 * n22 * n41 + n14 * n21 * n42 - n11 * n24 * n42 - n12 * n21 * n44 + n11 * n22 * n44;
		result[ 14 ] = n14 * n22 * n31 - n12 * n24 * n31 - n14 * n21 * n32 + n11 * n24 * n32 + n12 * n21 * n34 - n11 * n22 * n34;
		result[ 3 ] = n23 * n32 * n41 - n22 * n33 * n41 - n23 * n31 * n42 + n21 * n33 * n42 + n22 * n31 * n43 - n21 * n32 * n43;
		result[ 7 ] = n12 * n33 * n41 - n13 * n32 * n41 + n13 * n31 * n42 - n11 * n33 * n42 - n12 * n31 * n43 + n11 * n32 * n43;
		result[ 11 ] = n13 * n22 * n41 - n12 * n23 * n41 - n13 * n21 * n42 + n11 * n23 * n42 + n12 * n21 * n43 - n11 * n22 * n43;
		result[ 15 ] = n12 * n23 * n31 - n13 * n22 * n31 + n13 * n21 * n32 - n11 * n23 * n32 - n12 * n21 * n33 + n11 * n22 * n33;

		var det = n11 * result[ 0 ] + n21 * result[ 4 ] + n31 * result[ 8 ] + n41 * result[ 12 ];

		if ( SmartVizXFramework.Math.Abs(det) <= SmartVizXFramework.Math.EPSILON ) {
			console.error('Matrix can not be inversed');
            return;
		}

        copyElements(result);

		scope.multiplyScalar( 1 / det );
	}

    scope.angleAxis = function( _radian, _axis ) {

		var c = Math.cos( _radian );
		var s = Math.sin( _radian );
		var t = 1 - c;
		var x = _axis.getX(), y = _axis.getY(), z = _axis.getZ();
		var tx = t * x, ty = t * y;

		elements[0] = tx * x + c;                elements[1] = tx * y - s * z;               elements[2] = tx * z + s * y;                   elements[3] = 0;
		elements[4] = tx * y + s * z;            elements[5] = ty * y + c;                   elements[6] = ty * z - s * x;                   elements[7] = 0;
		elements[8] = tx * z - s * y;            elements[9] = ty * z + s * x;               elements[10] = t * z * z + c;                   elements[11] = 0;
		elements[12] = 0;                        elements[13] = 0;                           elements[14] = 0;                               elements[15] = 1;
	}

    scope.transpose = function () {
		var result = elements;
		var tmp;

		tmp = result[ 1 ]; result[ 1 ] = result[ 4 ]; result[ 4 ] = tmp;
		tmp = result[ 2 ]; result[ 2 ] = result[ 8 ]; result[ 8 ] = tmp;
		tmp = result[ 6 ]; result[ 6 ] = result[ 9 ]; result[ 9 ] = tmp;

		tmp = result[ 3 ]; result[ 3 ] = result[ 12 ]; result[ 12 ] = tmp;
		tmp = result[ 7 ]; result[ 7 ] = result[ 13 ]; result[ 13 ] = tmp;
		tmp = result[ 11 ]; result[ 11 ] = result[ 14 ]; result[ 14 ] = tmp;
	}

    scope.fromEuler = function (_eulerRadians, _order) {
		var x = _eulerRadians.getX(), y = _eulerRadians.getY(), z = _eulerRadians.getZ();
		var a = Math.cos( x ), b = Math.sin( x );
		var c = Math.cos( y ), d = Math.sin( y );
		var e = Math.cos( z ), f = Math.sin( z );

		if ( _order === 'XYZ' ) {

			var ae = a * e, af = a * f, be = b * e, bf = b * f;

			elements[ 0 ] = c * e;
			elements[ 4 ] = - c * f;
			elements[ 8 ] = d;

			elements[ 1 ] = af + be * d;
			elements[ 5 ] = ae - bf * d;
			elements[ 9 ] = - b * c;

			elements[ 2 ] = bf - ae * d;
			elements[ 6 ] = be + af * d;
			elements[ 10 ] = a * c;

		} else if ( _order === 'YXZ' ) {

			var ce = c * e, cf = c * f, de = d * e, df = d * f;

			elements[ 0 ] = ce + df * b;
			elements[ 4 ] = de * b - cf;
			elements[ 8 ] = a * d;

			elements[ 1 ] = a * f;
			elements[ 5 ] = a * e;
			elements[ 9 ] = - b;

			elements[ 2 ] = cf * b - de;
			elements[ 6 ] = df + ce * b;
			elements[ 10 ] = a * c;

		} else if ( _order === 'ZXY' ) {

			var ce = c * e, cf = c * f, de = d * e, df = d * f;

			elements[ 0 ] = ce - df * b;
			elements[ 4 ] = - a * f;
			elements[ 8 ] = de + cf * b;

			elements[ 1 ] = cf + de * b;
			elements[ 5 ] = a * e;
			elements[ 9 ] = df - ce * b;

			elements[ 2 ] = - a * d;
			elements[ 6 ] = b;
			elements[ 10 ] = a * c;

		} else if ( _order === 'ZYX' ) {

			var ae = a * e, af = a * f, be = b * e, bf = b * f;

			elements[ 0 ] = c * e;
			elements[ 4 ] = be * d - af;
			elements[ 8 ] = ae * d + bf;

			elements[ 1 ] = c * f;
			elements[ 5 ] = bf * d + ae;
			elements[ 9 ] = af * d - be;

			elements[ 2 ] = - d;
			elements[ 6 ] = b * c;
			elements[ 10 ] = a * c;

		} else if ( _order === 'YZX' ) {

			var ac = a * c, ad = a * d, bc = b * c, bd = b * d;

			elements[ 0 ] = c * e;
			elements[ 4 ] = bd - ac * f;
			elements[ 8 ] = bc * f + ad;

			elements[ 1 ] = f;
			elements[ 5 ] = a * e;
			elements[ 9 ] = - b * e;

			elements[ 2 ] = - d * e;
			elements[ 6 ] = ad * f + bc;
			elements[ 10 ] = ac - bd * f;

		} else if ( _order === 'XZY' ) {

			var ac = a * c, ad = a * d, bc = b * c, bd = b * d;

			elements[ 0 ] = c * e;
			elements[ 4 ] = - f;
			elements[ 8 ] = d * e;

			elements[ 1 ] = ac * f + bd;
			elements[ 5 ] = a * e;
			elements[ 9 ] = ad * f - bc;

			elements[ 2 ] = bc * f - ad;
			elements[ 6 ] = b * e;
			elements[ 10 ] = bd * f + ac;

		}

		// last column
		elements[ 3 ] = 0;
		elements[ 7 ] = 0;
		elements[ 11 ] = 0;

		// bottom row
		elements[ 12 ] = 0;
		elements[ 13 ] = 0;
		elements[ 14 ] = 0;
		elements[ 15 ] = 1;
    }

    scope.transformVector = function (_pos) {
		var _x = _pos.getX(), _y = _pos.getY(), _z = _pos.getZ();

		var e = elements;

		var x = e[ 0 ] * _x + e[ 4 ] * _y + e[ 8 ]  * _z + e[ 12 ];
		var y = e[ 1 ] * _x + e[ 5 ] * _y + e[ 9 ]  * _z + e[ 13 ];
		var z = e[ 2 ] * _x + e[ 6 ] * _y + e[ 10 ] * _z + e[ 14 ];

		return new SmartVizXFramework.Vector3(x, y, z);
	}

    scope.rotateVector = function (_pos) {
		var _x = _pos.getX(), _y = _pos.getY(), _z = _pos.getZ();

		var e = elements;

		var x = e[ 0 ] * _x + e[ 4 ] * _y + e[ 8 ]  * _z;
		var y = e[ 1 ] * _x + e[ 5 ] * _y + e[ 9 ]  * _z;
		var z = e[ 2 ] * _x + e[ 6 ] * _y + e[ 10 ] * _z;

		return new SmartVizXFramework.Vector3(x, y, z);
	}

    function validateElements(_elements)    {
        if (_elements && _elements['length'] && _elements.length == 16) {
            var length = _elements.length;
            for (var i = 0; i < length; i++)    {
                if (!SmartVizXFramework.Utils.isValidNum(_elements[i]))    {
                    return false;
                }
            }
            return true;
        }

        return false;
    }

    function copyElements(_elements)    {
        var length = _elements.length;
        for (var i = 0; i < length; i++)    {
            elements[i] = _elements[i];
        }
    }
}
