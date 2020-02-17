import React, { Component } from 'react';
import { VictoryChart, VictoryAxis, VictoryCandlestick, VictoryTheme } from 'victory';
import { Container } from 'react-bootstrap';
import AppToolbar from './AppToolbar';
import { getTokenList } from '../util';
import {queryDataBySymbolOnDateAndHour, getDecodedTransactionData} from '../utils/TransactionUtils';

const API_SERVER = process.env.REACT_APP_API_SERVER;

export default class Landing extends Component {
  constructor(props) {
    super(props);
    this.state = { chartData: [], viewMore: false, symbol: 'BTC', startDate: '' };
  }
  componentWillMount() {
    const self = this;
    const date = new Date();
    date.setHours(date.getHours() - 24);
    this.setState({ 'startDate': date });
    const { symbol } = this.state;
    this.getCandlestickData(symbol, date);
  }

  selectedTokenChanged = (evt) => {

    const TokenName = evt.target.value
    const self = this;
    this.setState({symbol: TokenName});
    const { symbol, startDate } = this.state;
    
    self.setState({ symbol: TokenName });
    this.getCandlestickData(symbol, startDate);
    
  }

  setQueryStart = (date) => {
    const self = this;
    this.setState({startDate: date});
    const { symbol, startDate } = this.state;
    this.getCandlestickData(symbol, startDate);
  }

  getCandlestickData = (symbol, date) => {

    const self = this;
    var easternTime = new Date(date).toLocaleString("en-US", {timeZone: "America/New_York"});
      
    easternTime = new Date(easternTime);
    
        var dd = easternTime.getDate();
        if (dd < "10") {
          dd = "0" + dd;
        }
        var mm = easternTime.getMonth() + 1;
        if (mm < 10) {
          mm = "0" + mm;
        }
        var yyyy = easternTime.getFullYear();
        const dateString = mm + '-' + dd + '-' + yyyy;
        let hour = easternTime.getHours();
    
      
      if (!symbol) {
        symbol = "BTC";
      }
      if (!dateString) {
        date = "01-10-2020";
      }
      if (!hour) {
        hour = "00";
      }
      

      queryDataBySymbolOnDateAndHour(symbol, dateString, hour).then(function(dataResponse) {
        if (dataResponse && dataResponse.length > 0) {
        getDecodedTransactionData(dataResponse).then(function(decodedData) {
          self.setState({chartData: decodedData[0]});
        });
        } else {
          self.setState({chartData: []});
        }
      });
  }
  
  showMoreItems = () => {
    this.setState({ viewMore: true });
  }
  
  showLessItems = () => {
    this.setState({ viewMore: false });
  }
  
  render() {
    let { chartData, viewMore, startDate } = this.state;
    const self = this;
    const tokenList = getTokenList();

    const styles = {
      chartContainer: {
        height: '400px',

      }
    }
    
    let chartOLCV = [];
    let chartSentiment = [];
    let chartSentimentLabel = <span/>;

    if (chartData && chartData.ticker) {
      chartOLCV = chartData.ticker.map(function(item) {
        return { x: item[0], open: item[1], high: item[2], low: item[3], close: item[4] };
      })
    }

    if (chartData && chartData.tweets && chartData.tweets.tweet_data) {
      let averageSentiment = 0;
      let tweetPreviewBlock = chartData.tweets.tweet_data.slice(0, 3);
      chartData.tweets.tweet_data.forEach(function(tItem) {
        averageSentiment += tItem.sentiment.score;
      });
      averageSentiment = averageSentiment / chartData.tweets.tweet_data.length;
      if (averageSentiment === 0 || isNaN(averageSentiment)) {
        averageSentiment = "-";
      }
      else {
        averageSentiment = averageSentiment.toFixed(2);
      }
      if (!viewMore) {
        chartSentiment =
          <div>
            {tweetPreviewBlock.map(function(tItem, tIdx) {

              return <div className="tweet-text-item" key={tItem.id + "-"+tIdx}>{tItem.text}</div>
            })}
            <div className="view-more-container" onClick={self.showMoreItems}>
              View More
            </div>
          </div>
      }
      else {
        chartSentiment =
          <div>
      {chartData.tweets.tweet_data.map(function(tItem, tIdx) {
        return <div className="tweet-text-item" key={tItem.id + "-"+tIdx}>{tItem.text}</div>
      })}
      <div className="view-more-container" onClick={self.showLessItems}>
        View Less
      </div>
      </div>
      }

      chartSentimentLabel = (
        <div className="chart-sentiment-label">
          <div className="label-text">Tweets</div>
          <div className="label-sentiment">Average Tweet Sentiment {averageSentiment > 0 ? "(+)" : "(-)"} {averageSentiment}</div>
        </div>
      )
    }

    return (
      <Container>
      <AppToolbar tokenList={tokenList} selectedTokenChanged={this.selectedTokenChanged} setQueryStart={this.setQueryStart}
      startDate={startDate}/>
      <div style={{'height': '400px', 'position': 'relative'}} className="data-vis-container">
        <div className="chart-twitter-container">
          {chartSentimentLabel}
          <div className="chart-sentiment-container">
            {chartSentiment}
          </div>
        </div>
        <div className="chart-graph-container">
        
          <VictoryChart theme={VictoryTheme.material} domainPadding={{ x: 25 }} scale={{ x: "time" }} height={200} style={{'marginTop': '-200px'}}>
            
            <VictoryAxis tickFormat={(t) => `${t.getHours()}:${t.getMinutes()}`}
            className="axis-label"
                          style={{
                axis: {stroke: "#756f6a"},
                axisLabel: {fontSize: 8, padding: 10},
                grid: { stroke: "none" },
                ticks: {stroke: "grey", size: 5},
                tickLabels: {fontSize: 8, padding: 2}
              }}
          />
            <VictoryAxis dependentAxis 
              style={{
                axis: {stroke: "#756f6a"},
                axisLabel: {fontSize: 12, padding: 10},
                grid: {stroke: ({ tick }) => tick > 0.5 ? "red" : "grey"},
                ticks: {stroke: "grey", size: 5},
                tickLabels: {fontSize: 8, padding: 2}
              }}
              />
            <VictoryCandlestick candleColors={{ positive: "#5cb85c", negative: "#c43a31" }} style={{'height': '400px'}}
           data={chartOLCV} />
          </VictoryChart>
        </div>
      </div>
      </Container>
    )
  }
}
