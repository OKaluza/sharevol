//A simple vertex shader for 2d image processing
//Pass the vertex coords to fragment shader in vCoord
precision highp float;
attribute vec3 aVertexPosition;
uniform mat4 uMVMatrix;
varying vec2 vCoord;
void main(void) {
  gl_Position = vec4(aVertexPosition, 1.0);
  //Apply translation, rotation & scaling matrix to vertices to get coords
  vec4 coords = uMVMatrix * vec4(aVertexPosition.xy, 0.0, 1.0);
  vCoord = coords.xy;
}

