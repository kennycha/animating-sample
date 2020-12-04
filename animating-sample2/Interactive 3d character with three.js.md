# Interactive 3d character with three.js

## 구성

- scene

- renderer

  - WebGLRenderer

- camera

  - PerspectiveCamera

- lights

  - HemisphereLight
  - DirectionalLight
    - spotlight 대체 하는게 나을 듯
  
- update function

  - ```
    One crucial aspect that Three.js relies on is an update function, which runs every frame, and is similar to how game engines work if you’ve ever dabbled with Unity.
    ```

  - ```
    Inside our update function the renderer renders the scene and camera, and the update is run again. 
    ```
  
  - ```js
    function update() {
      renderer.render(scene, camera);
      requestAnimationFrame(update);
    }
    update();
    ```
  
  - `init()` 함수 내부가 아니라 뒤에 위치
  
- canvas resize

  - renderer 와 canvas 의 크기가 같은지 비교

    - 같지 않으면 resize

  - ```js
    function resizeRendererToDisplaySize(renderer) {
      const canvas = renderer.domElement;
      let width = window.innerWidth;
      let height = window.innerHeight;
      let canvasPixelWidth = canvas.width / window.devicePixelRatio;
      let canvasPixelHeight = canvas.height / window.devicePixelRatio;
    
      const needResize =
        canvasPixelWidth !== width || canvasPixelHeight !== height;
      if (needResize) {
        renderer.setSize(width, height, false);
      }
      return needResize;
    }
    ```

  - `update()` 함수 내부에 위치
  
- animation mixer

  - animation player

  - 재생을 위해서는 아래 두가지 작업 필요

  - Animation 을 mixer 에 등록하고 mixer play

    ```javascript
    idle = mixer.clipAction(idleAnim);
    idle.play();
    ```

  - `update()` func 내에서 mixer update

    ```js
    if (mixer) {
      mixer.update(clock.getDelta());
    }
    ```

  - ```
    The update takes our clock (a Clock was referenced at the top of our project) and updates it to that clock. This is so that animations don’t slow down if the frame rate slows down. If you run an animation to a frame rate, it’s tied to the frames to determine how fast or slow it runs, that’s not what you want.
    ```

  - mixer 조작을 통한 animation 플레이

    - ```js
      let clip = THREE.AnimationClip.findByName(clips, val.name);
      clip = mixer.clipAction(clip);
      ```

    - ```js
      function playOnClick() {
        let anim = Math.floor(Math.random() * possibleAnims.length) + 0;
        playModifierAnimation(idle, 0.25, possibleAnims[anim], 0.25);
      }
      
      
      function playModifierAnimation(from, fSpeed, to, tSpeed) {
        to.setLoop(THREE.LoopOnce);
        to.reset();
        to.play();
        from.crossFadeTo(to, fSpeed, true);
        setTimeout(function() {
          from.enabled = true;
          to.crossFadeTo(from, tSpeed, true);
          currentlyAnimating = false;
        }, to._clip.duration * 1000 - ((tSpeed + fSpeed) * 1000));
      }
      ```

- animation editing

  - animation 파일 자체 변형

  - ```js
    let idleAnim = THREE.AnimationClip.findByName(fileAnimations, 'idle');
    
    idleAnim.tracks.splice(3, 3);
    idleAnim.tracks.splice(9, 3);
    ```

- raycasting

  - ```
    We can’t add a simple click event listener on Stacy, as she isn’t part of our DOM.
    ```

  - ```
    We are instead going to use raycasting, which essentially means shooting a laser beam in a direction and returning the objects that it hit.
    In this case we’re shooting from our camera in the direction of our cursor.
    ```

  - ```
    Remember we’re doing this every time we click, so we’re shooting lasers with a mouse at Stacy.
    ```

  - ```
    We then get an array of intersected objects; if there are any, we set the first object that was hit to be our object.
    ```

## THREE.AnimationMixer

### properties

- time (global)
- **timeScale** (global)
  - A value of 0 causes the animation to pause. 
  - Negative values cause the animation to play backwards. 
  - Default is 1

### methods

- **clipAction**
  - action 생성 시 caching 제공해 AnimationAction 생성자보다 더 성능 좋음
- existingAction
- getRoot
- stopAllAction
- **update**
- **setTime**

## THREE.AnimationAction

### properties

- enabled
- paused
- loop
- repetitions
- time
- **timeScale**

### methods

- getClip
- getMixer
- getRoot
- isRunning
- **play**
- **reset**
- **stop**

## THREE.AnimationClip

### methods

- **clone**
- optimize
- **resetDuration**
- toJSON
- **trim**
- validate

### static methods

- **CreateClipsFromMorphTargetSequences**
- **CreateFromMorphTargetSequence**
- **findByName**
- **parse**
- **parseAnimation**

## THREE.AnimationUtils

### methods

- arraySlice
- convertArray
- **subclip**

## THREE.Clock

### methods

- **getDelta**
- 

