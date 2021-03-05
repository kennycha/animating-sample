import React, { useState } from 'react'
import styled from 'styled-components'
import { useRendering } from './useRendering'
import { useReRendering } from './useReRendering'
import _ from 'lodash'
import { saveSkeleton } from './skeletonExample'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';
import * as THREE from 'three'

const Title = styled.div`
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.5rem;
`

const Input = styled.input``

const RenderingDiv = styled.div`
  min-height: 1024px;
`

const ButtonContainer = styled.div`
  width: 100%;
  height: 40px;
  display: flex;
  border-bottom: 1px solid gray;
`

const Button = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  border-right: 1px solid gray;
  cursor: pointer;
`

const id = 'renderingDiv'

const App = () => {
  const [inputUrl, setInputUrl] = useState(undefined);
  const [loadedObj, setLoadedObj] = useState(undefined);
  const [mixer, setMixer] = useState(undefined);
  const [theScene, setTheScene] = useState(undefined);
  const [currentAction, setCurrentAction] = useState(undefined);
  const [possibleActions, setPossibleActions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [theTransformControls, setTheTransfromControls] = useState(undefined);

  const onFileChange = (event) => {
    const file = event.target.files[0];
    if (Boolean(file)) {
      const fileUrl = URL.createObjectURL(file);
      setInputUrl(fileUrl);
    }
  }

  const onToStartButtonClick = () => {
    if (!currentAction.isRunning()) { // 한 번도 재생되지 않은 상태에서 특정 시점으로 이동할 경우, 우선 재생 시키고 멈춰야 정상 동작
      currentAction.play();
    }
    mixer.timeScale = 0.1;
    mixer.setTime(0);
    mixer.timeScale = 0;
  }
 
  const onBackwardButtonClick = () => {
    mixer.timeScale = -0.1;
    currentAction.play();
  }

  const onForwardButtonClick = () => {
    mixer.timeScale = 0.1;
    currentAction.play();
    console.log(currentAction);
    console.log(currentAction.getClip());
  }

  const onPauseButtonClick = () => {
    mixer.timeScale = 0;
  }

  const onStopButtonClick = () => {
    currentAction.stop();
  }

  const onAnimButtonClick = ({ action }) => {
    currentAction.stop();
    setCurrentAction(action);
  }

  // 특정 인덱스(input value)로 이동
  const onPressEnter = (event) => {
    if (event.key === "Enter") {
      const targetIdx = parseInt(event.target.value % currentAction._clip.tracks[0].times.length);  // 실제 프로젝트에서는 timeline 에서 각 점들이 가지고 있는 index
      if (_.isFinite(targetIdx)) {
        setCurrentIndex(targetIdx);
        if (!currentAction.isRunning()) { // 한 번도 재생되지 않은 상태에서 특정 시점으로 이동할 경우, 우선 재생 시키고 멈춰야 정상 동작
          currentAction.play();
        }
        mixer.timeScale = 0.1;
        const targetTime = parseFloat(currentAction._clip.tracks[0].times[targetIdx] / mixer.timeScale);
        mixer.setTime(targetTime);
        mixer.timeScale = 0;
      }
    }
  }

  // 직접 접근해서 애니메이션 변경
  const changeKeyFrames = ({ mixer, actionIndex, trackIndex, timeIndices, values, type }) => {
    const addedActions = mixer._actions
    const addedClips = mixer._actions.map((action => action.getClip()))

    // console.log('addedActions: ', addedActions)
    // console.log('actionIndex: ', actionIndex)
    // console.log('trackIndex: ', trackIndex)
    // console.log('timeIndices: ', timeIndices)
    // console.log('values: ', values)
    
    if (actionIndex < addedActions.length) {
      const targetAction = addedActions[actionIndex]
      const targetClip = targetAction.getClip()
      if (trackIndex < targetClip.tracks.length) {
        const targetTrack = targetClip.tracks[trackIndex]
        const newValues = _.clone(targetTrack.values)
        if (type === 'position') {
          timeIndices.forEach((timeIndex, idx) => {
            newValues[timeIndex * 3] = values[idx * 3]
            newValues[(timeIndex * 3) + 1] = values[(idx * 3) + 1]
            newValues[(timeIndex * 3) + 2] = values[(idx * 3) + 2]
          })
          targetTrack.values = newValues
        } else if (type === 'quaternion') {
          timeIndices.forEach((timeIndex, idx) => {
            newValues[timeIndex * 4] = values[idx * 4]
            newValues[(timeIndex * 4) + 1] = values[(idx * 4) + 1]
            newValues[(timeIndex * 4) + 2] = values[(idx * 4) + 2]
            newValues[(timeIndex * 4) + 3] = values[(idx * 4) + 3]
          })
          targetTrack.values = newValues
        } else if (type === 'scale') {
          timeIndices.forEach((timeIndex, idx) => {
            newValues[timeIndex * 3] = values[idx * 3]
            newValues[(timeIndex * 3) + 1] = values[(idx * 3) + 1]
            newValues[(timeIndex * 3) + 2] = values[(idx * 3) + 2]
          })
          targetTrack.values = newValues
        }
        console.log('targetAction: ', targetAction)
        console.log('targetTrack: ', targetTrack)
      }
    }
  }

  const changeDummyPosition = () => {
    changeKeyFrames({
      mixer,
      actionIndex: 0,
      trackIndex: 0,
      timeIndices: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      values: [
        1000, 0, 0,
        0, 1000, 0,
        0, 0, 1000,
        1000, 1000, 0,
        1000, 0, 1000,
        0, 1000, 1000,
        1000, 1000, 1000,
        600, 600, 600,
        300, 300, 300,
        0, 0, 0
      ],
      type: 'position'
    })
  }

  const changeDummyQuaternion = () => {
    changeKeyFrames({
      mixer,
      actionIndex: 0,
      trackIndex: 1,
      timeIndices: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      values: [
        0, 0, 0, 1,
        0, 0.7071, 0, 0.7071,
        0, 1, 0, 0,
        0, 0.7071, 0, -0.7071,
        0, 0, 0.7071, 0.7071,
        0.5, 0.5, 0.5, 0.5,
        0.7071, 0.7071, 0, 0,
        -0.5, -0.5, 0.5, 0.5,
        -0.7071, 0.7071, 0, 0,
        0.7071, 0, 0, 0.7071,
      ],
      type: 'quaternion'
    })
  }

  const changeDummyScale = () => {
    changeKeyFrames({
      mixer,
      actionIndex: 0,
      trackIndex: 2,
      timeIndices: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      values: [
        2, 1, 1,
        1, 2, 1,
        1, 1, 2,
        2, 2, 1,
        2, 1, 2,
        1, 2, 2,
        2, 2, 2,
        1.6, 1.6, 1.6,
        1.3, 1.3, 1.3,
        1, 1, 1
      ],
      type: 'scale'
    })
  }

  const addKeyFrames = ({ mixer, actionIndex, trackIndex, timeValue, values, type }) => {
    const addedActions = mixer._actions
    const addedClips = mixer._actions.map((action => action.getClip()))

    if (actionIndex < addedActions.length) {
      const targetAction = addedActions[actionIndex]
      const targetClip = targetAction.getClip()
      let newTracks = _.clone(targetClip.tracks)
      if (trackIndex < targetClip.tracks.length) {
        const targetTrack = targetClip.tracks[trackIndex]
        let newTimes = _.clone(targetTrack.times)
        let newValues = _.clone(targetTrack.values)
        let timeIndex = _.findIndex(targetTrack.times, (t) => _.round(t, 4) === _.round(timeValue, 4))
        if (timeIndex === -1) {
          // 해당 time 이 track 의 times 내에 존재하지 않는 경우
          // 키프레임 추가에 해당
          let newClip;
          if (timeValue > targetTrack.times[targetTrack.times.length - 1]) {  // 추가되는 time 이 duration 보다 뒤일 때
            newTimes = [...newTimes, timeValue]
            newValues = [...newValues, ...values]
            newTracks = [..._.slice(newTracks, 0, trackIndex), new THREE.VectorKeyframeTrack(targetTrack.name, newTimes, newValues), ..._.slice(newTracks, trackIndex + 1)]
            newClip = new THREE.AnimationClip(
              targetClip.name,
              (timeValue > targetClip.duration) ? timeValue : targetClip.duration,
              newTracks
            )
          } else if (timeValue < targetTrack.times[0]) {  // 추가되는 time 이 첫 번째 time 보다 앞일 때
            newTimes = [timeValue, ...newTimes]
            newValues = [...values, ...newValues]
            newTracks = [..._.slice(newTracks, 0, trackIndex), new THREE.VectorKeyframeTrack(targetTrack.name, newTimes, newValues), ..._.slice(newTracks, trackIndex + 1)]
            newClip = new THREE.AnimationClip(
              targetClip.name,
              targetClip.duration,
              newTracks
            )
          } else {  // 추가되는 time 이 times 내에 속할 때
            timeIndex = _.findIndex(_.slice(targetTrack.times, 1), (t, idx) => _.round(targetTrack.times[idx - 1], 4) < _.round(timeValue, 4) && _.round(t, 4) > _.round(timeValue, 4))
            console.log(timeIndex)
            newTimes = [..._.slice(newTimes, 0, (timeIndex + 1)), timeValue, ..._.slice(newTimes, (timeIndex + 1))]
            if (type === 'position') {
              newValues = [..._.slice(newValues, 0, 3 * (timeIndex + 1)), ...values, ..._.slice(newValues, 3 * (timeIndex + 1))]
            } else if (type === 'quaternion') {
              newValues = [..._.slice(newValues, 0, 4 * (timeIndex + 1)), ...values, ..._.slice(newValues, 4 * (timeIndex + 1))]
            } else if (type === 'scale') {
              newValues = [..._.slice(newValues, 0, 3 * (timeIndex + 1)), ...values, ..._.slice(newValues, 3 * (timeIndex + 1))]
            }
            newTracks = [..._.slice(newTracks, 0, trackIndex), new THREE.VectorKeyframeTrack(targetTrack.name, newTimes, newValues), ..._.slice(newTracks, trackIndex + 1)]
            newClip = new THREE.AnimationClip(
              targetClip.name,
              targetClip.duration,
              newTracks
            )
          }
          console.log('newClip: ', newClip)
          currentAction.stop()
          const newAction = mixer.clipAction(newClip)
          console.log('newAction: ', newAction)
          setCurrentAction(newAction)
        } else {  // -> 정상 동작
          // 해당 time 이 track 의 times 내에 존재하는 경우
          // 키프레임 수정에 해당
          if (type === 'position') {
            newValues[timeIndex * 3] = values[0]
            newValues[(timeIndex * 3) + 1] = values[1]
            newValues[(timeIndex * 3) + 2] = values[2]
          } else if (type === 'quaternion') {
            newValues[timeIndex * 4] = values[0]
            newValues[(timeIndex * 4) + 1] = values[1]
            newValues[(timeIndex * 4) + 2] = values[2]
            newValues[(timeIndex * 4) + 3] = values[3]
          } else if (type === 'scale') {
            newValues[timeIndex * 3] = values[0]
            newValues[(timeIndex * 3) + 1] = values[1]
            newValues[(timeIndex * 3) + 2] = values[2]
          }
          targetTrack.values = newValues
        }
      }
    }
  }

  const addPosKeyFrame = () => {
    addKeyFrames({
      mixer,
      actionIndex: 0,
      trackIndex: 138,
      timeValue: 0.0123,
      values: [1000, 0, 0],
      type: 'position' 
    })
  }

  const addQtnKeyFrame = () => {
    addKeyFrames({
      mixer,
      actionIndex: 0,
      trackIndex: 139,
      timeValue: 0.0123,
      values: [0, 0.7071, 0, 0.7071],
      type: 'quaternion' 
    })
  }

  const addSclKeyFrame = () => {
    addKeyFrames({
      mixer,
      actionIndex: 0,
      trackIndex: 140,
      timeValue: 0.0123,
      values: [100, 1, 1],
      type: 'scale' 
    })
  }

  const deleteKeyFrames = ({ mixer, actionIndex, trackIndex, timeValue, type }) => {
    const addedActions = mixer._actions

    if (actionIndex < addedActions.length) {
      const targetAction = addedActions[actionIndex]
      const targetClip = targetAction.getClip()
      let newTracks = _.clone(targetClip.tracks)
      if (trackIndex < targetClip.tracks.length) {
        const targetTrack = targetClip.tracks[trackIndex]
        let newTimes = _.clone(targetTrack.times)
        let newValues = _.clone(targetTrack.values)
        let timeIndex = _.findIndex(targetTrack.times, (t) => _.round(t, 4) === _.round(timeValue, 4))
        if (timeIndex === -1) {
          // 해당 time 이 track 의 times 내에 존재하지 않는다면 그냥 return
          return
        } else {
          // 해당 time 이 track 의 times 내에 존재하는 경우
          let newClip
          if (timeIndex === 0) {
            newTimes = _.slice(newTimes, 1)
            newValues = (type === 'quaternion') ? _.slice(newValues, 4) : _.slice(newValues, 3)
          } else if (timeIndex === targetTrack.times.length - 1) {
            newTimes = _.slice(newTimes, 0, targetTrack.times.length - 1)
            newValues = (type === 'quaternion') ? _.slice(newValues, 0, targetTrack.times.length - 4) : _.slice(newValues, 0, targetTrack.times.length - 3)
          } else {
            newTimes = [..._.slice(newTimes, 0, timeIndex), ..._.slice(newTimes, timeIndex + 1)]
            newValues = (type === 'quaternion')
            ? [..._.slice(newValues, 0, 4 * timeIndex), ..._.slice(newValues, 4 * (timeIndex + 1))]
            : [..._.slice(newValues, 0, 3 * timeIndex), ..._.slice(newValues, 3 * (timeIndex + 1))]
          }
          newTracks = [..._.slice(newTracks, 0, trackIndex), new THREE.VectorKeyframeTrack(targetTrack.name, newTimes, newValues), ..._.slice(newTracks, trackIndex + 1)]
          newClip = new THREE.AnimationClip(
            targetClip.name,
            targetClip.duration,
            newTracks
          )
          currentAction.stop()
          const newAction = mixer.clipAction(newClip)
          setCurrentAction(newAction)
        }
      }
    }
  }

  const deletePosKeyFrame = () => {
    deleteKeyFrames({
      mixer,
      actionIndex: 0,
      trackIndex: 138,
      timeValue: 0.0123,
      type: 'position' 
    })
  }

  const deleteQtnKeyFrame = () => {
    deleteKeyFrames({
      mixer,
      actionIndex: 0,
      trackIndex: 139,
      timeValue: 0.0123,
      type: 'quaternion' 
    })
  }

  const deleteSclKeyFrame = () => {
    deleteKeyFrames({
      mixer,
      actionIndex: 0,
      trackIndex: 140,
      timeValue: 0.0123,
      type: 'scale' 
    })
  }

  const onGLBExport = () => {
    const options = {
      binanry: true,
      animations: mixer._actions.map((action => action.getClip()))
    };
    const exporter = new GLTFExporter();
    exporter.parse(
      // @ts-ignore
      theScene,
      (res) => {
        // @ts-ignore
        const blob = new Blob([res], { type: 'octet/stream' });
        const objURL = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.download = 'result.glb';
        a.href = objURL;
        a.click();
      },
      options,
    );
  };

  useRendering({ id, inputUrl, setLoadedObj, mixer, setMixer, setTheTransfromControls, theScene, setTheScene })
  
  const cutAction = useReRendering({ mixer, loadedObj, currentAction, setCurrentAction, setPossibleActions, currentIndex, theTransformControls })
  
  return (
    <>
      <Title>Animating Sample</Title>
      <Input type='file' accept='.fbx' onChange={onFileChange}/>
      <RenderingDiv id='renderingDiv'></RenderingDiv>
      {currentAction &&
        (<ButtonContainer>
          {/* <Button onClick={onToStartButtonClick}>To Start</Button> */}
          <Button onClick={onBackwardButtonClick}>Backward</Button>
          <Button onClick={onForwardButtonClick}>Forward</Button>
          <Button onClick={onPauseButtonClick}>Pause</Button>
          <Button onClick={onStopButtonClick}>Stop</Button>
          {/* <Button onClick={() => cutAction(currentAction)}>Cut</Button> */}
          {/* <Button onClick={saveSkeleton}>Save Skeleton</Button> */}
          <Button onClick={onGLBExport}>Glb Export</Button>
        </ButtonContainer>)}
      {currentAction && 
        (<ButtonContainer>
          <Button onClick={changeDummyPosition}>changePos</Button>
          <Button onClick={changeDummyQuaternion}>changeQtn</Button>
          <Button onClick={changeDummyScale}>changeScl</Button>
          <Button onClick={addPosKeyFrame}>addPosKeyFrame</Button>
          <Button onClick={addQtnKeyFrame}>addQtnKeyFrame</Button>
          <Button onClick={addSclKeyFrame}>addSclKeyFrame</Button>
          <Button onClick={deletePosKeyFrame}>deletePosKeyFrame</Button>
          <Button onClick={deleteQtnKeyFrame}>deleteQtnKeyFrame</Button>
          <Button onClick={deleteSclKeyFrame}>deleteSclKeyFrame</Button>
        </ButtonContainer>)}
      {possibleActions.length !== 0 && 
        (<ButtonContainer>
          {possibleActions && 
            possibleActions.map((action, index) => <Button onClick={() => onAnimButtonClick({ action })} key={index}>{`Anim #${index + 1}`}</Button>)}
        </ButtonContainer>)}
    </>
  );
}

export default App;
