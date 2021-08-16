<template>
  <canvas id="glCanvas" ref="glCanvas"></canvas>
  <Hub :camera="camera"></Hub>
</template>

<script>
import Hub from '@/Main/Hub'
import { create3DContext } from '@/lib/webgl/common'
import { mat4, vec3 } from 'gl-matrix'
import { simpleFragment as fsSource, simpleVertex as vsSource } from '@/shaders'
import Model from '@/lib/model'
import Mesh from '@/lib/mesh'
import Texture from '@/lib/texture'
import Camera from '@/lib/camera'

export default
{
  name: 'Idle',

  components: {Hub},
  
  data ()
  {
    return {
      gl: null,
      shaderInfo: {},
      matProjection: mat4.create (),
      matView: mat4.create (),
      fCameraSpeed: 20.0,
      camera: new Camera (),
      bTranslateCamera: {
        up: false, right: false, down: false, 
        left: false, forward: false, back: false
      },
      fRotateCamera: {
        yawDelta: 0.0, pitchDelta: 0.0
      },
      bRotateCamera: false,
      fMouseSpeed: 3.0,
      models: [],
      animFrame: -1,
      bIsPaused: false,
    }
  },

  async mounted ()
  {
    if (await this.init (this.$refs.glCanvas))
    {
      onblur = this.pause.bind (this)
      onfocus = this.unpause.bind (this)
      onkeydown = this.keyDown.bind (this)
      onkeyup = this.keyUp.bind (this)
      window.addEventListener ('wheel', this.mouseMove.bind (this), {passive: false})

      this.start ()
    }
  },

  beforeUnmount ()
  {
    this.gl.getExtension ('WEBGL_lose_context').loseContext ()
  },

  methods: {
    async init (canvas)
    {
      // Create 3D Context
      try 
      {
        canvas.width = window.outerWidth
        canvas.height = window.outerHeight
        const gl = create3DContext (canvas, {antialias: true})
        this.gl = gl
      } catch (e)
      {
        return false
      }
      const { gl } = this
      if (gl === null)
      {
        return false
      }

      // Initialize Shader Program
      const vertexShader = this.loadShader (gl.VERTEX_SHADER, vsSource)
      const fragmentShader = this.loadShader (gl.FRAGMENT_SHADER, fsSource)

      // Create the shader program
      const shaderProgram = gl.createProgram ()
      gl.attachShader (shaderProgram, vertexShader)
      gl.attachShader (shaderProgram, fragmentShader)
      gl.linkProgram (shaderProgram)

      // If creating the shader program failed, alert
      if (!gl.getProgramParameter (shaderProgram, gl.LINK_STATUS))
      {
        alert ('Unable to initialize the shader program: ' + gl.getProgramInfoLog (shaderProgram))
        return false
      }

      this.shaderInfo = {
        shaderProgram,
        attribLocations: {  // per vertex
          vertexPosition: gl.getAttribLocation (shaderProgram, 'aVertexPosition'),
          vertexNormal: gl.getAttribLocation (shaderProgram, 'aVertexNormal'),
          textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
        },
        uniformLocations: {  // per object
          projectionMatrix: gl.getUniformLocation (shaderProgram, 'uProjectionMatrix'),
          viewMatrix: gl.getUniformLocation (shaderProgram, 'uViewMatrix'),
          modelViewMatrix: gl.getUniformLocation (shaderProgram, 'uModelViewMatrix'),
          normalMatrix: gl.getUniformLocation (shaderProgram, 'uNormalMatrix'),
          uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
        }
      }

      gl.useProgram (shaderProgram)

      let meshSphere = new Mesh ('sphere')
      if (!(await meshSphere.loadBuffersFromObjFile (gl, '@/meshes/stone-well.obj')))
      {
        return false
      }

      let texSphere = new Texture ('sphere')
      if (!(await texSphere.loadTextureFromFile (gl, '@/textures/Stone_well_Base_Color.png')))
      {
        return false
      }

      this.models.push (new Model (meshSphere, texSphere, null))
      this.models[0].moveTo (vec3.fromValues (0.0, 0.0, -17.0))
      this.models[0].setScale (vec3.fromValues (5.0, 5.0, 5.0))
      this.models[0].rotateX (45)
      this.models[0].rotateZ (-15)

      const fFov = 45 * Math.PI / 180   // in radians
      const fAspectRatio = gl.canvas.width / gl.canvas.height
      const fZNear = 0.01
      const fZFar = 1000.0
      mat4.perspective (this.matProjection, fFov, fAspectRatio, fZNear, fZFar)

      this.camera = new Camera ()
      // this.camera.moveTo (vec3.fromValues (8, 1, -13))
      // this.camera.rotate (-0.058, -0.15)

      // load projection matrix
      gl.uniformMatrix4fv(this.shaderInfo.uniformLocations.projectionMatrix, false, this.matProjection)
      gl.uniformMatrix4fv(this.shaderInfo.uniformLocations.viewMatrix, false, this.camera.getViewMatrix ())

      return true
    },

    // --------------------------------
    loadShader (type, source)
    {
      const { gl } = this
      const shader = gl.createShader (type)
      gl.shaderSource (shader, source)
      gl.compileShader (shader)
      if (!gl.getShaderParameter (shader, gl.COMPILE_STATUS))
      {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog (shader))
        gl.deleteShader (shader)
        return null
      }
      return shader
    },

    // --------------------------------
    start ()
    {
      const drawScene = this.drawScene.bind (this)
      const updateScene = this.updateScene.bind (this)
      let then = 0
      let accumulator = 0

      const self = this
      function render (now)
      {
        now *= 0.001
        let deltaTime
        if (then !== 0)
        {
          deltaTime = now - then
          accumulator += deltaTime
        }
        then = now

        while (accumulator > 1.0 / 62.0)
        {
          updateScene (deltaTime)
          accumulator -= 1.0 / 60.0
        }
        
        drawScene (deltaTime)

        if (!self.bIsPaused)
        {
          self.animFrame = requestAnimationFrame (render)
        }
      }

      self.animFrame = requestAnimationFrame (render)
    },

    // ----------------------------------
    pause ()
    {
      this.bIsPaused = true
      cancelAnimationFrame (this.animFrame)
    },

    // -----------------------------------
    unpause ()
    {
      if (this.bIsPaused)
      {
        this.bIsPaused = false
        this.start ()
      }
    },

    // --------------------------------
    drawScene (deltaTime) // eslint-disable-line no-unused-vars
    {
      const { gl } = this

      gl.clearColor (0.0, 0.0, 0, 1.0)
      gl.clearDepth (1.0)
      gl.enable (gl.DEPTH_TEST)
      gl.depthFunc (gl.LEQUAL)
      gl.clear (gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

      if (this.camera.bUpdated)
      {
        gl.uniformMatrix4fv(this.shaderInfo.uniformLocations.viewMatrix, false, this.camera.getViewMatrix ())
      }

      for (let i = 0; i < this.models.length; i++)
      {
        this.models[i].draw (gl, this.shaderInfo)
      }
    },

    // ------------------------------
    updateScene (deltaTime) // eslint-disable-line no-unused-vars
    {
      for (let i = 0; i < this.models.length; i++)
      {
        this.models[i].update ()
        this.models[i].rotateY (0.5, true)
      }

      const fMoveMagnitude = this.fCameraSpeed * deltaTime
      if (this.bTranslateCamera.up)
      {
        this.camera.moveUp (fMoveMagnitude)
      }
      if (this.bTranslateCamera.right)
      {
        this.camera.strafeRight (fMoveMagnitude)
      }
      if (this.bTranslateCamera.down)
      {
        this.camera.moveDown (fMoveMagnitude)
      }
      if (this.bTranslateCamera.left)
      {
        this.camera.strafeLeft (fMoveMagnitude)
      }
      if (this.bTranslateCamera.forward)
      {
        this.camera.moveForward (fMoveMagnitude)
      }
      if (this.bTranslateCamera.back)
      {
        this.camera.moveBackward (fMoveMagnitude)
      }
      
      if (this.bRotateCamera)
      {
        this.camera.rotate (this.fRotateCamera.pitchDelta * deltaTime,
                            this.fRotateCamera.yawDelta * deltaTime
        )
        this.bRotateCamera = false
      }
    },

    // ---------------------------------
    mouseMove (evt)
    {
      evt.preventDefault ()
      this.bRotateCamera = true
      this.fRotateCamera.yawDelta = (evt.wheelDeltaX * this.fMouseSpeed * Math.PI / 180.0) || 0.0
      this.fRotateCamera.pitchDelta = (evt.wheelDeltaY * this.fMouseSpeed * Math.PI / 180.0) || 0.0
    },

    // ---------------------------------
    keyDown (evt)
    {
      evt.preventDefault ()
      if (evt.keyCode === 65) // left
      {
        this.bTranslateCamera.left = true
      }
      else if (evt.keyCode === 32) // up
      {
        this.bTranslateCamera.up = true
      }
      else if (evt.keyCode === 68) // right
      {
        this.bTranslateCamera.right = true
      }
      else if (evt.keyCode === 67) // down
      {
        this.bTranslateCamera.down = true
      }
      else if (evt.keyCode === 87) // forward
      {
        this.bTranslateCamera.forward = true
      }
      else if (evt.keyCode === 83) // backward
      {
        this.bTranslateCamera.back = true
      }
    },

    // ---------------------------------
    keyUp (evt)
    {
      evt.preventDefault ()
      if (evt.keyCode === 65) // left
      {
        this.bTranslateCamera.left = false
      }
      else if (evt.keyCode === 32) // up
      {
        this.bTranslateCamera.up = false
      }
      else if (evt.keyCode === 68) // right
      {
        this.bTranslateCamera.right = false
      }
      else if (evt.keyCode === 67) // down
      {
        this.bTranslateCamera.down = false
      }
      else if (evt.keyCode === 87) // forward
      {
        this.bTranslateCamera.forward = false
      }
      else if (evt.keyCode === 83) // backward
      {
        this.bTranslateCamera.back = false
      }
    }
  }
}
</script>

<style>
body {
  font-family:'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif
}
</style>