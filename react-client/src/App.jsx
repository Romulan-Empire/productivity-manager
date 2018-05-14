import { Provider } from 'react-redux'
import React from 'react';
import store from './store'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import MonitorContainer from './containers/MonitorContainer.jsx';
import DashboardContainer from './containers/DashboardContainer.jsx';

class App extends React.Component {
  
  render() {
    return(
      <div>  
      <MuiThemeProvider>
      <Provider store={store}>
        <MonitorContainer />
      </Provider>
      </MuiThemeProvider>

      <MuiThemeProvider>
      <Provider store={store}>
        <DashboardContainer />
      </Provider>
      </MuiThemeProvider>
      </div>
    )
  }
}

export default App;