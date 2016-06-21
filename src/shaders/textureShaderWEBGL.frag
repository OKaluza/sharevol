//Texture fragment shader
precision mediump float;
#define rgba vec4

//Palette lookup mu = [0,1]
#define gradient(mu) texture2D(palette, vec2(mu, 0.0))

//Uniform data
uniform sampler2D palette;
uniform sampler2D texture;

uniform int colourmap;
uniform float bright;
uniform float cont;
uniform float power;

uniform int axis;
uniform vec3 slice;
uniform ivec3 res;
uniform vec2 dim;

uniform ivec2 select;

//Current coordinate
varying vec2 vCoord;

void main()
{
  bool invert = false;
  vec2 coord;
  float z;

  if (int(gl_FragCoord.x) == select.x) invert = true;
  if (int(gl_FragCoord.y) == select.y) invert = true;

  if (axis==0)
  {
    //x-axis slice
    //slice offset coords from vCoord.x, inside coords from (slice,vCoord.y)
    z = vCoord.x * float(res.z);
    coord = vec2(clamp(slice.x, 0.0, 0.999), vCoord.y);
  }
  else if (axis==1)
  {
    //y-axis slice
    //slice offset coords from vCoord.y, inside coords from (vCoord.x,slice)
    z = vCoord.y * float(res.z);
    coord = vec2(vCoord.x, clamp(slice.y, 0.0, 0.999));
  }
  else if (axis==2)
  {
    //z-axis slice
    //slice offset coords from slice.z, inside coords unchanged (vCoord.xy)
    z = slice.z * float(res.z);
    coord = vCoord;
  }

  //Get offsets to selected slice
  float xy = z/dim.x;
  int row = int(xy);
  //mod() function doesn't work properly on safari, use fract() instead
  //int col = int(fract(xy) * dim.x);
  int col = int(fract(xy) * dim.x);
  coord += vec2(float(col), float(row));
  //Rescale to texture coords [0,1]
  coord /= dim;

  //Get texture value at coord and calculate final colour
  vec4 tex = texture2D(texture, coord);
  float lum = tex.r; //0.3 * tex.r + 0.59 * tex.g + 0.11 * tex.b;
  lum = pow(lum, power);
  vec4 pixelColor;
  if (colourmap == 1)
  {
    pixelColor = gradient(lum);
  }
  else
  {
    pixelColor = vec4(lum, lum, lum, 1.0);
  }
  pixelColor.rgb = ((pixelColor.rgb - 0.5) * max(cont, 0.0)) + 0.5;
  pixelColor.rgb += bright;
  if (invert)
  {
    pixelColor.rgb = vec3(1.0) - pixelColor.rgb;
    pixelColor.a = 1.0;
  }
  gl_FragColor = pixelColor;
}

