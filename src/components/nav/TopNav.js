import React, { Component } from 'react';
import { Nav } from 'react-bootstrap';

export default class TopNav extends Component {
  render() {
    return (
      <Nav
      activeKey="/home"
      onSelect={selectedKey => alert(`selected ${selectedKey}`)} className="app-top-nav">
        <Nav.Item>
          <Nav.Link href="/home" style={{"color": "#f5f5f5"}}>Binance Trend Archives</Nav.Link>
        </Nav.Item>

      </Nav>

    )
  }
}
