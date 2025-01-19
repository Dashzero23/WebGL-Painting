// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
/*Nguyen Vu 
npvu@ucsc.edu*/
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'uniform float u_Size;\n' +
  'void main() {\n' +
  '  gl_Position = a_Position;\n' +
  '  gl_PointSize = u_Size;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform vec4 u_FragColor;\n' +  // uniform変数
  'void main() {\n' +
  '  gl_FragColor = u_FragColor;\n' +
  '}\n';

// Global variable
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;

function setupWebGL()
{
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});

    if (!gl) {
      console.log('Failed to get the rendering context for WebGL');
      return;
    }
}

function connectVariablesToGLSL()
{
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
   if (!u_Size) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }
}

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// UI global
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_segmentCount = 10;
function addActionsForHtmlUI()
{
  // Buttons
  document.getElementById('red').onclick = function() { g_selectedColor = [1.0, 0.0, 0.0, 1.0]; }
  document.getElementById('green').onclick = function() { g_selectedColor = [0.0, 1.0, 0.0, 1.0]; }
  document.getElementById('red').onclick = function() { g_selectedColor = [0.0, 0.0, 1.0, 1.0]; }

  document.getElementById('clearButton').onclick = function() { g_shapesList = []; renderAllShapes();}

  document.getElementById('pointButton').onclick = function() { g_selectedType = POINT;}
  document.getElementById('triButton').onclick = function() { g_selectedType = TRIANGLE;}
  document.getElementById('circleButton').onclick = function() { g_selectedType = CIRCLE;}
  document.getElementById('redrawButton').onclick = recreateDrawing;


  // Sliders
  document.getElementById('redSlide').addEventListener('mouseup', function() { g_selectedColor[0] = this.value/100; });
  document.getElementById('greenSlide').addEventListener('mouseup', function() { g_selectedColor[1] = this.value/100; });
  document.getElementById('blueSlide').addEventListener('mouseup', function() { g_selectedColor[2] = this.value/100; });
  document.getElementById('alphaSlide').addEventListener('mouseup', function() { g_selectedColor[3] = this.value/100; });

  document.getElementById('sizeSlide').addEventListener('mouseup', function() { g_selectedSize = this.value; });
  document.getElementById('segmentCount').addEventListener('mouseup', function() { g_segmentCount = this.value; });
}

function main() {
  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHtmlUI();
  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  canvas.onmousemove = function(ev) { if (ev.buttons == 1) {click(ev)} };
  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_shapesList = [];
/*
var g_points = [];  // The array for the position of a mouse press
var g_colors = [];  // The array to store the color of a point
var g_sizes = [];
*/

function click(ev) {
  let [x, y] = convertCoordinatesEventToGL(ev);

  let point;
  if (g_selectedType == POINT)
  {
    point = new Point();
  }

  else if (g_selectedType == TRIANGLE)
  {
    point = new Triangle();
  }

  else
  {
    point = new Circle();
    point.segments = g_segmentCount;
  }

  point.position = [x,y];
  point.color = g_selectedColor.slice();
  point.size = g_selectedSize;

  g_shapesList.push(point);

  renderAllShapes();
}

function convertCoordinatesEventToGL(ev)
{
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect() ;

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return [x,y];
}

function renderAllShapes()
{
  var startTime = performance.now();
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  var len = g_shapesList.length;
  
  for(var i = 0; i < len; i++) {
    g_shapesList[i].render();
  }
  
  var duration = performance.now() - startTime;
  sendTextToHTML("numdot: " + len + " ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration), "numdot");
}

function sendTextToHTML(text, htmlID)
{
  var htmlElm = document.getElementById(htmlID);

  if (!htmlElm)
  {
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }

  htmlElm.innerHTML = text;
}

function recreateDrawing() {
  const triangles = [
    // Base
    { vertices: [-0.7, -0.6, -0.7, -0.8, 0.7, -0.8], color: [0.5, 0.5, 0.5, g_selectedColor[3]] },
    { vertices: [-0.7, -0.6, 0.7, -0.8, 0.7, -0.6], color: [0.5, 0.5, 0.5, g_selectedColor[3]] },

    // House
    { vertices: [-0.5, -0.6, -0.1, -0.6, -0.1, -0.2], color: [0.0, 0.0, 1.0, g_selectedColor[3]] },
    { vertices: [-0.5, -0.6, -0.1, -0.2, -0.5, -0.2], color: [0.0, 0.0, 1.0, g_selectedColor[3]] },

    // Roof (red)
    { vertices: [-0.6, -0.2, -0.3, 0.0, 0.0, -0.2], color: [0.8, 0.0, 0.0, g_selectedColor[3]] },

    // Chimney (red)
    { vertices: [-0.45, -0.2, -0.35, 0.0, -0.45, 0.1], color: [0.8, 0.0, 0.0, g_selectedColor[3]] },
    { vertices: [-0.35, -0.2, -0.35, 0.1, -0.45, 0.1], color: [0.8, 0.0, 0.0, g_selectedColor[3]] },

    // Tree trunk
    { vertices: [0.2, -0.6, 0.4, -0.6, 0.2, -0.2], color: [0.5, 0.25, 0.0, g_selectedColor[3]] },
    { vertices: [0.4, -0.6, 0.4, -0.2, 0.2, -0.2], color: [0.5, 0.25, 0.0, g_selectedColor[3]] },
    { vertices: [0.2, -0.3, 0.2, -0.4, 0.1, -0.3], color: [0.5, 0.25, 0.0, g_selectedColor[3]] },
    { vertices: [0.4, -0.3, 0.4, -0.4, 0.5, -0.3], color: [0.5, 0.25, 0.0, g_selectedColor[3]] },

    // Tree leaves
    { vertices: [0.2, -0.2, 0.3, 0.0, 0.3, -0.2], color: [0.0, 0.5, 0.0, g_selectedColor[3]] },
    { vertices: [0.2, -0.2, 0.1, 0.0, 0.3, 0.0], color: [0.0, 0.5, 0.0, g_selectedColor[3]] },
    { vertices: [0.3, 0.0, 0.1, 0.0, 0.3, 0.2], color: [0.0, 0.5, 0.0, g_selectedColor[3]] },
    { vertices: [0.4, -0.2, 0.3, 0.0, 0.3, -0.2], color: [0.0, 0.5, 0.0, g_selectedColor[3]] },
    { vertices: [0.4, -0.2, 0.3, 0.0, 0.5, 0.0], color: [0.0, 0.5, 0.0, g_selectedColor[3]] },
    { vertices: [0.3, 0.0, 0.5, 0.0, 0.3, 0.2], color: [0.0, 0.5, 0.0, g_selectedColor[3]] },

    { vertices: [0.3, 0.2, 0.5, 0.0, 0.4, 0.3], color: [0.0, 0.5, 0.0, g_selectedColor[3]] },
    { vertices: [0.4, 0.3, 0.5, 0.0, 0.6, 0.2], color: [0.0, 0.5, 0.0, g_selectedColor[3]] },
    { vertices: [0.3, 0.2, 0.4, 0.3, 0.2, 0.4], color: [0.0, 0.5, 0.0, g_selectedColor[3]] },
  ];

  // Add triangles to the shape list
  triangles.forEach(({ vertices, color }) => {
    const triangle = new Triangle();
    triangle.position = [0, 0]; // Position handled by vertices
    triangle.color = color;
    triangle.size = 0; // Size not needed for this method
    triangle.render = function () {
      gl.uniform4f(u_FragColor, color[0], color[1], color[2], color[3]);
      drawTriangle(vertices);
    };
    g_shapesList.push(triangle);
  });

  renderAllShapes();
}
