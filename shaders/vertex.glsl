varying vec2 v_uv;

void main(){
    vec4 local_position = vec4(position, 1.0);
    v_uv = uv;

    gl_Position = projectionMatrix * modelViewMatrix * local_position;
}