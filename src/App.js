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
  const [currentClip, setCurrentClip] = useState(undefined);
  const [possibleClips, setPossibleClips] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const onFileChange = (event) => {
    const file = event.target.files[0];
    const fileUrl = URL.createObjectURL(file);
    setInputUrl(fileUrl);
  }

  const onResetButtonClick = () => {
    mixer.setTime(0);
    currentClip.reset();
  }
  
  const onBackwardButtonClick = () => {
    mixer.timeScale = -0.3;
    currentClip.play();
  }

  const onForwardButtonClick = () => {
    mixer.timeScale = 0.3;
    currentClip.play();
  }

  const onPauseButtonClick = () => {
    mixer.timeScale = 0;
  }

  const onStopButtonClick = () => {
    currentClip.stop();
  }

  const onAnimButtonClick = ({ clip }) => {
    currentClip.stop();
    setCurrentClip(clip);
  }

  // 특정 인덱스(input value)로 이동
  // 구분을 위해 한 번만 재생
  const onPressEnter = (event) => {
    if (event.key === "Enter") {
      const targetIdx = parseInt(event.target.value % currentClip._clip.tracks[0].times.length);
      if (_.isFinite(targetIdx)) {
        setCurrentIndex(targetIdx);
        currentClip.reset();
        currentClip.setLoop(1, 1)
        const targetTime = parseFloat(currentClip._clip.tracks[0].times[targetIdx] / mixer.timeScale);
        mixer.setTime(targetTime);
      }
    }
  }

  useRendering({ id, inputUrl, setLoadedObj, mixer, setMixer })
  
  useReRendering({ mixer, loadedObj, setCurrentClip, setPossibleClips })
  
  return (
    <>
      <Title>Animating Sample</Title>
      <Input type='file' accept='.fbx' onChange={onFileChange}/>
      <RenderingDiv id='renderingDiv'></RenderingDiv>
      {currentClip &&
        (<ButtonContainer>
          <Button onClick={onResetButtonClick}>Reset</Button>
          <Button onClick={onBackwardButtonClick}>Backward</Button>
          <Button onClick={onForwardButtonClick}>Forward</Button>
          <Button onClick={onPauseButtonClick}>Pause</Button>
          <Button onClick={onStopButtonClick}>Stop</Button>
        </ButtonContainer>)}
      {currentClip && <Input onKeyPress={onPressEnter} />}
      {possibleClips.length !== 0 && 
        (<ButtonContainer>
          {possibleClips && 
            possibleClips.map((clip, index) => <Button onClick={() => onAnimButtonClick({ clip })} key={index}>{`Anim #${index + 1}`}</Button>)}
        </ButtonContainer>)}
    </>
  );
}

export default App;
