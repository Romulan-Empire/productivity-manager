import { connect } from 'react-redux';
import React from 'react';
import Paper from 'material-ui/Paper';
import { Tabs, Tab } from 'material-ui/Tabs';
import { PieChart, Pie, Label } from 'recharts';
import { RadialBar, RadialBarChart, Legend } from 'recharts';
import { LineChart, XAxis, CartesianGrid, Line, Tooltip } from 'recharts';

import ChartTopRankings from '../components/AnalyticsView/ChartTopRankings.jsx';
import ActivityRadarChart from '../components/AnalyticsView/ActivityRadarChart.jsx';
import ActivityTreeMap from '../components/AnalyticsView/ActivityTreeMap.jsx';

class AnalyticsContainer extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {    
    const style = {
      top: 0,
      left: 350,
      lineHeight: '24px'
    };

    return (
      <div style={{padding: '15px', marginBottom: '15px'}}>

      <Tabs inkBarStyle={{background: '#2196F3'}} style={{height: '55px', width: '350px'}}>
        <Tab label='Pie Chart' style={styleRoot} buttonStyle={styleButton}>
          <ChartTopRankings activities={this.props.activities} />
        </Tab>

        <Tab label='Radar Chart' style={styleRoot} buttonStyle={styleButton}>
          <ActivityRadarChart activities={this.props.activities} />
        </Tab>

        <Tab label="Tree Map" style={styleRoot} buttonStyle={styleButton}>
          <ActivityTreeMap activities={this.props.activities} />
        </Tab>

      </Tabs>

      </div>
    )
  }

}

const styleRoot = {
  background: 'white',
  padding: '0px 3px 0px 3px',
  height: '25px'
};

const styleButton = {
  color: 'white',
  
  background: '#333', 
  fontWeight: 'bold', 
  fontSize: '80%', 
  height: '25px'
};

const stylePaper = {
  background: 'white',
  padding: '15px',
};

const mapStateToProps = (state) => {
  return {
    activities: state.activities
  }
}

const mapDispatchToProps = (dispatch) => {
  return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(AnalyticsContainer);

