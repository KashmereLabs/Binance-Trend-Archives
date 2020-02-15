import React, { Component } from 'react';
import { Form, Col } from 'react-bootstrap';
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

export default class AppToolbar extends Component {

  constructor(props) {
    super(props);
    let dateNow = this.props.startDate;

    dateNow.setHours(dateNow.getHours() + Math.round(dateNow.getMinutes() / 60));
    dateNow.setMinutes(0);
    this.state = { startDate: dateNow };
  }

  setStartDate = (val) => {
    const self = this;
    this.setState({ startDate: val }, function() {
      self.props.setQueryStart(val);
    });
  }

  render() {
    const { tokenList } = this.props;
    let tokenListOptions = [];
    if (tokenList.length > 0) {
      tokenListOptions =
        tokenList.map(function(item) {
          return <option value={item} key={`token-${item}`}>{item}</option>
        })
    }
    return (
      <div className="toolbar-container">
        <div className="desktop-toolbar">
          <div className="token-select-header">
            <Form.Control as="select" className="toolbar-select" onChange={this.props.selectedTokenChanged}>
              {tokenListOptions}          
            </Form.Control>
          </div>
          <div className="toolbar-data-range">
            <DatePicker
              selected={this.state.startDate}
              onChange={date => this.setStartDate(date)}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={60}
              timeCaption="time"
              dateFormat="MMMM d, yyyy h:mm aa"
            />
          </div>
        </div>
        
        <div className="mobile-toolbar">
                    <div className="toolbar-data-range">
            <DatePicker
              selected={this.state.startDate}
              onChange={date => this.setStartDate(date)}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={60}
              timeCaption="time"
              dateFormat="MMMM d, yyyy h:mm aa"
            />
          </div>
          
          <div className="token-select-header">
            <Form.Control as="select" className="toolbar-select" onChange={this.props.selectedTokenChanged}>
              {tokenListOptions}          
            </Form.Control>
          </div>
        </div>
        
        
      </div>
    )
  }
}
