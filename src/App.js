import React, { useState } from 'react'
import styled from 'styled-components'
import { useRendering } from './useRendering'
import { useReRendering } from './useReRendering'

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

  const onStopButtonBlick = () => {
    currentClip.stop();
  }

  const onAnimButtonClick = ({ clip }) => {
    console.log(clip._clip.name)
    currentClip.stop();
    setCurrentClip(clip);
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
          <Button onClick={onStopButtonBlick}>Stop</Button>
        </ButtonContainer>)}
      {possibleClips.length !== 0 && 
        (<ButtonContainer>
          {possibleClips && 
            possibleClips.map((clip, index) => <Button onClick={() => onAnimButtonClick({ clip })} key={index}>{`Anim #${index + 1}`}</Button>)}
        </ButtonContainer>)}
    </>
  );
}

export default App;
