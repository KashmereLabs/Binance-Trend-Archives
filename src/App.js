import React from 'react';
import logo from './logo.svg';
import TopNav from './components/nav/TopNav';
import './App.css';

import Landing from './components/Landing';

function App() {

  return (
    <div className="App">
      <TopNav/>
      <Landing/>
    </div>
  );
}

export default App;
