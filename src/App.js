import React, { useState } from 'react'
import styled from 'styled-components'
import { useRendering } from './useRendering'

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

const id = 'renderingDiv'

const App = () => {
  const [inputUrl, setInputUrl] = useState(undefined);

  const onFileChange = (event) => {
    const file = event.target.files[0];
    const fileUrl = URL.createObjectURL(file);
    setInputUrl(fileUrl);
  }

  useRendering({ id, inputUrl })
  
  return (
    <>
      <Title>Animating Sample</Title>
      <Input type='file' accept='.fbx' onChange={onFileChange}/>
      <RenderingDiv id='renderingDiv'></RenderingDiv>
    </>
  );
}

export default App;
