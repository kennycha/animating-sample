import { useEffect } from "react"
import { SkeletonUtils } from 'three/examples/jsm/utils/SkeletonUtils';
import * as THREE from 'three';

let pos = new THREE.Vector3();
let quat = new THREE.Quaternion();
let scale = new THREE.Vector3();
let bindBoneMatrix = new THREE.Matrix4();
let relativeMatrix = new THREE.Matrix4();
let globalMatrix = new THREE.Matrix4();

const retarget = (target, source, options={}) => {
	options.preserveMatrix = options.preserveMatrix !== undefined ? options.preserveMatrix : true;
	options.preservePosition = options.preservePosition !== undefined ? options.preservePosition : true;
	options.preserveHipPosition = options.preserveHipPosition !== undefined ? options.preserveHipPosition : false;
	options.useTargetMatrix = options.useTargetMatrix !== undefined ? options.useTargetMatrix : false;
	options.hip = options.hip !== undefined ? options.hip : "hip";
	options.names = options.names || {};
  
  const sourceBones = source.bones;
  const targetBones = target.bones;
  let bindBones, bone, name, boneTo, bonesPosition, i;

  options.useTargetMatrix = true;
  options.preserveMatrix = false;

  if (options.preservePosition) {
    bonesPosition = [];
    for (i = 0; i < targetBones.length; i++) {
      bonesPosition.push(targetBones[i].position.clone());
    }
  }
  
  if (options.preserveMatrix) {
    target.updateMatrixWorld();
    target.matrixWorld.identity();
    for (i = 0; i < target.children.length; ++ i) {
      target.children[i].updateMatrixWorld(true);
    }
  }

  for (i = 0; i < targetBones.length; ++ i) {
    bone = targetBones[i];
    name = options.names[bone.name] || bone.name;
    boneTo = SkeletonUtils.getBoneByName(name, sourceBones);
    globalMatrix.copy(bone.matrixWorld);
    if (boneTo) {
      boneTo.updateMatrixWorld();
      if (options.useTargetMatrix) {
        relativeMatrix.copy(boneTo.matrixWorld);
      } else {
        relativeMatrix.copy(target.matrixWorld).invert();
        relativeMatrix.multiply(boneTo.matrixWorld);
      }
      scale.setFromMatrixScale(relativeMatrix);
      relativeMatrix.scale(scale.set(1 / scale.x, 1 / scale.y, 1 / scale.z));
      globalMatrix.makeRotationFromQuaternion(quat.setFromRotationMatrix(relativeMatrix));
      globalMatrix.copyPosition(relativeMatrix);
    }
    if (bone.parent && bone.parent.isBone) {
      bone.matrix.copy(bone.parent.matrixWorld).invert();
			bone.matrix.multiply(globalMatrix);
    } else {
      bone.matrix.copy(globalMatrix);
    }
    bone.matrix.decompose( bone.position, bone.quaternion, bone.scale );
		bone.updateMatrixWorld();
  }
  if (options.preserveMatrix) {
    target.updateMatrixWorld(true);
  }
}


export const useRetarget = ({ targetSkeletonHelper, sourceSkeletonHelper, action }) => {
  useEffect(() => {
    if (targetSkeletonHelper && sourceSkeletonHelper && action) {
      const clip = action.getClip();
      console.log('targetSkeletonHelper: ', targetSkeletonHelper);
      console.log('sourceSkeletonHelper: ', sourceSkeletonHelper);
      console.log('clip: ', clip);
      const retargetOptions = {
        preservePosition: false,
      }
      retarget(targetSkeletonHelper, sourceSkeletonHelper, retargetOptions);
      console.log('retargetedSkeletonHelper: ', targetSkeletonHelper);
      console.log(sourceSkeletonHelper.isObject3D)
    }
  }, [sourceSkeletonHelper, targetSkeletonHelper, action])
}