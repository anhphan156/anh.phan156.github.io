varying vec2 v_uv;
uniform float u_time;
uniform sampler2D u_buffer0;

void main(){

    if(floor(gl_FragCoord.xy) == vec2(0.0)){
        gl_FragColor = vec4(0.0);
    }else{
        vec3 buf0_col = texture2D(u_buffer0, v_uv).xyz;
        gl_FragColor = vec4(buf0_col, 1.0);
    }
}