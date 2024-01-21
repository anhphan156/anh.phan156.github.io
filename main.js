import * as THREE from 'three';

class Buffer{
    async BufferInit(fragment_shader, more_uniforms = {}){
        const vsh = await fetch('./shaders/vertex.glsl');
        const fsh = await fetch(fragment_shader);

        this.material = new THREE.ShaderMaterial({
            uniforms: {
                u_time: {value: 0.0},
                u_frame: {value: 0},
                u_resolution: {value: new THREE.Vector2(window.innerWidth, window.innerHeight)},
                ...more_uniforms
            },
            vertexShader: await vsh.text(),
            fragmentShader: await fsh.text()
        });

        const geometry = new THREE.PlaneGeometry(1, 1);
        const plane = new THREE.Mesh(geometry, this.material);
        plane.position.set(0.5, 0.5, 0);

        this.scene = new THREE.Scene();
        this.scene.add(plane);
    }
}
class App {
    constructor(){}

    async init(){
        this.threejs = new THREE.WebGLRenderer();
        document.getElementById("one").appendChild(this.threejs.domElement);
        window.addEventListener('resize', () => this.onResize(), false);
        this.onResize();

        this.camera = new THREE.OrthographicCamera(0, 1, 1, 0, 0.1, 1000);
        this.camera.position.set(0, 0, 1);

        this.readBuffer = new THREE.WebGLRenderTarget(
            window.innerWidth,
            window.innerHeight,
            {
                minFilter: THREE.LinearFilter,
                magFilter: THREE.LinearFilter,
                format: THREE.RGBAFormat,
                type: THREE.FloatType,
                stencilBuffer: false
            }
        );
        
        this.writeBuffer = this.readBuffer.clone();

        this.buffer0 = new Buffer();
        await this.buffer0.BufferInit(
            './shaders/fragment0.glsl',
            {
                u_buffer0 : {value: null}
            }
        );
        this.buffer1 = new Buffer();
        await this.buffer1.BufferInit(
            './shaders/fragment1.glsl',
            {
                u_buffer0 : {value: null},
            }
        );

        this.total_time = 0.0;
        this.previousRAF = null;
        this.frame_counter = 0;


        this.raf();
    }

    raf(){
        requestAnimationFrame(t => {
            // frame counter
            this.buffer0.material.uniforms['u_frame'].value = this.frame_counter; 
            this.buffer1.material.uniforms['u_frame'].value = this.frame_counter; 
            this.frame_counter += 1;

            // updating uniform u_time
            if(this.previousRAF === null){
                this.previousRAF = t;
            }
            this.step(t - this.previousRAF, this.buffer0);
            this.previousRAF = t;

            // rendering
            this.buffer0.material.uniforms['u_buffer0'].value = this.readBuffer.texture;
            this.render(this.threejs, this.buffer0.scene, this.camera);

            this.buffer1.material.uniforms['u_buffer0'].value = this.readBuffer.texture;
            this.render(this.threejs, this.buffer1.scene, this.camera, true);

            this.raf();
        });
    }

    render(renderer, scene, camera, toScreen = false){
        if(toScreen){
            renderer.render(scene, camera);
        }else{
            renderer.setRenderTarget(this.writeBuffer);
            renderer.clear();
            renderer.render(scene, camera);
            renderer.setRenderTarget(null);

            //swap buffers
            const temp = this.readBuffer;
            this.readBuffer = this.writeBuffer;
            this.writeBuffer = temp;
        }
    }

    step(time_elapsed, buffer){
        this.total_time += time_elapsed * .001;
        buffer.material.uniforms['u_time'].value = this.total_time;
    }

    onResize(){
        this.threejs.setSize(window.innerWidth, window.innerHeight);
    }
}

window.addEventListener("DOMContentLoaded", async () => {
    const app = new App();
    await app.init();
});