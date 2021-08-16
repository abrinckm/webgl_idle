// Vertex shader program

const vsSource = `
attribute vec4 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uNormalMatrix;

varying highp vec4 Normal;
varying highp vec2 vTextureCoord;

void main() {
  gl_Position = (uProjectionMatrix) * uViewMatrix * uModelViewMatrix * aVertexPosition;
  Normal = uNormalMatrix * vec4(aVertexNormal, 1.0);
  vTextureCoord = vec2 (aTextureCoord.s, 1.0 - aTextureCoord.t);
}
`

export default vsSource
