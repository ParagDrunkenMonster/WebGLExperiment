'use strict';

if (SmartVizXFramework === undefined)
  var SmartVizXFramework = {};

// TODO: split the mesh loading part to a child class
SmartVizXFramework.BinaryLoader = function(_webGLContext, _fileURL, _onLoaded, _onFailed, _userData)   {

    var ChunkId = {
		CHUNK_ID_HEADER : 0,
		CHUNK_ID_DATA : 1,
	};

    var BDataElementType = {
            CHARACTER : 0,
            NAME : 1,
            FLOAT32 : 2,
            INT8 : 3,
            UNSIGNED_INT8 : 4,
            INT16 : 5,
            UNSIGNED_INT16 : 6,
            INT32 : 7,
            UNSIGNED_INT32 : 8,
            FIXED_2_14 : 9,
            FIXED_4_12 : 10,
            FIXED_6_10 : 11,
            FIXED_8_8 : 12,
            FIXED_10_6 : 13,
	};

    var GBSemantic = {
		None : 0,
		MESHNAME : 1,
		POSITION : 2,
		NORMAL : 3,
		TANGENT : 4,
		BINORMAL : 5,
		TEXCOORD0 : 6,
		TEXCOORD1 : 7,
		TEXCOORD2 : 8,
		TEXCOORD3 : 9,
		TEXCOORD4 : 10,
		TEXCOORD5 : 11,
		TEXCOORD6 : 12,
		COLOR0 : 13,
		COLOR1 : 14,
		COLOR2 : 15,
		COLOR3 : 16,
		COLOR4 : 17,
		COLOR5 : 18,
		COLOR6 : 19,
		INDICES : 20,
		SKELETONNAME : 21,
		BONES : 22,
		BONEWEIGHTS : 23,
		BONEINFLUENCECOUNTINDICES : 24,
		WEIGHTINDICES : 25,
		BONEINDICES : 26,
		INVBINDMATRIX : 27,
		BINDSHAPEMATRIX : 28,
        REFERENCE : 29
	};

    // ----------------------------------------------------------------------------
	// Header Chunck
    // Size Of File header 32 bytes = 4bytes(Int32) * 8 = 32bits(Int32) * 8
	var BFileHeaderChunk = function()  {
		this.magicNumber = 0;          // Int32
		this.chunkId = 0;              // Int32
		this.versionNumber = 0;        // Int32
		this.fileSize = 0;             // Int32
		//var unusedData[4]; //for future use //size 4 * 4
    }

    BFileHeaderChunk.size = 32;
	// ----------------------------------------------------------------------------
	// Data Chunck
	// Total chunk size is 32 bytes = 4bytes(Int32) * 8 = 32bits(Int32) * 8
    var BFileDataChunk = function() {
        this.chunkId = 0;                // Int32
        this.dataContainsSemantic = 0;   // Int32
        //var m_UnusedData[6]       // For future use //size 4 * 4
    }

    BFileDataChunk.size = 32;

    // ----------------------------------------------------------------------------
    // Data block Header
    //Each data block header is 32 bytes = 4bytes(Int32) * 8 = 32bits(Int32) * 8 when dataCount = 0
    var DataBlockHeader = function()    {
        this.dataBlockSemantic = 0;  // Int32
        this.dataElementType = 0;    // Int32
        this.dataElementSize = 0;    // Int32
        this.dataStride = 0;         // Int32
        this.dataCount = 0;          // Int32
        this.userData = [0, 0, 0];	 // can be utilized by user    // Int32 each
        this.data = {};              // size of this is from dataElementSize * dataCount
    };

    DataBlockHeader.size = 32;
    // ----------------------------------------------------------------------------

    var webGLContext = _webGLContext;
    var currFileURL = _fileURL;
    var onGeometryLoaded = _onLoaded;
    var onGeometryLoadingFailed = _onFailed;
    var fileHeader;
	var dataChunk;
    var geometryData;
    var httpFileLoader;
    var userData = _userData;

    var scope = this;

    (function() {
        _webGLContext = null;
        _fileURL = null;
        _onLoaded = null;
        _onFailed = null;
        _userData = null;
    })();

    scope.loadFile = function()   {

        if (httpFileLoader == null || httpFileLoader == undefined)  {
            httpFileLoader = new SmartVizXFramework.HttpFileLoader(currFileURL, onFileLoaded, onError, SmartVizXFramework.HttpFileLoader.FileType.BINARY);
            httpFileLoader.loadFile();
        }
   }

   function onFileLoaded(dataArray) {

        fileHeader = new BFileHeaderChunk();
        // Size Of File header 32 bytes = 4bytes(Int32) * 8 = 32bits(Int32) * 8
        var headerDataBuffer = new Int32Array(dataArray,0, 8);
        fileHeader.magicNumber = headerDataBuffer[0];
        fileHeader.chunkId = headerDataBuffer[1];
        fileHeader.versionNumber = headerDataBuffer[2];
        fileHeader.fileSize = headerDataBuffer[3];

        printMagicNumber();
        if (fileHeader.fileSize != dataArray.byteLength)   {
            onError('Data file ' + currFileURL + ' has been corrupted ');
        }
        else {
            // Load data chunk
            var dataChunkBuffer = new Int32Array(dataArray, BFileDataChunk.size, 8);
            dataChunk = new BFileDataChunk();
            dataChunk.chunkId = dataChunkBuffer[0];                // Int32
            dataChunk.dataContainsSemantic = dataChunkBuffer[1];   // Int32

            if (dataChunk.chunkId == ChunkId.CHUNK_ID_DATA) {
                geometryData = [];
                var startSize = BFileHeaderChunk.size + BFileDataChunk.size;
                var remainingData = dataArray.slice(BFileHeaderChunk.size + BFileDataChunk.size);
                var loadingSuccess = true;
                while( remainingData.byteLength > 0 )
                {
                    var newDataBlock = new DataBlockHeader();
                    geometryData.push(newDataBlock);
                    var currDataSize = loadFileDataBlockFromDataArray(remainingData, newDataBlock);
                    if( currDataSize >= 0)
                    {
                        remainingData = remainingData.slice(currDataSize);
                    }
                    else
                    {
                        loadingSuccess = false;
                        onError('Error occured during loading data block...');
                        break;
                    }
                }

                if (loadingSuccess) {
                    if (loadGeometryData() == false) {
                        loadingSuccess = false;
                        onError('Data file ' + currFileURL + ' has been corrupted ');
                    }
                }
            }
            else {
                onError('Data file ' + currFileURL + ' has been corrupted ');
            }
        }
    }

    function onError(error) {
        onGeometryLoadingFailed(error, currFileURL, userData);
    }

    function loadFileDataBlockFromDataArray(dataArray, oDataBlock )    {

        var headerDataBuffer = new Int32Array(dataArray, 0, DataBlockHeader.size/4);// sizeof(int32) == 4 bytes
        oDataBlock.dataBlockSemantic = headerDataBuffer[0];
        oDataBlock.dataElementType = headerDataBuffer[1];
        oDataBlock.dataElementSize = headerDataBuffer[2];
        oDataBlock.dataStride = headerDataBuffer[3];
        oDataBlock.dataCount = headerDataBuffer[4];
        // do it in a loop, make it preety
        oDataBlock.userData[0] = headerDataBuffer[5];
        oDataBlock.userData[1] = headerDataBuffer[6];
        oDataBlock.userData[2] = headerDataBuffer[7];
        /*BDataElementType
        CHARACTER : 0,
        NAME : 1,
        FLOAT32 : 2,
        INT8 : 3,
        UNSIGNED_INT8 : 4,
        INT16 : 5,
        UNSIGNED_INT16 : 6,
        INT32 : 7,
        UNSIGNED_INT32 : 8,
        */
        var dataSize = computeDataSize(oDataBlock);
        if( dataSize > 0 )
        {
            var sliceStart = DataBlockHeader.size;
            var sliceEnd = DataBlockHeader.size + dataSize;
            var slicedData = dataArray.slice(sliceStart, sliceEnd);

            if (oDataBlock.dataElementSize == 1)    {
                if (oDataBlock.dataElementType == BDataElementType.UNSIGNED_INT8)    {
                    oDataBlock.data = new Uint8Array(slicedData);
                }
                else {
                    oDataBlock.data = new Int8Array(slicedData);
                }
            }
            else if (oDataBlock.dataElementSize == 2)   {
                if (oDataBlock.dataElementType == BDataElementType.UNSIGNED_INT16)    {
                    oDataBlock.data = new Uint16Array(slicedData);
                }
                else if (oDataBlock.dataElementType == BDataElementType.FIXED_2_14 ||
                        oDataBlock.dataElementType == BDataElementType.FIXED_4_12 ||
                        oDataBlock.dataElementType == BDataElementType.FIXED_6_10 ||
                        oDataBlock.dataElementType == BDataElementType.FIXED_8_8 ||
                        oDataBlock.dataElementType == BDataElementType.FIXED_10_6) {
                    oDataBlock.data = new Int16Array(slicedData);
                }
                else {
                    oDataBlock.data = new Int16Array(slicedData);
                }
            }
            else if (oDataBlock.dataElementSize == 4)   {
                if (oDataBlock.dataElementType == BDataElementType.FLOAT32 )   {
                    oDataBlock.data = new Float32Array(slicedData);
                }
                else if (oDataBlock.dataElementType == BDataElementType.INT32)   {
                    oDataBlock.data = new Int32Array(slicedData);
                }
                else if (oDataBlock.dataElementType == BDataElementType.UNSIGNED_INT32)   {
                    oDataBlock.data = new Uint32Array(slicedData);
                }
            }

            return DataBlockHeader.size + oDataBlock.data.byteLength;
        }

        return -1;
    }

    function computeDataSize(dataBlock) {
        return dataBlock.dataElementSize * dataBlock.dataCount;
    }

    function printMagicNumber() {
        var string = '';
        var localMagicNumber = fileHeader.magicNumber;
        for ( var index = 0; index < 4; index ++ ) {
            var byte = localMagicNumber & 0xff;
            string += String.fromCharCode(byte);
            localMagicNumber = (localMagicNumber - byte) >> 8 ;
        }

        //console.log('Magic number is : ' + string + ', value : ' + fileHeader.magicNumber);
    }

    function getNextDataBlockBySemantic(semantic, startIndex)   {

        var dataIndex = 0;
        var dataBlocksCount = geometryData.length;
        for(var i = 0 ; i < dataBlocksCount ; i++ ) {
            var currDataBlock = geometryData[i];
            if( currDataBlock.dataBlockSemantic == semantic)   {
                if (startIndex) {
                    if (dataIndex >= startIndex)    {
                        return currDataBlock;
                    }
                }
                else {
                    return currDataBlock;
                }
                dataIndex++;
            }
        }

        return undefined;
    }

    function loadGeometryData() {

        var meshNameData = getNextDataBlockBySemantic(GBSemantic.MESHNAME);
        var meshName = getStringFromInt8Array(meshNameData.data);
        var vertexBufferData = getNextDataBlockBySemantic(GBSemantic.POSITION);
        var vertexColorData = getNextDataBlockBySemantic(GBSemantic.COLOR0);
        var normalData = getNextDataBlockBySemantic(GBSemantic.NORMAL);
        var indicesData = getNextDataBlockBySemantic(GBSemantic.INDICES);
        var uvCoords0 = getNextDataBlockBySemantic(GBSemantic.TEXCOORD0);
        var uvCoords1 = getNextDataBlockBySemantic(GBSemantic.TEXCOORD1);

        if (meshNameData == undefined)  {
            console.error('Vertex data for ' + currFileURL + ' is not found');
            return false;
        }

        if (vertexBufferData == undefined || indicesData == undefined)  {
            console.error('Vertex data for ' + currFileURL + ' is not found');
            return false;
        }

        var mesh = new SmartVizXFramework.Mesh(webGLContext, meshName);
        var vertices = [];

        var verticesCount = vertexBufferData.data.length/vertexBufferData.dataStride;
        if (vertexBufferData.dataStride != 3 && vertexBufferData.dataStride != 4)   {
            console.error('Vertex data stride for ' + currFileURL + ' has to be 3 or 4');
            mesh.destroy();
            return false;
        }

        var index = 0;
        for (var i = 0; i < verticesCount; i++) {
            if (vertexBufferData.dataStride == 3)  {
                var dataX = getFloatDataAtIndex(vertexBufferData, index++);
                var dataY = getFloatDataAtIndex(vertexBufferData, index++);
                var dataZ = getFloatDataAtIndex(vertexBufferData, index++);
                vertices.push( new SmartVizXFramework.Vector3(dataX, dataY, dataZ));
            }
            else if (vertexBufferData.dataStride == 4)  {
                var dataX = getFloatDataAtIndex(vertexBufferData, index++);
                var dataY = getFloatDataAtIndex(vertexBufferData, index++);
                var dataZ = getFloatDataAtIndex(vertexBufferData, index++);
                var dataW = getFloatDataAtIndex(vertexBufferData, index++);
                vertices.push( new SmartVizXFramework.Vector3(dataX, dataY, dataZ, dataW));
            }
        }

        mesh.setVertices(vertices);
        mesh.setIndices(indicesData.data);

        if (vertexColorData != null)    {
            mesh.setVertexColor(vertexColorData.data);
        }

        if (normalData != null) {
            var normals = [];

            var normalsCount = normalData.data.length/normalData.dataStride;
            if (normalsCount == verticesCount)  {
                if (normalData.dataStride != 3 && normalData.dataStride != 4)   {
                    console.error('Vertex data stride for ' + currFileURL + ' has to be 3 or 4');
                    mesh.destroy();
                    return false;
                }

                var index = 0;
                for (var i = 0; i < normalsCount; i++) {
                    if (normalData.dataStride == 3)  {
                        var dataX = getFloatDataAtIndex(normalData, index++);
                        var dataY = getFloatDataAtIndex(normalData, index++);
                        var dataZ = getFloatDataAtIndex(normalData, index++);
                        var normal = new SmartVizXFramework.Vector3(dataX, dataY, dataZ);
                        normal.normalize();
                        normals.push( normal );
                    }
                    else if (normalData.dataStride == 4)  {
                        var dataX = getFloatDataAtIndex(normalData, index++);
                        var dataY = getFloatDataAtIndex(normalData, index++);
                        var dataZ = getFloatDataAtIndex(normalData, index++);
                        var dataW = getFloatDataAtIndex(normalData, index++);
                        var normal = new SmartVizXFramework.Vector3(dataX, dataY, dataZ);
                        normal.normalize();
                        normals.push( normal );
                    }
                }

                mesh.setNormals(normals);
            }
        }

        /*if (uvCoords0)  {
            loadUV(uvCoords0, mesh, 0);
        }*/

        onGeometryLoaded(mesh, currFileURL, userData);

        if (httpFileLoader) {
            httpFileLoader.destroy();
            httpFileLoader = null;
        }

        return true;
    }

    /*function loadUV(uvCoords, mesh, uvInd)   {
        var uvCount = uvCoords.data.length/uvCoords.dataStride;
        if (uvCount > 0 && uvCoords.dataStride == 2)    {
            var allUVs = [];
            var index = 0;
            for (var i = 0; i < uvCount; i++)   {
                var dataX = getFloatDataAtIndex(uvCoords, index++);
                var dataY = getFloatDataAtIndex(uvCoords, index++);
                allUVs.push(new THREE.Vector2(dataX, dataY));
            }

            var faceCount = geometry.faces.length;
            if (geometry.faceVertexUvs[uvInd] == undefined || geometry.faceVertexUvs[uvInd] == null)    {
                geometry.faceVertexUvs[uvInd] = [];
            }
            geometry.faceVertexUvs[uvInd].length = 0;
            for(var i = 0; i < faceCount; i++) {
                var currFace = geometry.faces[i];
                var faceUV = [allUVs[currFace.a], allUVs[currFace.b], allUVs[currFace.c]];
                geometry.faceVertexUvs[uvInd].push(faceUV);
            }
        }

        geometry.uvsNeedUpdate = true;
    }*/

    function getFloatDataAtIndex(dataBlock, index)  {
        var data = dataBlock.data[index];
        if (dataBlock.dataElementType == BDataElementType.FIXED_2_14)    {
            var powVal = 1 << 14;
            data = data / powVal;
        }
        else if (dataBlock.dataElementType == BDataElementType.FIXED_4_12)    {
            var powVal = 1 << 12;
            data = data / powVal;
        }
        else if (dataBlock.dataElementType == BDataElementType.FIXED_6_10)    {
            var powVal = 1 << 10;
            data = data / powVal;
        }
        else if (dataBlock.dataElementType == BDataElementType.FIXED_8_8)    {
            var powVal = 1 << 8;
            data = data / powVal;
        }
        else if (dataBlock.dataElementType == BDataElementType.FIXED_10_6)    {
            var powVal = 1 << 6;
            data = data / powVal;
        }

        return data;
    }

    function getStringFromInt8Array(int8Array)  {
        var string = '';
        var count = int8Array.length;
        for ( var index = 0; index < count; index ++ ) {
            string += String.fromCharCode(int8Array[index]);
        }

        return trimNull(string);
    }

    function trimNull(a) {
        var c = a.indexOf('\0');
        if (c>-1) {
            return a.substr(0, c);
        }
        return a;
    }
};
