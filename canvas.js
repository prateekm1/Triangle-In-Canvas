var canvas,
    context,
    dragging = false;
	let canvasImage;
	var triangleCount=0;
	var borderOffset = 5;
	var inCanvas = false;
	var color1;
	var xStart, yStart,xEnd, xTrack, yTrack,xPoint, yPoint, xDrag, yDrag, yEnd;
	var drawArray=[];
	var newColor = null;
	
	// array of colors to fill the triangle
	var colourArray = ['#001f3f', '#0074D9', '#7FDBFF', '#39CCCC', '#3D9970', '#2ECC40', '#01FF70', '#FFDC00', '#FF851B', '#FF4136','#00FFFF','#C0C0C0',
	'#0000FF',	'#808080',
	'#0000A0',	'#ADD8E6',		'#FFA500',
	'#800080',		'#A52A2A',
	'#FFFF00',		'#800000',
	'#00FF00',		'#008000',
	'#FF00FF'];
//window.addEventListener('load', init, false);

    canvas = document.querySelector('canvas');
    context = canvas.getContext('2d');
    canvas.height=window.innerHeight;
	canvas.width=window.innerWidth;


if (canvas.getContext)
{
	// adding event listener
    canvas.addEventListener('mousedown', dragStart);
    canvas.addEventListener('mouseup', dragStop);
	
	// double click to delete the triangle
    canvas.addEventListener('dblclick', dbclick);
}


function dragStart(event){
	inCanvas = true;
	
    xStart = event.clientX - canvas.offsetLeft - borderOffset;
    yStart = event.clientY - canvas.offsetTop - borderOffset;
	var p={x:xStart,y:yStart};
	
	var clickedTriangle = ptInTriangle(p);
	
	if(clickedTriangle.success)
	{
		 var triangle = drawArray.splice(clickedTriangle.index, 1);
		 
		 // calc center of the triangle
		 var center = { x : (triangle[0].p1.x + triangle[0].p2.x)/2, y : (triangle[0].p0.y + triangle[0].p1.y)/2 };

        // Calculate offset from center for dragging. This is done to fix the 'snapping' effect when dragging
        var offset = { x : p.x - center.x, y : p.y - center.y};
		 drawArray.push(triangle[0]);
         reRenderCanvas();
		
		// tracking the points of mouse
		canvas.onmousemove =(m)=>{
		
			dragging=true;
			xDrag = m.clientX - canvas.offsetLeft - borderOffset;
            yDrag = m.clientY - canvas.offsetTop - borderOffset;
            var position = { x: xDrag, y : yDrag };
			
			drawArray.pop();
            drag(triangle[0], position, offset);
			
		}
	}
	else {
		
		// to select a random color from array of colors
		 newColor = colourArray[Math.floor(Math.random() *colourArray.length)];
        
        // Init a point as a triangle and push it into array. This will eventually stretch out to a triangle on mouse move
        var liveTriangle = { p0:p, p1:p, p2:p,newColor};
		
        drawArray.push(liveTriangle);
        reRenderCanvas();

     // tracking the points of mouse
        canvas.onmousemove = (m) => {
            
            xTrack = m.clientX - canvas.offsetLeft - borderOffset;
            yTrack = m.clientY - canvas.offsetTop - borderOffset;
            var position = { x: xTrack, y : yTrack };

            drawArray.pop();
            livePreview(liveTriangle, position);
        }
    }
}

function dragStop(event){
	
	xEnd = event.clientX - canvas.offsetLeft - borderOffset;
    yEnd = event.clientY - canvas.offsetTop - borderOffset;
	if(inCanvas)
	{
		if(dragging)
		{
			dragging = false;
		}
		else
		{
			if(xStart!=xEnd && yStart!= yEnd)
			{
				drawArray.pop();
				reRenderCanvas();
				
				 // Calculate the three vertices of the equilateral triangle
                var p0 = { x : (xEnd+xStart)/2, y : yStart};
                var p1 = { x : xStart, y : yEnd};
                var p2 = { x : xEnd, y : yEnd};
				
                // using drawTriangle using above points
                drawTriangle(p0, p1, p2, newColor);
    
               
                var obj = { p0:p0, p1:p1, p2:p2 , colour :newColor };
				//pushing into array
                drawArray.push(obj);
			}
			else
			{
			}
			
		}
	}
	else{
		console.log("mouse outside canvas");
	}
	canvas.onmousemove = null;
    inCanvas = false;
}
function dbclick(event){
	xPoint = event.clientX - canvas.offsetLeft - borderOffset;
    yPoint = event.clientY - canvas.offsetTop - borderOffset;
    var p = { x : xPoint , y : yPoint };
	
	var clickedTriangle = ptInTriangle(p);
	if(clickedTriangle.success) {
        drawArray.splice(clickedTriangle.index, 1);
        reRenderCanvas();
    } else {
        
        console.log("No triangle found!");
    }
	
}

function drawTriangle(p0,p1,p2,colour) {
    context.beginPath();
    context.moveTo(p0.x, p0.y);
    context.lineTo(p1.x, p1.y);
    context.lineTo(p2.x, p2.y);
    context.closePath();
	
    context.fillStyle = colour;
    context.fill();
	
}

function drag(triangleObj, position,offset){
	
	var height = triangleObj.p0.y - triangleObj.p1.y;
    var width = triangleObj.p2.x - triangleObj.p1.x;
	
	//using mouse position to draw the triangle
	triangleObj.p0.x = position.x - offset.x;
	triangleObj.p0.y =position.y + height/2 - offset.y;
	triangleObj.p1.x = position.x - width/2 - offset.x;
    triangleObj.p1.y = position.y - height/2 - offset.y;
    triangleObj.p2.x = position.x + width/2 - offset.x;
    triangleObj.p2.y = position.y - height/2 - offset.y;
	
	drawArray.push(triangleObj);
    reRenderCanvas();
	
}
function livePreview(triangleObj,position)
{
	var p0 = { x : (position.x + xStart)/2, y : yStart};
    var p1 = { x : xStart, y : position.y};
    var p2 = { x : position.x, y : position.y};

    triangleObj.p0 = p0;
    triangleObj.p1 = p1;
    triangleObj.p2 = p2;

    // Push triangle into array and re-render the canvas
    drawArray.push(triangleObj);
    reRenderCanvas();
}
function clrscr()
{
	context.clearRect(0,0, canvas.width, canvas.height);
	
	drawArray.splice(0,drawArray.length);

    console.log("Cleared canvas!");
}

// Re-rendering the canvas
function reRenderCanvas() {
    console.log("Re-rendering canvas!");

    // Clearing the canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Looping through the array, draw the triangles in the correct order
    for(var i = 0; i < drawArray.length; i++) {
        drawTriangle(drawArray[i].p0, drawArray[i].p1, drawArray[i].p2,drawArray[i].colour);
    }
}

function ptInTriangle(p) {

    // Init success and index
    var success = false;
    var index = null;
    
    // Core logic for hit detection taken from https://stackoverflow.com/questions/2049582/how-to-determine-if-a-point-is-in-a-2d-triangle#comment22628102_2049712 
    for(var i = drawArray.length - 1; i >= 0; i--) {
        var A = 1/2 * (-drawArray[i].p1.y * drawArray[i].p2.x + drawArray[i].p0.y * (-drawArray[i].p1.x + drawArray[i].p2.x) + drawArray[i].p0.x * (drawArray[i].p1.y - drawArray[i].p2.y) + drawArray[i].p1.x * drawArray[i].p2.y);
        var sign = A < 0 ? -1 : 1;
        var s = (drawArray[i].p0.y * drawArray[i].p2.x - drawArray[i].p0.x * drawArray[i].p2.y + (drawArray[i].p2.y - drawArray[i].p0.y) * p.x + (drawArray[i].p0.x - drawArray[i].p2.x) * p.y) * sign;
        var t = (drawArray[i].p0.x * drawArray[i].p1.y - drawArray[i].p0.y * drawArray[i].p1.x + (drawArray[i].p0.y - drawArray[i].p1.y) * p.x + (drawArray[i].p1.x - drawArray[i].p0.x) * p.y) * sign;
        if(s > 0 && t > 0 && (s + t) < 2 * A * sign) {
            // If hit successful, set success to true, index to the index of the triangle hit and break the loop
            success = true;
            index = i;
            console.log("Hit detection successful!");
            break;
        }
    }
    return { success : success, index : index };
}