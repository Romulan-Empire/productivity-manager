import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import momentFormat from 'moment-duration-format';
import { DragSource } from 'react-dnd';

import { ItemTypes } from '../../constants.js';

import Paper from 'material-ui/Paper';
import Divider from 'material-ui/Divider';
import RaisedButton from 'material-ui/RaisedButton';
import TrendingIcon from 'material-ui/svg-icons/action/trending-up';
import FontIcon from 'material-ui/FontIcon';
import ActionAndroid from 'material-ui/svg-icons/action/android';
import DeleteIcon from 'material-ui/svg-icons/action/delete';
import CheckMarkIcon from 'material-ui/svg-icons/action/done';

const cardSource = {
  beginDrag(props) {
    return {
      activity: props.activity,
      oldCategory: props.category
    };
  }
};

const collect = (connect, monitor) => {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  }
}

const insertColorIntoStyle = (category) => {
  let color = {
    'productive': '#43A047',
    'neutral': '#FFB300',
    'distracting': '#F4511E'
  }

  let style = {
    color: color[category],
    fontWeight: 'bolder'
  }

  return style;
}

const prettifier = (text) => {
  let results = text;

  if (results.length >= 55) {
    results = results.slice(0, 52) + '...';
  }

  if (text === ' ') {
    return 'miscellaneous';
  }
  
  return results;
}

const ActivityCard = (props) => {
  const { activity, category, deleteActivity, index, preferences, user, affirmCategorization } = props;
  
  let formattedDuration = moment.duration(activity.duration, "seconds").format("h[h] m[m] s[s]");

  let coreStyle = {
    font: 'Roboto', 
    padding: '10px 15px 15px 5px',
    margin: '0px 8x 0px 8px',
    textAlign: 'left',
    background: 'white',
    color: 'black',
    fontSize: '80%',
  };

  let colorMap = {
    'productive': {tick: '#DCEDC8', tock: '#C5E1A5' },
    'neutral': {tick: '#FFF9C4', tock: '#FFF59D' },
    'distracting': {tick: '#FFCCBC', tock: '#FFAB91'}
  }

  if (index % 2 === 0) {
    coreStyle.background = colorMap[category]['tick'];
  } else {
    coreStyle.background = colorMap[category]['tock'];
  }

  const { connectDragSource, isDragging } = props;

  let isTracked;
  if (preferences.trackedApps.includes(activity.app)) {
    isTracked = true;
  } else {
    isTracked = false;
  }

    return connectDragSource(
      <div> 
        <Paper
          key={activity.title + index}
          style={coreStyle}
          zDepth={1}
        >
          <div style={{fontSize: '105%'}}>
            <b>{activity.app}</b>
            <i style={{float: 'right'}}>{formattedDuration}</i> 
          </div>

          <div style={{margin: '5px 0px 10px 0px'}}>
            <Divider style={{float: 'right', width: '100%', background: '#A5A5A5'}}/>
          </div>

          <div style={{fontSize: '115%'}}>
            {isTracked ? prettifier(activity.title) : 'Application'} <br/>
          </div>

          <div style={{float: 'right', margin: '5px 0px 5px 0px'}}>
            <DeleteIcon 
              style={{color: '#777', top: '-8', position: 'relative'}}
              onClick={() => {deleteActivity(activity, category, isTracked, user)}} 
            />
          </div>

          <div style={{marginTop: '5px'}}>
            {activity.productivity.source === 'ml' 
            ? <div>
                <i style={insertColorIntoStyle(category)}>Suggested By Thyme.ly</i>&nbsp;
                <CheckMarkIcon style={{position: 'relative', top: '5'}} onClick={() => {affirmCategorization(activity, category, isTracked, user)}}/>
              </div> 
            : <div>&nbsp;<br/></div>}
          </div>

        </Paper>
      </div>
    )
}

ActivityCard.propTypes = {
  activity: (props, propName, componentName) => {
    if (typeof props.activity.productivity !== 'object') {
      return new Error(`
        Required prop "productivity" was not an object, instead it was ${props.activity.productivity}
      `)
    }
  }
};

export default DragSource(ItemTypes.CARD, cardSource, collect)(ActivityCard);