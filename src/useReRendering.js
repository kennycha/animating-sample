import { useCallback, useEffect } from 'react'
import * as THREE from 'three'

export const useReRendering = ({ mixer, loadedObj, setCurrentClip, setPossibleClips }) => {
  const createAnimationClips = useCallback(({ object }) => {
    const fileAnimations = object.animations;
    const fileClips = fileAnimations.map((anim) => {
      let clip = THREE.AnimationClip.findByName(fileAnimations, anim.name);
      clip = mixer?.clipAction(clip);
      return clip;
    });
    setCurrentClip(fileClips[0]);
    setPossibleClips(fileClips);
  }, [mixer, loadedObj])

  useEffect(() => {
    if (mixer) {
      createAnimationClips({ object: loadedObj })
    }
  }, [mixer])
}
