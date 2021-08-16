import { vec3, mat4 } from 'gl-matrix'

const PERIGON_DEG = 360
const PERIGON_RAD = PERIGON_DEG * Math.PI / 180.0
const MAX_ABS_PITCH_RAD = PERIGON_RAD / 4
const FORWARD_VECTOR = vec3.fromValues (0.0, 0.0, -1.0)
const ORIGIN = vec3.create ()

export default class Camera
{
  fPitch = 0.0
  fYaw = 0.0

  matView = mat4.create ()

  v3Position = vec3.create ()

  transform = {
    up: vec3.fromValues (0.0, 1.0, 0.0),
    right: vec3.fromValues (1.0, 0.0, 0.0),
    forward: vec3.fromValues (0.0, 0.0, -1.0)
  }

  bUpdated = true

  constructor ()
  {
  }

  getViewMatrix ()
  {
    if (this.bUpdated)
    {
      this.bUpdated = false
      return mat4.lookAt (this.matView, 
                          this.v3Position, 
                          vec3.add (vec3.create (), 
                                    this.transform.forward, 
                                    this.v3Position), 
                          this.transform.up
      )
    }
    return this.matView
  }

  rotate (pitchDelta, yawDelta)
  {
    if (pitchDelta)
    {
      const newPitch = this.fPitch + pitchDelta
      if (Math.abs(newPitch) <= MAX_ABS_PITCH_RAD)
      {
        this.fPitch = newPitch 
      }
    }

    if (yawDelta)
    {
      this.fYaw += yawDelta
      this.fYaw %= PERIGON_RAD
    }

    const { up, forward, right } = this.transform
    vec3.rotateY (forward, 
                  vec3.rotateX (vec3.create (), 
                                FORWARD_VECTOR, 
                                ORIGIN, 
                                this.fPitch), 
                  ORIGIN, 
                  this.fYaw
    )
    vec3.normalize (right, vec3.cross (vec3.create (), up, forward))

    this.bUpdated = true
  }

  moveTo (position)
  {
    this.v3Position = vec3.clone (position)
    this.bUpdated = true
  }

  move (vector)
  {
    this.v3Position = vec3.add (vec3.create (),
                                this.v3Position,
                                vector
    )

    this.bUpdated = true
  }

  moveForward (magnitude)
  {
    this.move (vec3.scale (vec3.create (), this.transform.forward, magnitude))
  }

  moveBackward (magnitude)
  {
    this.move (vec3.scale (vec3.create (), this.transform.forward, -magnitude))
  }

  strafeRight (magnitude)
  {
    this.move (vec3.scale (vec3.create (), this.transform.right, -magnitude))
  }

  strafeLeft (magnitude)
  {
    this.move (vec3.scale (vec3.create (), this.transform.right, magnitude))
  }

  moveUp (magnitude)
  {
    this.move (vec3.scale (vec3.create (), this.transform.up, magnitude))
  }

  moveDown (magnitude)
  {
    this.move (vec3.scale (vec3.create (), this.transform.up, -magnitude))
  }
}