varying vec2 v_uv;
uniform float u_time;
uniform vec2 u_resolution;
uniform sampler2D u_buffer0;
uniform int u_frame;

const float O = 10.0;
const float P = 28.0;
const float B = 8.0 / 3.0;
vec3 integrator(vec3 p, float dt){
    vec3 dp = vec3(
        O * (p.y - p.x),
        p.x * (P - p.z) - p.y,
        p.x * p.y - B * p.z
    );

    return p + dp * dt;
}

float line_sdf(vec2 p, vec2 a, vec2 b){
    vec2 ba = b - a;
    vec2 pa = p - a;
    float h = clamp(dot(ba, pa) / dot(ba, ba), 0.0, 1.0);

    return length(pa - ba * h);
}

void main(){
    vec2 uv = v_uv - .5;
    uv.x *= u_resolution.x / u_resolution.y;
    uv -= vec2(.3, -.5);
    uv *= 50.0;

    float d = 1000.0;

    vec3 last = texture2D(u_buffer0, vec2(0.0)).xyz;
    vec3 next = vec3(0.0);

    for(float i = 0.0; i < 1.0; i += .01){
        next = integrator(last, .016 * .2);
        d = min(d, line_sdf(uv, last.xz, next.xz));
        last = next;
    }

    if(floor(gl_FragCoord.xy) == vec2(0.0)){
        if(u_frame == 0){
            // start position
            gl_FragColor = vec4(.1, .001, .0, .0);
        }else{
            gl_FragColor = vec4(next, 0.0);
        }
    }else{
        vec3 b0 = texture2D(u_buffer0, v_uv).xyz * .98;
        vec3 col = mix(vec3(1.0), b0, smoothstep(0.0, .2, d));
        gl_FragColor = vec4(col, 1.0);
    }

}