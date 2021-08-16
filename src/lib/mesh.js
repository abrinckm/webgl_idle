import { readLine } from '@/lib/filesystem'
import { createDeferredPromise } from '@/lib/webgl/utils'

export default class Mesh
{
  vertexBuffer
  normalBuffer
  uvCoordBuffer
  indexBuffer
  fVertexCount
  bIsLoaded
  sObjFile

  constructor (name)
  {
    this.name = name
    this.bIsLoaded = false
  }

  // ----------------------------------------
  async loadBuffersFromObjFile (gl, filePath)
  {
    this.sObjFile = filePath
    
    const { promise, resolve } = createDeferredPromise ()

    let objData = {
      v: [], vt: [], vn: []
    }

    let vertices = []
    let uvCoords = []
    let normals = []
    let indices = []
    let index = 0

    const self = this
    readLine (filePath, (line, err) => {
      if (err)
      {
        resolve (false)
      } 
      else if (line === undefined)
      {
        self.vertexBuffer = gl.createBuffer ()
        self.indexBuffer = gl.createBuffer ()
        self.normalBuffer = gl.createBuffer ()
        self.uvCoordBuffer = gl.createBuffer ();
        self.vertexCount = indices.length
    
        gl.bindBuffer (gl.ARRAY_BUFFER, self.vertexBuffer)
        gl.bufferData (gl.ARRAY_BUFFER,
                      new Float32Array (vertices),
                      gl.STATIC_DRAW
        )

        gl.bindBuffer (gl.ARRAY_BUFFER, self.uvCoordBuffer)
        gl.bufferData (gl.ARRAY_BUFFER, 
                       new Float32Array (uvCoords),
                       gl.STATIC_DRAW
        )
    
        gl.bindBuffer (gl.ARRAY_BUFFER, self.normalBuffer)
        gl.bufferData (gl.ARRAY_BUFFER,
                      new Float32Array (normals),
                      gl.STATIC_DRAW
        )
    
        gl.bindBuffer (gl.ELEMENT_ARRAY_BUFFER, self.indexBuffer)
        gl.bufferData (gl.ELEMENT_ARRAY_BUFFER,
                      new Uint16Array (indices), gl.STATIC_DRAW
        )
       
        self.bIsLoaded = true

        resolve (true)
      }
      else
      {
        line = line.trim ().split (/\s/)
        let type = line.shift ()
        if (type === 'v' || type === 'vn')
        {
          while (line.length)
          {
            objData[type].push (parseFloat(line.shift ()))
          }
        }
        else if (type === 'vt')
        {
          while (line.length)
          {
            objData[type].push (parseFloat(line.shift ()))
          }
        }
        else if (type === 'f')
        {
          while (line.length)
          {
            let [v, uv, n] = line.shift ().split ('/')
            indices.push (index++)
            v = (parseInt (v) - 1) * 3
            n = (parseInt (n) - 1) * 3
            uv = (parseInt (uv) - 1) * 2
            vertices.push (...objData.v.slice (v, v + 3))
            normals.push (...objData.vn.slice (n, n + 3))
            uvCoords.push ((objData.vt[uv]), objData.vt[uv+1]) // (uv, uv + 2))
          }
        }
      }
    })

    return promise
  }

  draw (gl, shaderInfo)
  {
    if (!this.bIsLoaded)
    {
      return
    }

    {
      gl.bindBuffer (gl.ARRAY_BUFFER, this.vertexBuffer)
      gl.vertexAttribPointer (shaderInfo.attribLocations.vertexPosition,
                              3,        // numComponents
                              gl.FLOAT, // type
                              false,    // normalize
                              0,        // stride
                              0         // offset
      )
      gl.enableVertexAttribArray (shaderInfo.attribLocations.vertexPosition)
    }

    {
      gl.bindBuffer (gl.ARRAY_BUFFER, this.normalBuffer)
      gl.vertexAttribPointer (shaderInfo.attribLocations.vertexNormal, 3, gl.FLOAT, false, 0, 0)
      gl.enableVertexAttribArray (shaderInfo.attribLocations.vertexNormal)
    }

    {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.uvCoordBuffer)
      gl.vertexAttribPointer(shaderInfo.attribLocations.textureCoord, 2, gl.FLOAT, false, 0, 0)
      gl.enableVertexAttribArray(shaderInfo.attribLocations.textureCoord)
    }

    gl.bindBuffer (gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer)

    {
      const offset = 0
      gl.drawElements (gl.TRIANGLES, this.vertexCount, gl.UNSIGNED_SHORT, offset)
    }
  }
}