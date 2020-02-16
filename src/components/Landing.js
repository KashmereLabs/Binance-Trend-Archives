import React, { Component } from 'react';
import { VictoryChart, VictoryAxis, VictoryCandlestick, VictoryTheme, VictoryLine } from 'victory';
import axios from 'axios';
import { Container } from 'react-bootstrap';
import AppToolbar from './AppToolbar';
import { getTokenList } from '../util';

const API_SERVER = process.env.REACT_APP_API_SERVER;

export default class Landing extends Component {
  constructor(props) {
    super(props);
    this.state = { chartData: [], viewMore: false, symbol: 'BTC' };
  }
  componentWillMount() {
    const self = this;
    const date = new Date();
    date.setHours(date.getHours() - 8);
    this.setState({ 'startDate': date });
    const { symbol } = this.state;
    axios.get(`${API_SERVER}/query/time_series_symbol_on_date_time?date=${date}&symbol=${symbol}`).then(function(dataResponse) {
      self.setState({ chartData: dataResponse.data.data ? dataResponse.data.data[0] : [] });
    });
  }

  selectedTokenChanged = (evt) => {
    const TokenName = evt.target.value
    const self = this;
    self.setState({ symbol: TokenName });
    axios.get(`${API_SERVER}/query/time_series?symbol=${TokenName}`).then(function(dataResponse) {
      self.setState({ chartData: dataResponse.data.data[dataResponse.data.data.length - 1] });
    })
  }

  setQueryStart = (date) => {
    const self = this;
    const { symbol } = this.state;

    axios.get(`${API_SERVER}/query/time_series_symbol_on_date_time?date=${date}&symbol=${symbol}`).then(function(dataResponse) {
      self.setState({ chartData: dataResponse.data.data ? dataResponse.data.data[0] : [] });
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
