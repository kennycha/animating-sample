import { useCallback, useEffect } from 'react'
import * as THREE from 'three'

export const useReRendering = ({ mixer, loadedObj, currentAction, setCurrentAction, setPossibleActions, currentIndex, theTransformControls }) => {  
  const createAnimationActions = useCallback(({ object }) => {
    const fileAnimations = object.animations;
    const fileActions = fileAnimations.map((anim) => {
      let action = THREE.AnimationClip.findByName(fileAnimations, anim.name);
      action = mixer?.clipAction(action);
      return action;
    });
    setCurrentAction(fileActions[0]);
    setPossibleActions(fileActions);
  }, [mixer, loadedObj])

  const addConvertingEventlistener = ({ transformControls, mixer }) => {
    transformControls.addEventListener('objectChange', (event) => {
      console.log(currentAction);
      switch (transformControls.mode) {
        case 'translate':

          console.log(event.target.object.position);
          break
        case 'rotate':
          
          console.log(event.target.object.quaternion);
          break
        case 'scale':
          
          console.log(event.target.object.scale);
          break
        default:
          break;
      }      
    })
  }

  useEffect(() => {
    if (mixer) {
      createAnimationActions({ object: loadedObj })
      addConvertingEventlistener({ transformControls: theTransformControls, mixer });
    }
  }, [mixer])
}
