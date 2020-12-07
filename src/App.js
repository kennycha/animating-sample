import React, { useState } from 'react'
import styled from 'styled-components'
import { useRendering } from './useRendering'
import { useReRendering } from './useReRendering'
import _ from 'lodash'

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

  const onResetButtonClick = () => {
    mixer.setTime(0);
    currentAction.reset();
  }
  
  const onBackwardButtonClick = () => {
    mixer.timeScale = -0.3;
    currentAction.play();
  }

  const onForwardButtonClick = () => {
    mixer.timeScale = 0.3;
    currentAction.play();
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
        mixer.timeScale = 0.3;
        const targetTime = parseFloat(currentAction._clip.tracks[0].times[targetIdx] / mixer.timeScale);
        mixer.setTime(targetTime);
        mixer.timeScale = 0;
      }
    }
  }

  useRendering({ id, inputUrl, setLoadedObj, mixer, setMixer, setTheTransfromControls })
  
  useReRendering({ mixer, loadedObj, currentAction, setCurrentAction, setPossibleActions, currentIndex, theTransformControls })
  
  return (
    <>
      <Title>Animating Sample</Title>
      <Input type='file' accept='.fbx' onChange={onFileChange}/>
      <RenderingDiv id='renderingDiv'></RenderingDiv>
      {currentAction &&
        (<ButtonContainer>
          <Button onClick={onResetButtonClick}>Reset</Button>
          <Button onClick={onBackwardButtonClick}>Backward</Button>
          <Button onClick={onForwardButtonClick}>Forward</Button>
          <Button onClick={onPauseButtonClick}>Pause</Button>
          <Button onClick={onStopButtonClick}>Stop</Button>
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
