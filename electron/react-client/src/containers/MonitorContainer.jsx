import React from 'react';
import { connect } from 'react-redux';
import { ipcRenderer } from 'electron';
import axios from 'axios';

import Paper from 'material-ui/Paper';
import AppBar from 'material-ui/AppBar';
import FlatButton from 'material-ui/FlatButton';
import Divider from 'material-ui/Divider';
import RaisedButton from 'material-ui/RaisedButton';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import PlayButton from 'material-ui/svg-icons/av/play-arrow';
import PauseButton from 'material-ui/svg-icons/av/pause';
import SendIcon from 'material-ui/svg-icons/content/send';
import Snackbar from 'material-ui/Snackbar';

import { addActivity, patchActivity, setAllActivities } from '../actions/activityActions.js';
import { setUser, setToken, setJWT } from '../actions/userActions.js';
// import { listEvents } from '../index.jsx';
import { startMonitor, pauseMonitor, toggleMonitor } from '../actions/monitorActions.js';

class MonitorContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showPlayButton: true,
      slideIndex: 0
    }

    this.checkState = this.checkState.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handlePlayButtonChange = this.handlePlayButtonChange.bind(this);
    this.logout = this.logout.bind(this);
  }

  componentDidMount() {
    ipcRenderer.on('sqlActivities', (event, message) => {
      this.props.setAllActivities(message)
    });

    ipcRenderer.on('activity', (event, message) => {
      let isTracked = this.props.preferences.trackedApps.includes(message.app)
      let inState = this.checkState(message, isTracked);
      this.props.activityHandler(message, inState);
    });
    
    ipcRenderer.once("windowClose", (event, message) => {
      let store = JSON.stringify({
        activities: this.props.activities,
        preferences: this.props.preferences
      })
      event.sender.send("store", store)
    });

    ipcRenderer.on('system', (event, message) => {
      if (message === 'sleep') {
        this.props.pauseMonitor();
      }
      else if (message === 'resume') {
        this.props.startMonitor(this.props.user.user, this.props.user.jwt);
      };
    });

    ipcRenderer.send('cookies', 'check');

    ipcRenderer.on('cookies', (event, message) => {
      console.log('cookies message inside monitor container is', message);
      console.log('parsed message is', JSON.parse(message.value))
      console.log('user is', JSON.parse(message.value).user)
      const {user, jwt} = JSON.parse(message.value);
      this.props.setUser(user);
      this.props.setJWT(jwt);
      if (message.value) this.props.startMonitor(user, jwt);
    });

    ipcRenderer.send('token', 'check');

    ipcRenderer.on('token', (event, message) => {
      if(message.length > 0){
        this.props.setToken(message[0].value);
        listEvents(message[0].value)
      }
    });
    

    ipcRenderer.on('add-idle-activity', (event, message) => {
      this.props.activityHandler(message, this.checkState(message, true));
    })
  }

  logout() {
    ipcRenderer.send('cookies', 'logout');
  }

  handleChange(value) {
    this.setState({
      slideIndex: value,
    });
  }

  handlePlayButtonChange() {
    console.error('clicked!');
    if (this.props.monitor.running) {
      this.props.pauseMonitor();
    } else {
      const {user, jwt} = this.props.user;
      this.props.startMonitor(user, jwt);
    }
  }

  checkState (data, isTracked) {
    for (let category in this.props.activities) {
      let activities = this.props.activities[category]
      for (let i = 0; i < activities.length; i++) {
        let inState = (isTracked) ? 
                    activities[i].title === data.title && activities[i].app === data.app : 
                    activities[i].app === data.app
        if (inState) {
          return {
            'activity': activities[i],
            'productivity': category,
            'index': i
          }
        }
      }
    }
    return false;
  }

  render() {
    return (
      <Paper zDepth={2} style={bottomBarStyle}>
        <FlatButton 
          label="Logout & Quit" 
          hoverColor="#64B5F6"
          onClick={this.logout} 
          style={{position: 'relative', top: '8px', marginLeft: '10px'}}
          labelStyle={{font: 'Tahoma', color: 'white', fontWeight: 'bold'}}
        />
        
        <RaisedButton 
          label={this.props.monitor.running ? "Pause" : "Play"}
          labelStyle={{fontWeight: 'bold', font: 'Garamond'}}
          icon={this.props.monitor.running ? <PauseButton /> : <PlayButton />} 
          style={{float: 'right', position: 'relative', top: '8px', marginRight: '10px', background: '#2196F3'}}
          buttonStyle={{borderRadius: '8px', background: '#64B5F6'}}
          onClick={this.handlePlayButtonChange} 
        />
        <div style={{float: 'right', marginRight: '10px', position: 'relative', top: '15px', 
                      color: 'white', font: 'Tahoma', fontWeight: 'bold'}}>
          {
            this.props.monitor.running 
            ? <b>Tracker Is Running</b>
            : <b>Tracker is Paused</b>
          }
        </div>
       
      </Paper>
    )
  }
}

const bottomBarStyle = {
  background: '#2196F3',
  height: '50px',
  marginTop: '10px',
}

const mapStateToProps = state => ({
  monitor: state.monitor,
  activities: state.activities,
  preferences: state.preferences,
  user: state.user,
  token: state.token
});

const mapDispatchToProps = dispatch => {
  return {
    activityHandler: (data, inState) => {
      if (inState) dispatch(patchActivity(inState, data))
      else dispatch(addActivity(data))
    },
    setAllActivities: (data) => {
      dispatch(setAllActivities(data));
    },
    setUser: (user) => {
      dispatch(setUser(user))
    },
    setToken: (token) => {
      dispatch(setToken(token))
    },
    setJWT: (jwt) => {
      dispatch(setJWT(jwt))
    },
    startMonitor: (user, jwt) => {
      dispatch(startMonitor(user, jwt))
    },
    pauseMonitor: () => {
      dispatch(pauseMonitor())
    }, 
    toggleMonitor: () => {
      dispatch(toggleMonitor(user, jwt));
    } 
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(MonitorContainer);

const styles = {
  headline: {
    fontSize: 24,
    paddingTop: 16,
    marginBottom: 12,
    fontWeight: 400,
  },
  slide: {
    padding: 10,
  },
};
