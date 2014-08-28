ShareVol
========
Lightweight volume viewer in WebGL http://okaluza.github.io/sharevol

Copyright (c) 2014, Monash University. All rights reserved.  
Author: Owen Kaluza - owen.kaluza ( at ) monash.edu

Licensed under the GNU Lesser General Public License
https://www.gnu.org/licenses/lgpl.html  
(If this doesn't suit your usage requirements, please contact - I'm open to releasing under other licenses)

Now WebGL is well supported I wanted a tool to show some volume data with emphasis on simplicity, loading speed and high-quality rendering. Looking around, XTK and VolumeRC are the contenders, both seem to be part of larger projects which didn't suit my needs. 

I hope this code can become an easy to understand and lightweight base for sharing volume data on the web or developing volume rendering based tools. The aim is to keep this a small and manageable project and avoid turning it into a full featured rendering library.

How to use it:
--------------
The core files are

- **index.html**  (main html page including shaders)  
- **sharevol.js** (minified javascript code including library dependencies)

The default action after loading is to attempt to read a parameter file ("default.json" if not otherwise specified).  
This should contain a reference to the image data url for the data to visualise and other vis settings.  

An example data set is provided in the file "data.jpg"  
(256x256x256, 1:1:1 converted to tiled 2d image)  
Courtesy of http://volvis.org/ Rotational C-arm x-ray scan of a human foot. Tissue and bone are present in the dataset, by Philips Research, Hamburg, Germany. 

Other parameter files can be specified by passing a url with the *data* parameter, eg: *index.html?data=myparams.json* (TODO: specify other URL options)

The simplest way to view your own data set is fork this project and edit/replace "data.jpg" and "default.json".  
(If you merge changes into the gh-pages branch, your data should then be viewable at http://username.github.io/sharevol)

TODO: describe parameters in json config.  

- To enable the volume renderer, ensure the property "volume" exists.  
- To enable the slice viewer, ensure the property "slicer" exists.  

TODO: Describe UI options and features.

Acknowlegements:
----------------

The starting point of this code was Philip Rideout's excellent public domain tutorial on single pass raycasting...  
http://prideout.net/blog/?p=64

I applied the concept of using 2D texture atlases from Vicomtech's work http://volumerc.org/demos/volren/ as WebGL doesn't support 3D textures.

I also found these articles useful:  
http://sizecoding.blogspot.com.au/2008/08/isosurfaces-in-glsl.html  
http://graphicsrunner.blogspot.com.au/2009/01/volume-rendering-101.html

Dependencies:
-------------
DAT.GUI https://github.com/dataarts/dat.gui (Apache licensed)  
glMatrix: http://glmatrix.net/  
OK.js (my simple utility library)  

Copies of all dependencies are provided, build minifies and combines all into sharevol.js.

Other projects of interest:
---------------------------

https://github.com/xtk/X  
https://github.com/VolumeRC  

VolumeRC provides some conversion scripts are particularly useful for creating tiled images compatible with sharevol from various data formats:
https://github.com/VolumeRC/AtlasConversionScripts

XTK seems to contain lots of conversion and loading goodies that might be of use if you want to get this code to load data sets in other formats.

Tri-cubic filtering:
--------------------
The optional tri-cubic filtering was ripped from Danny Ruijters
http://www.dannyruijters.nl/cubicinterpolation/

Please cite their paper if you use the tricubic interpolation feature in any published work.
See: http://www.dannyruijters.nl/cubicinterpolation/license.txt

(If you don't wish to use it, just delete the interpolate_tricubic_fast() function from index.html)

