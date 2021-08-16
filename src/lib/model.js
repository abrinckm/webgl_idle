import { mat4, vec3, quat } from 'gl-matrix'

export default class Model
{
  mesh
  texture
  material
  transform = {
    up: vec3.fromValues (0, 1, 0),
    right: vec3.fromValues (1, 0, 0),
    forward: vec3.fromValues (0, 0, -1)
  }

  bUpdated = false
  
  qRotation = quat.create ()
  
  v3Rotation = vec3.create ()
  v3Location = vec3.create ()
  v3Scale = vec3.fromValues (1.0, 1.0, 1.0)

  matModelView = mat4.create ()
  matNormal = mat4.create ()
  matRotation = mat4.create ()
  matTranslation = mat4.create ()
  matScale = mat4.create ()

  constructor (mesh, texture, material)
  {
    this.mesh = mesh
    this.texture = texture
    this.material = material
  }

  rotate (deg, axis, local=false)
  {
    const qRotation = quat.setAxisAngle (quat.create (), axis, deg * Math.PI / 180.0)
    if (!local)
    {
      vec3.transformQuat (this.transform.up, this.transform.up, this.qRotation)
      vec3.transformQuat (this.transform.right, this.transform.right, qRotation)
      vec3.transformQuat (this.transform.forward, this.transform.forward, qRotation)
    }
    quat.multiply (this.qRotation, this.qRotation, qRotation)
    mat4.fromQuat (this.matRotation, this.qRotation)
    this.bUpdated = true
  }

  rotateX (deg, local=false)
  {
    this.rotate (deg, vec3.fromValues (1, 0, 0), local)
  }

  rotateY (deg, local=false)
  {
    this.rotate (deg, vec3.fromValues (0, 1, 0), local)
  }

  rotateZ (deg, local=false)
  {
    this.rotate (deg, vec3.fromValues (0, 0, 1), local)
  }

  moveTo (location)
  {
    this.v3Location = vec3.clone (location)
    mat4.fromTranslation (this.matTranslation, this.v3Location)
    this.bUpdated = true
  }

  move (vector)
  {
    this.v3Location = vec3.add (vec3.create (), this.v3Location, vector)
    mat4.fromTranslation (this.matTranslation, this.v3Location)
    this.bUpdated = true
  }

  setScale (scale)
  {
    this.v3Scale = vec3.clone (scale)
    mat4.fromScaling (this.matScale, scale)
    this.bUpdated = true
  }

  update ()
  {
    if (this.bUpdated)
    {
      mat4.multiply (this.matModelView, this.matTranslation, mat4.multiply (mat4.create (), this.matRotation, this.matScale))
      mat4.transpose (this.matNormal, mat4.invert (this.matNormal, this.matModelView))
      this.bUpdated = false
    }
  }

  draw (gl, shaderInfo)
  {
    gl.uniformMatrix4fv (shaderInfo.uniformLocations.modelViewMatrix, false, this.matModelView)
    gl.uniformMatrix4fv (shaderInfo.uniformLocations.normalMatrix, false, this.matNormal)

    this.texture.draw (gl, shaderInfo)
    this.mesh.draw (gl, shaderInfo)
  }
}