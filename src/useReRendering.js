import { useCallback, useEffect } from 'react'
import * as THREE from 'three'
import _ from 'lodash'

const MODE_MAP = {
  translate: 'position',
  rotate: 'quaternion',
  scale: 'scale',
}

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

  const addConvertingEventlistener = ({ transformControls, animationMixer, targetClip, targetIndex }) => {
    transformControls.addEventListener('objectChange', (event) => {
      const targetBone = event.target.object
      const targetTrack = _.find(targetClip.tracks, (track) => track.name === `${targetBone.name}.${MODE_MAP[transformControls.mode]}`)
      switch (transformControls.mode) {
        case 'translate':
          const { x: posX, y: posY, z: posZ } = event.target.object.position
          targetTrack.values[3 * targetIndex] = posX
          targetTrack.values[3 * targetIndex + 1] = posY
          targetTrack.values[3 * targetIndex + 2] = posZ
          break
        case 'rotate':
          const { w: rotW, x: rotX, y: rotY, z: rotZ } = event.target.object.quaternion
          targetTrack.values[4 * targetIndex] = rotW
          targetTrack.values[4 * targetIndex + 1] = rotX
          targetTrack.values[4 * targetIndex + 2] = rotY
          targetTrack.values[4 * targetIndex + 3] = rotZ
          break
        case 'scale':
          const { x: scaX, y: scaY, z: scaZ } = event.target.object.scale
          targetTrack.values[3 * targetIndex] = scaX
          targetTrack.values[3 * targetIndex + 1] = scaY
          targetTrack.values[3 * targetIndex + 2] = scaZ
          break
        default:
          break;
      }      
    })
  }

  useEffect(() => {
    if (mixer) {
      createAnimationActions({ object: loadedObj })
    }
  }, [mixer])

  useEffect(() => {
    if (currentAction) {
      const targetClip = currentAction.getClip()
      addConvertingEventlistener({ transformControls: theTransformControls, animationMixer: mixer, targetClip, targetIndex: currentIndex });
    }
  }, [currentAction, currentIndex])
}
