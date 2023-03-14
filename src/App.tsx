import { useRef, useState } from 'react';
import Three from './Three';

function App() {
  const [text, setText] = useState('')
  return (
    <>
      <Three text={text} setText={setText}/>
      <div style={{ position: 'absolute', bottom: 0, display: 'flex', justifyContent: 'center', width: '100%' }}>
        <h1>{text}</h1>
      </div>
    </>
  );
}

export default App;
