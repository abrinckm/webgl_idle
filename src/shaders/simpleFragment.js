const fsSource = `
varying highp vec2 vTextureCoord;
varying highp vec4 Normal;

uniform sampler2D uSampler;

void main() {
  highp vec3 directionalLightColor = vec3(5.85, 5.85, 5.85);
  highp vec3 directionalPos = vec3(-5.0, 5.0, 5.0);
  highp vec3 directionalVector = normalize(directionalPos - Normal.xyz);
  highp float directional = max(dot(Normal.xyz, directionalVector), 0.0);
  highp vec3 vLighting = (directionalLightColor * directional);
  highp vec3 ambientLight = vec3(0.05, 0.05, 0.05);
  highp vec4 fragColor = texture2D(uSampler, vTextureCoord);
  gl_FragColor = vec4(fragColor.rgb * (vLighting + ambientLight), fragColor.a);
}
`

export default fsSource