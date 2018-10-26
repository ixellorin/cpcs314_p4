varying vec3 interpolatedNormal;
varying vec3 interpolatedPosition;

void main() {
    interpolatedNormal = normalMatrix * normal;
		interpolatedPosition = vec3(modelViewMatrix * vec4(position, 1.0));
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
