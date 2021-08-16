import { isPowerOf2, createDeferredPromise } from '@/lib/webgl/utils'
import { loadImage } from '@/lib/filesystem'

export default class Texture
{
  name
  texture
  format
  sourceType
  bIsLoaded = false

  constructor (name, format, sourceType)
  {
    this.name = name
    this.format = format
    this.sourceType = sourceType
  }

  async loadTextureFromFile (gl, imgFile)
  {
    const self = this
    const { promise, resolve } = createDeferredPromise ()

    const image = new Image ()
    loadImage(imgFile, image, function ()
    {
      self.texture = gl.createTexture()
      gl.bindTexture (gl.TEXTURE_2D, self.texture)
      gl.texImage2D (gl.TEXTURE_2D, 
                     0, // level,
                     this.format || gl.RGBA, // internalFormat,
                     this.format || gl.RGBA, // sourceFormat,
                     this.sourceType || gl.UNSIGNED_BYTE, // srcType,
                     image
      )
      if (isPowerOf2 (image.width) && isPowerOf2 (image.height))
      {
        // Yes, it's a power of 2. Generate mips.
        gl.generateMipmap (gl.TEXTURE_2D)
        gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
      } 
      else
      {
        // No, it's not a power of 2. Turn off mips and set
        // wrapping to clamp to edge
        gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      }
      self.bIsLoaded = true
      resolve (true)
    })

    return promise
  }

  draw (gl, shaderInfo)
  {
    if (!this.bIsLoaded)
    {
      return
    }

    // Tell WebGL we want to affect texture unit 0
    gl.activeTexture(gl.TEXTURE0);

    // Bind the texture to texture unit 0
    gl.bindTexture(gl.TEXTURE_2D, this.texture);

    // Tell the shader we bound the texture to texture unit 0
    gl.uniform1i(shaderInfo.uniformLocations.uSampler, 0);
  }
}