import { useCallback, useEffect, useState } from 'react'
import * as THREE from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { DragControls } from 'three/examples/jsm/controls/DragControls';
import _ from 'lodash';

const MAP_TYPES = ['map', 'aoMap', 'emissiveMap', 'glossinessMap', 'metalnessMap', 'normalMap', 'roughnessMap', 'specularMap'];

let innerMixer;

export const useRendering = ({ id, inputUrl, setLoadedObj, mixer, setMixer, setTheTransfromControls }) => {
  const [contents, setContents] = useState([]);
  const [theScene, setTheScene] = useState(undefined);
  const [currentBone, setCurrentBone] = useState(undefined);

  const clock = new THREE.Clock();

  const createScene = useCallback(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xbbbbbb);
    scene.fog = new THREE.Fog(0xbbbbbb, 10, 80);
    setTheScene(scene);
    return scene;
  }, [])

  const clearRendering = useCallback(({ renderingDiv }) => {
    document.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('keyup', onKeyUp);
    if (renderingDiv) {
      while (renderingDiv.firstChild) {
        renderingDiv.removeChild(renderingDiv.firstChild);
      }
    }
    contents.forEach((content) => {
      theScene?.remove(content);
      content.traverse((node) => {
        if (!node.isMesh) return;
        node.geometry.dispose();
        const materials = _.isArray(node.material) ? node.material : [node.material];
        materials.forEach((material) => {
          MAP_TYPES.forEach((mapType) => {
            material[mapType]?.dispose();
          })
        })
      })
    })
    setContents([]);
    setTheScene(undefined);
  }, [])

  const createCamera = useCallback(() => {
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 0.1, 500);
    camera.position.set(-20, 20, 2);
    camera.lookAt(0, 0, 0);
    return camera;
  }, [])

  const createRenderer = useCallback(({ renderingDiv }) => {
    const renderer = new THREE.WebGL1Renderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.outputEncoding = THREE.sRGBEncoding;
    return renderer;
  }, [])

  const addLights = useCallback(({ scene }) => {
    const hemiLight = new THREE.HemisphereLight(0xAAAAAA);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight)

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.54)
    dirLight.position.set(-8, 12, 8);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize = new THREE.Vector2(1000, 1000);
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 1500;
    const d = 8.25;
    dirLight.shadow.camera.left = d * -1;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = d * -1;
    scene.add(dirLight);
  }, [])

  const addGround = useCallback(({ scene, camera, renderer }) => {
    const texture = new THREE.TextureLoader().load(
      'texture/texture_01.png',
      () => { renderer.render(scene, camera) }
    )
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(300, 300);
    
    const groundMesh = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(1000, 1000),
      new THREE.MeshPhongMaterial({
        color: 0xbbbbbb,
        map: texture,
        depthWrite: false,
        side: THREE.DoubleSide,
      })
    );
    groundMesh.position.set(0, 0, 0);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);

    const xMaterial = new THREE.LineBasicMaterial({ color: '#EA2027' });
    const yMaterial = new THREE.LineBasicMaterial({ color: '#0652DD' });

    const xPoints = [new THREE.Vector3(-500, 0, 0), new THREE.Vector3(500, 0, 0)];
    const yPoints = [new THREE.Vector3(0, 0, -500), new THREE.Vector3(0, 0, 500)];

    const xGeometry = new THREE.BufferGeometry().setFromPoints(xPoints);
    const yGeometry = new THREE.BufferGeometry().setFromPoints(yPoints);

    const xLine = new THREE.Line(xGeometry, xMaterial);
    const yLine = new THREE.Line(yGeometry, yMaterial);

    scene.add(xLine, yLine);
  }, [])

  const createCameraControls = useCallback(({ camera, renderer }) => {
    const cameraControls = new OrbitControls(camera, renderer.domElement);
    cameraControls.target.set(0, 0, 0);
    cameraControls.update();
    cameraControls.enabled = true;
    cameraControls.enablePan = true;
    cameraControls.maxDistance = 100;
    cameraControls.minZoom = 1.0001;
    cameraControls.addEventListener('change', () => {
      if (cameraControls.object.position.y < 1.01) {
        const { x, y, z } = cameraControls.object.position;
        cameraControls.object.position.set(x, y + 0.01, z);
      }
      if (cameraControls.object.position.y > 100) {
        const { x, y, z } = cameraControls.object.position;
        cameraControls.object.position.set(x, y - 1, z);
      }
    });
    setContents([...contents, cameraControls]);
    return cameraControls;
  }, [])

  const createTransformControls = useCallback(({ scene, camera, renderer, cameraControls }) => {
    const transformControls = new TransformControls(camera, renderer.domElement);
    setTheTransfromControls(transformControls);
    transformControls.addEventListener('change', () => {
      renderer.render(scene, camera);
    });
    transformControls.addEventListener('dragging-changed', (event) => {
      cameraControls.enabled = !event.value;
    });
    setContents([...contents, transformControls]);
    scene.add(transformControls);
    return transformControls;
  }, [])
  
  const createMixer = ({ object }) => {
    innerMixer = new THREE.AnimationMixer(object)
    setMixer(innerMixer);
  };

  const addModel = ({ scene, object }) => {
    object.scale.multiplyScalar(0.05);
    object.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    })
    const model = object;
    setContents([...contents, model]);
    scene.add(model);
    return model;
  };

  const addSkeletonHelper = ({ scene, model }) => {
    const skeletonHelper = new THREE.SkeletonHelper(model);
    skeletonHelper.visible = true;
    scene.add(skeletonHelper);
    return skeletonHelper;
  };

  const addJointMeshes = ({ skeletonHelper, camera, renderer, cameraControls, transformControls }) => {
    skeletonHelper.bones.forEach((bone) => {
      const boneMaterial = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        opacity: 0.5,
        transparent: true 
      })
      boneMaterial.depthWrite = false;
      boneMaterial.depthTest = false;
      const boneGeometry = new THREE.SphereBufferGeometry(2, 32, 32);
      const boneMesh = new THREE.Mesh(boneGeometry, boneMaterial);
      bone.add(boneMesh);
    })
    const dragControls = new DragControls(skeletonHelper.bones, camera, renderer.domElement);
    dragControls.addEventListener('hoveron', () => {
      cameraControls.enabled = false;
    });
    dragControls.addEventListener('hoveroff', () => {
      cameraControls.enabled = true;
    });
    dragControls.addEventListener('dragstart', (event) => {
      if (currentBone !== event.object.parent) {
        transformControls.attach(event.object.parent);
        setCurrentBone(event.object.parent);
        dragControls.enabled = false;
      }
      innerMixer.timeScale = 0; // joint mesh 클릭 시 애니메이션 중지
    });
    dragControls.addEventListener('dragend', (event) => {
      dragControls.enabled = true;
    });    
  };

  const onKeyDown = ({ event, transformControls }) => {
    switch (event.keyCode) {
      case 27: // esc
      // 현재 transformControl 붙어 있는 것 제거
        if (transformControls) {
          transformControls.detach();
          setCurrentBone(undefined);
        }
        break;
      case 81: // q
      // 이동방향 기준 범위 변경
        if (transformControls) {
          transformControls.setSpace(transformControls.space === 'local' ? 'world' : 'local');
        }
        break;
      case 91: // cmd or win
      // 설정한 단위로 변경
        if (transformControls) {
          transformControls.setTranslationSnap(10);
          transformControls.setRotationSnap(THREE.MathUtils.degToRad(15));
        }
        break;
      case 87: // w
      // position 변경 모드
        if (transformControls) {
          transformControls.setMode('translate');
        }
        break;
      case 69: // e
      // rotation 변경 모드
        if (transformControls) {
          transformControls.setMode('rotate');
        }
        break;
      case 82: // r
      // scale 변경 모드
        if (transformControls) {
          transformControls.setMode('scale');
        }
        break;
      case 187: // +, =, num+
      case 107:
      // transformControls 크기 증가
        if (transformControls && transformControls.size < 2.0) {
          transformControls.setSize(transformControls.size + 0.1);
        }
        break;
      case 189: // -, _, num-
      case 109:
      // transformControls 크기 감소
        if (transformControls && transformControls.size > 0.2) {
          transformControls.setSize(transformControls.size - 0.1);
        }
        break;
      default:
        break;
    }
  }
  
  const onKeyUp = ({ event, transformControls }) => {
    switch (event.keyCode) {
      case 91:
      // 기본 단위로 변경
        if (transformControls) {
          transformControls.setTranslationSnap(null);
          transformControls.setRotationSnap(null);
        }
        break;
      default:
        break;
    }
  }

  const resizeRendererToDisplaySize = ({ renderer }) => {
    const canvas = renderer.domElement;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let canvasPixelWidth = canvas.width / window.devicePixelRatio;
    let canvasPixelHeight = canvas.height / window.devicePixelRatio;
    const needResize =
    canvasPixelWidth !== width || canvasPixelHeight !== height;
    if (needResize) {
      const renderingDiv = document.getElementById(id);
      renderer.setSize(renderingDiv?.clientWidth ?? 0, renderingDiv?.clientHeight ?? 0, false)
    }
    return needResize;
  }

  useEffect(() => {
    const renderingDiv = document.getElementById(id);
    const scene = createScene();
    const camera = createCamera()
    const renderer = createRenderer({ renderingDiv });
    addLights({ scene });
    addGround({ scene, camera, renderer });
    const cameraControls = createCameraControls({ camera, renderer });
    const transformControls = createTransformControls({ scene, camera, renderer, cameraControls })
    if (inputUrl) {
      document.addEventListener('keydown', (event) => onKeyDown({ event, transformControls }));
      document.addEventListener('keyup', (event) => onKeyUp({ event, transformControls }));
      const loader = new FBXLoader();
      loader.load(inputUrl, (object) => {
        setLoadedObj(object);
        createMixer({ object });
        const model = addModel({ scene, object });
        const skeletonHelper = addSkeletonHelper({ scene, model });
        addJointMeshes({ skeletonHelper, camera, renderer, cameraControls, transformControls });
      })
    }

    renderingDiv.appendChild(renderer.domElement);

    const update = () => {
      if (innerMixer) {
        innerMixer.update(clock.getDelta());
      }
      if (resizeRendererToDisplaySize({ renderer })) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
      }
      renderer.render(scene, camera);
      requestAnimationFrame(update);
    }

    update();

    return () => {
      clearRendering({ renderingDiv });
    }
  }, [inputUrl])
}
