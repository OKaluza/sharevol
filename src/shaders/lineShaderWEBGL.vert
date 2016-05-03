precision highp float;

attribute vec3 aVertexPosition;
attribute vec4 aVertexColour;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

uniform vec4 uColour;
uniform float uAlpha;

varying vec4 vColour;

void main(void)
{
  vec4 mvPosition = uMVMatrix * vec4(aVertexPosition, 1.0);
  gl_Position = uPMatrix * mvPosition;
  vec4 colour = aVertexColour;
  float alpha = 1.0;
  if (uColour.a > 0.01) colour = uColour;
  if (uAlpha > 0.01) alpha = uAlpha;
  vColour = vec4(colour.rgb, colour.a * alpha);
}

