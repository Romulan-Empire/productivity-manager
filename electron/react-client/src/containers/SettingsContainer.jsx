import { connect } from 'react-redux';
import React from 'react';

import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import Slider from 'material-ui/Slider';
import RaisedButton from 'material-ui/RaisedButton';
import SendIcon from 'material-ui/svg-icons/content/send';

import { setPomPrefs } from '../actions/pomodoroActions.js';

const msToMinutes = (ms) => {
  return parseInt((ms / 1000 / 60), 10);
};

const minutesToMs = (minutes) => minutes * 60 * 1000;

class SettingsContainer extends React.Component {
  constructor(props) {
    super(props);
    const { prefs } = props.pomodoro;
    this.state = {
      workLength: msToMinutes(prefs.workLength),
      shortBreakLength: msToMinutes(prefs.shortBreakLength),
      longBreakLength: msToMinutes(prefs.longBreakLength),
      spurtsBeforeLongBreak: prefs.spurtsBeforeLongBreak,
      pomSessionsPerDay: prefs.pomSessionsPerDay
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit() {
    if (this.props.pomodoro.status !== 'not started') {
      alert('Please clear pomodoro timer before changing pomodoro sessions!');
      return;
    }
    this.props.setPomPrefs({
      workLength: minutesToMs(this.state.workLength),
      shortBreakLength: minutesToMs(this.state.shortBreakLength),
      longBreakLength: minutesToMs(this.state.longBreakLength),
      spurtsBeforeLongBreak: this.state.spurtsBeforeLongBreak,
      pomSessionsPerDay: this.state.pomSessionsPerDay
    });
    alert('Your pomodoro timer preferences have been updated.')
  }

  handleChange(attr, value) {
    this.setState({
      [attr]: value
    });
  }

  render() {
    return (
      <div style={{padding: '15px'}}>
      <Paper style={{width: '350px', padding: '15px', fontWeight: 'bold', maxHeight: '450px', overflowY: 'scroll'}}>
        <h2><b>Your Pomodoro Settings</b></h2>
        <br/>
        Work Spurt Length (Minutes): &nbsp;{this.state.workLength}
        <Slider name="workLength" defaultValue={this.state.workLength} value={this.state.workLength} step={1}
                onChange={(e, val) => this.handleChange('workLength', val)} min={1} max={60}/>
        <br/>
        Short Break Length (Minutes): &nbsp;{this.state.shortBreakLength}
        <Slider name="shortBreakLength" defaultValue={this.state.shortBreakLength} value={this.state.shortBreakLength} step={1}
                onChange={(e, val) => this.handleChange('shortBreakLength', val)} min={1} max={30}/>
        <br/>
        Long Break Length (Minutes): &nbsp;{this.state.longBreakLength}
        <Slider name="longBreakLength" defaultValue={this.state.longBreakLength} value={this.state.longBreakLength} step={1}
                onChange={(e, val) => this.handleChange('longBreakLength', val)} min={1} max={60}/>
        <br/>
        Spurts Before Long Break: &nbsp;{this.state.spurtsBeforeLongBreak}
        <Slider name="spurtsBeforeLongBreak" defaultValue={this.state.spurtsBeforeLongBreak} value={this.state.spurtsBeforeLongBreak} step={1}
                onChange={(e, val) => this.handleChange('spurtsBeforeLongBreak', val)} min={1} max={20}/>
        <br/>
        Pomodoro Sessions Per Day: &nbsp;{this.state.pomSessionsPerDay}
        <Slider name="pomSessionsPerDay" defaultValue={this.state.pomSessionsPerDay} value={this.state.pomSessionsPerDay} step={1}
                onChange={(e, val) => this.handleChange('pomSessionsPerDay', val)} min={1} max={10}/><br />
      </Paper>
      <br/>
      <RaisedButton label="Submit" icon={<SendIcon/>} onClick={this.handleSubmit}/>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  pomodoro: state.pomodoro
});

const mapDispatchToProps = (dispatch) => {
  return {
    setPomPrefs: (prefs) => {dispatch(setPomPrefs(prefs))}
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(SettingsContainer);