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
    console.log(fileActions[0]);
    setPossibleActions(fileActions);
  }, [mixer, loadedObj])

  const addConvertingEventlistener = ({ transformControls, targetClip, targetIndex }) => {
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

  const resetAction = (action) => {
    console.log('action: ', action);
    _.forEach(action.getClip().tracks, (track) => {
      track.times.fill(0);
      track.values.fill(0);
    })
  }

  const cutAction = (action) => {
    if (action) {
      const newClip = action.getClip().clone();
      _.forEach(newClip.tracks, (track) => {
        track.times = track.times.slice(0, 2);
        if (_.includes(track.name, 'quaternion')) {
          track.values = track.values.slice(0, 8);
        } else {
          track.values = track.values.slice(0, 6);
        }
      });
      console.log('currentClip: ', action.getClip())
      console.log('newClip: ', newClip)
      // console.log('currentClip: ', action.getClip());
      // console.log('newClip: ', newClip);
      const newAction = mixer.clipAction(newClip);
      console.log('currentAction :', action);
      console.log('newAction :', newAction);
      setCurrentAction(newAction);
      console.log(mixer);
    }
  }

  useEffect(() => {
    if (mixer) {
      createAnimationActions({ object: loadedObj })
    }
  }, [mixer])

  useEffect(() => {
    if (currentAction) {
      currentAction.play();
      mixer.timeScale = 0;
      mixer.setTime(1);
      const targetClip = currentAction.getClip()
      addConvertingEventlistener({ transformControls: theTransformControls, targetClip, targetIndex: currentIndex });
    }
  }, [currentAction, currentIndex])
  return cutAction;
}
