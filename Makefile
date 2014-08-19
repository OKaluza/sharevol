#Requires google closure compiler
VERSION = 0.1
COMP = java -jar compiler-latest/compiler.jar --jscomp_warning internetExplorerChecks --js=
FLAGS = --js_output_file=
#COMP = cp 
#FLAGS = 

#Sources
SCRIPTS = src/main.js src/slicer.js src/volume.js src/tools.js 
LIBS = lib/sharevol-min.js lib/OK-min.js lib/gl-matrix-min.js lib/dat.gui.min.js

all: sharevol.js

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
