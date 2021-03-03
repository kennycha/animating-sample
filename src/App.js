import React, { useState } from 'react'
import styled from 'styled-components'
import { useRendering } from './useRendering'
import { useReRendering } from './useReRendering'
import _ from 'lodash'
import { saveSkeleton } from './skeletonExample'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';

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
  const changeAnimation1 = ({ mixer, actionIndex, trackIndex, timeIndices, values }) => {
    const addedActions = mixer._actions
    const addedClips = mixer._actions.map((action => action.getClip()))

    console.log('addedActions: ', addedActions)
    console.log('actionIndex: ', actionIndex)
    console.log('trackIndex: ', trackIndex)
    console.log('timeIndices: ', timeIndices)
    console.log('values: ', values)
    
    if (actionIndex < addedActions.length) {
      const targetAction = addedActions[actionIndex]
      console.log('targetAction: ', targetAction)
      if (trackIndex < targetAction.getClip().tracks.length) {
        const targetTrack = targetAction.getClip().tracks[trackIndex]
        console.log('targetTrack: ', targetTrack)
        console.log('targetTrack.values: ', targetTrack.values)
        const newValues = _.clone(targetTrack.values)
        console.log('newValues: ', newValues)
        timeIndices.forEach((timeIndex, idx) => {
          newValues[timeIndex * 3] = values[idx * 3]
          newValues[(timeIndex * 3) + 1] = values[(idx * 3) + 1]
          newValues[(timeIndex * 3) + 2] = values[(idx * 3) + 2]
        })
        console.log('newValues: ', newValues)
        targetTrack.values = newValues
        console.log('targetTrack: ', targetTrack)
        console.log('targetTrack.values: ', targetTrack.values)
      }
    }
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
          <Button onClick={onToStartButtonClick}>To Start</Button>
          <Button onClick={onBackwardButtonClick}>Backward</Button>
          <Button onClick={onForwardButtonClick}>Forward</Button>
          <Button onClick={onPauseButtonClick}>Pause</Button>
          <Button onClick={onStopButtonClick}>Stop</Button>
          <Button onClick={() => cutAction(currentAction)}>Cut</Button>
          <Button onClick={saveSkeleton}>Save Skeleton</Button>
          <Button onClick={() => changeAnimation1({
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
            ]
          })}>
            changeAnimation1
          </Button>
          <Button onClick={onGLBExport}>Glb Export</Button>
        </ButtonContainer>)}
      {currentAction && <Input onKeyPress={onPressEnter} />}
      {possibleActions.length !== 0 && 
        (<ButtonContainer>
          {possibleActions && 
            possibleActions.map((action, index) => <Button onClick={() => onAnimButtonClick({ action })} key={index}>{`Anim #${index + 1}`}</Button>)}
        </ButtonContainer>)}
    </>
  );
}

export default App;
