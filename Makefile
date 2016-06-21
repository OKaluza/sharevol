#Requires google closure compiler
VERSION = 0.1
#COMP = java -jar compiler-latest/compiler.jar --jscomp_warning internetExplorerChecks --js=
#FLAGS = --js_output_file=
COMP = cp 
FLAGS = 

#Sources
SCRIPTS = src/main.js src/slicer.js src/volume.js 
LIBS = lib/gl-matrix-min.js lib/dat.gui.min.js lib/OK-min.js lib/sharevol-min.js

all: sharevol.js
	#Build the shaders into release index.html
	sed -e "/Volume vertex shader/    r src/shaders/volumeShaderWEBGL.vert" \
      -e "/Volume fragment shader/  r src/shaders/volumeShaderWEBGL.frag" \
      -e "/Texture vertex shader/   r src/shaders/textureShaderWEBGL.vert"   \
      -e "/Texture fragment shader/ r src/shaders/textureShaderWEBGL.frag"   \
      -e "/Line vertex shader/      r src/shaders/lineShaderWEBGL.vert"       \
      -e "/Line fragment shader/    r src/shaders/lineShaderWEBGL.frag" < src/index.html > index.html

.PHONY : clean
clean:
	-rm lib/*min.js
	-rm sharevol.js

sharevol.js: $(LIBS)
	#Combine into final bundle
	cat $(LIBS) > sharevol.js

lib/sharevol-min.js: $(SCRIPTS)
	cat $(SCRIPTS) > lib/sharevol-all.js
	$(COMP)lib/sharevol-all.js $(FLAGS)lib/sharevol-min.js

lib/OK-min.js: lib/OK.js
	$(COMP)lib/OK.js $(FLAGS)lib/OK-min.js

lib/gl-matrix-min.js: lib/gl-matrix.js
	$(COMP)lib/gl-matrix.js $(FLAGS)lib/gl-matrix-min.js

lib/dat.gui.min.js: lib/gl-matrix.js
	$(COMP)lib/dat.gui.js $(FLAGS)lib/dat.gui.min.js
