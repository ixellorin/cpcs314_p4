We are using 3 grace days.

Brando Guevarra 54223152 K5o0b
Cio Ellorin	33901125 m5m8

What: We have created a maze game that can be controlled in first person or overhead by tilting the maze. You can also create your own maze by adding
      or removing walls from the existing maze.	
 1. Collision between the ball and other objects are detected and resolved by moving the ball away from the object. 
    Collision is detected by checking whether or not the ball's position is within the volume of the object. It 
    checks an area surrounding the ball for any objects that might collide with the ball.

 2. Particle System is used when the ball reaches the goal to show an end screen. The particles move around the screen
    randomly in the direction of the mouse pointer. Sprites are used as points on the screen that are randomly coloured 
    and have random movement.

 3. Shader for the spikes are using Cook-Torrance shader.

How: For the creation of the maze a 2d array is used as the field for the walls. Starting with an array with a wall in every cell a path
     is carved out using randomized Prim's alogirthm to generate paths that are reachable from any point in the path. When rendering the
     scene a wall object is added to the cell position if it is not part of the maze path. In 1st person mode the camera is set to the ball's
     position and made to look at a point outside the maze that is controlled by the mouse horizontally. Movement is done by giving the ball a
     velocity depending on the key pressed and translating the camera by that amount. When the ball's position in within the goal's position the 
     game is complete. In overhead mode by tilting the floor the ball will have a velocity in relation to the amount of tilt. In edit mode picking 
     is used to select a wall and translate it down if it is above the floor or up if it is below the floor.
     

Howto:  There are three modes available 1st person, overhead, and edit mode. After clicking on start you can change between modes with 1, 2, 
	and 3 respectively. In 1st person mode you can move forwards with w, backwards with s, and strafe left and right with a and d. While 
	holding the right click of the mouse you can look around horizontally and there is also the option to remove a wall by picking it with 
	the mouse and left clicking at the expense of score. In overhead mode while holding left click move the mouse in the direction you want 
	to tilt and hold shift to restrict in side-to-side or hold ctrl to restrict forwards-backwards. In edit mode pick a square with the mouse
	and left click to add or remove a wall.

Sources:

By submitting this file, we hereby declare that our team of two worked individually on this assignment
and wrote all of this code.  We have listed all external resoures (web pages, books) used below.  We have
listed all people with whom I/we have had significant discussions about the project below.

https://github.com/mrdoob/three.js/blob/master/examples/webgl_geometry_shapes.html
https://en.wikipedia.org/wiki/Maze_generation_algorithm
http://www.ibm.com/developerworks/library/wa-build2dphysicsengine/
http://barkofthebyte.azurewebsites.net/post/2014/05/05/three-js-projecting-mouse-clicks-to-a-3d-scene-how-to-do-it-and-how-it-works
http://stemkoski.github.io/Three.js/Particles.html