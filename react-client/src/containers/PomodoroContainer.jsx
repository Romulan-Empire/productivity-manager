import React from 'react';
import Paper from 'material-ui/Paper';
import {RadialBarChart, RadialBar, PieChart, Pie, Legend, Cell} from 'recharts';
import moment from 'moment';

class PomodoroContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pomStartTime: null, // maybe not super useful b/c user might pause 
      currentTime: null,
      currentSpurt: {
        type: 'work',
        startTime: null
      },
      completedSpurts: {
        work: null,
        shortBreaks: null,
        longBreaks: null
      },
      intervalId: null,
      data: [{name: 'Elapsed Time', value: 400},
             {name: 'Time Remaining', value: 300}]
    }
    this.elapseTime = this.elapseTime.bind(this);
    this.startTimer = this.startTimer.bind(this);
    this.finishSpurt = this.finishSpurt.bind(this);
  }

  elapseTime() {
    const [ elapsed, remaining ] = this.state.data;
    if (remaining.value === 0) {
      console.log('FINISHED POM SESSION:', this.state.currentSpurt.type);
      this.finishSpurt();
    } else {
      this.setState({
        currentTime: moment(),
        data: [{name: 'Elapsed Time', value: elapsed.value + 10},
               {name: 'Time Remaining', value: remaining.value - 10}]
      });
    }
  }

  startTimer() {
    this.setState({
      pomStartTime: this.state.pomStartTime || moment(),
      intervalId: setInterval(this.elapseTime, 200),
      currentSpurt: {
        type: this.state.currentSpurt.type,
        startTime: moment()
      }
    })
  }

  pauseTimer() {

  }

  restartTimer() {

  }

  finishSpurt() {
    clearInterval(this.state.intervalId);
    if (this.state.currentSpurt.type === 'work' ) {
      //add last spurt to completed
      this.setState({
        data: [{name: 'Elapsed Time', value: 400}, {name: 'Time Remaining', value: 300}],
        currentSpurt: {
          type: 'break',
          startTime: moment()
        }
      });
      this.startTimer()
    }
    //put current spurt data inside completed spurts
    //spin up the next spurt
      //if last spurt was work, start up a short or long break
        // depends on the number of work spurts % 4
      //if last spurt was break, start up a new work spurt
  }

  resetTimer() {
    //set everything to initial state
  }

  componentDidMount() {
    console.log('pomodoro mounted!');
  }

  render() {

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    const data02 = [{name: 'A1', value: 100},
    {name: 'A2', value: 300},
     {name: 'B1', value: 100},
     {name: 'B2', value: 80},
     {name: 'B3', value: 40},
     {name: 'B4', value: 30},
     {name: 'B5', value: 50},
     {name: 'C1', value: 100},
     {name: 'C2', value: 200},
     {name: 'D1', value: 150},
     {name: 'D2', value: 50}]
    
    const style = {
      top: 0,
      left: 350,
      lineHeight: '24px'
    };

    return (
      <Paper style={stylePaper}>
        <pre>pom was started at time {JSON.stringify(this.state.pomStartTime)}</pre>
        <pre>pom's current spurt is {JSON.stringify(this.state.currentSpurt)}</pre>
        <pre>pom's data is {JSON.stringify(this.state.data)}</pre>
        <PieChart width={800} height={400}>
          <Pie dataKey="value" data={data02} cx={200} cy={200} outerRadius={60} fill="#8884d8" paddingAngle={5}>
          {
          	data02.map((entry, index) => <Cell fill={COLORS[index % COLORS.length]} key={index}/>)
          }
          </Pie>
          <Pie dataKey="value" data={this.state.data} cx={200} cy={200} innerRadius={70} outerRadius={90} fill="#82ca9d" label>
            <Cell fill={'#00C49F'}/>
            <Cell fill={'#ffffff'}/>
          </Pie>
        </PieChart>
        <button onClick={this.startTimer}>start timer</button>
      </Paper>
    )
  }

}

let stylePaper = {
  background: '#EEE',
  padding: '15px',
  minHeight: '425px'
};

export default PomodoroContainer;