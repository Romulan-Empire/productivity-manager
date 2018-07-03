import { Provider } from 'react-redux'
import React from 'react';
import store from './store';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Paper from 'material-ui/Paper';
import SwipeableViews from 'react-swipeable-views';
import { ipcRenderer } from 'electron';

import MonitorContainer from './containers/MonitorContainer.jsx';
import DashboardContainer from './containers/DashboardContainer.jsx';
import AnalyticsContainer from './containers/AnalyticsContainer.jsx';
import PomodoroContainer from './containers/PomodoroContainer.jsx';
import ViewSelector from './components/ViewSelector.jsx';
import SettingsContainer from './containers/SettingsContainer';

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      tabIndex: 0
    }

    this.handleTabChange = this.handleTabChange.bind(this);
  }

  handleTabChange(tabIndex) {
    this.setState({
      tabIndex: tabIndex
    })
  }
  
  render() {
    return(
    <MuiThemeProvider>
      <Paper style={{background: 'white'}}>  
      
        <Provider store={store}>
          <ViewSelector tabIndex={this.state.tabIndex} handleTabChange={this.handleTabChange} />
        </Provider>
      
      <Provider store={store}>
        <SwipeableViews index={this.state.tabIndex}>
          <div>
            <DashboardContainer />
          </div>
        
          <div>
            <AnalyticsContainer />
          </div>
          
          <div>
            <PomodoroContainer />
          </div>

          <div>
            <SettingsContainer />
          </div>
        </SwipeableViews>
      </Provider>

      <Provider store={store}>
        <MonitorContainer />
      </Provider>
      
      </Paper>
    </MuiThemeProvider>
    )
  }
}

export default DragDropContext(HTML5Backend)(App);