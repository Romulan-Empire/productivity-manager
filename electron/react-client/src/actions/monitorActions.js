import { ipcRenderer } from 'electron';
import { TOGGLE_MONITOR, START_MONITOR, PAUSE_MONITOR } from './types';

export const startMonitor = (user, jwt) => {
  console.log('about to send this to activity monitor', JSON.stringify({user, jwt}))
  ipcRenderer.send('monitor', 'start', JSON.stringify({user, jwt}));
  return {
    type: START_MONITOR
  }
};

export const pauseMonitor = () => {
  ipcRenderer.send('monitor', 'pause');
  return {
    type: PAUSE_MONITOR
  }
};

export const toggleMonitor = (monitorRunning, user, jwt) => {
  monitorRunning ? ipcRenderer.send('monitor', 'pause') :
  ipcRenderer.send('monitor', 'start', JSON.stringify({user, jwt}));
  return {
    type: TOGGLE_MONITOR,
    payload: {monitorStatus}
  }
}