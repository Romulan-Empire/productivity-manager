import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import ProductivityScore from '../../containers/ProductivityScore.jsx';
import {changeCategory} from '../../actions/activityActions';

import Paper from 'material-ui/Paper';
import Divider from 'material-ui/Divider';
import RaisedButton from 'material-ui/RaisedButton';
import Chip from 'material-ui/Chip';

const ipc = require('electron').ipcRenderer;
ipc.on('ping', (event, message) => {
  console.log(message);
})

  const showCategoryHeader = () => {

    let categoryStyle;

    if (category === 'productive') {
      categoryStyle = styleCategoryHeaderA;
    } else if (category === 'neutral') {
      categoryStyle = styleCategoryHeaderB;
    } else { //category === 'distracting'
      categoryStyle = styleCategoryHeaderC;
    }

    return(
      <Paper style={categoryStyle} >
        {category[0].toUpperCase() + category.slice(1, category.length)}
      </Paper>
    )
  }

  return (
    <div>      
      {showCategoryHeader()}

      <div style={{minHeight: '425px', maxHeight: '425px', overflowY: 'scroll'}}>
        {activities[category].map((activity, index) => {

        let duration = moment
          .duration(
            moment(activity.endTime, "MMMM Do YYYY, h:mm:ss a")
            .diff(moment(activity.startTime, "MMMM Do YYYY, h:mm:ss a"))
          )
          .asSeconds();

const renderActivities = (category, activities) => {
  return (
    <div>

      <Paper 
        style={
          {font: 'Open Sans', 
          background: '#00BCD4', 
          padding: '10px 5px 10px 5px',
          textAlign: 'center',
          color: 'white',
          fontWeight: 'bolder',
          fontSize: '115%'}}
      >
        {category[0].toUpperCase() + category.slice(1, category.length)}
      </Paper>
      {activities[category].map((activity, index) => {
        // let duration = moment
        //   .duration(
        //     moment(activity.endTime, "MMMM Do YYYY, h:mm:ss a")
        //     .diff(moment(activity.startTime, "MMMM Do YYYY, h:mm:ss a"))
        //   )
        //   .asSeconds();

        let styleTick = {
          font: 'Arial', 
          //background: '#E8F5E9', 
          background: '#EEE',
          padding: '10px 5px 10px 5px',
          margin: '0px 0px 10px 0px',
          textAlign: 'left',
          color: 'black',
          fontSize: '80%',
        }
        let styleTock = {
          font: 'Arial', 
          // background: '#C8E6C9', 
          background: '#CCC',
          padding: '10px 5px 10px 5px',
          margin: '0px 0px 10px 0px',
          textAlign: 'left',
          color: 'black',
          fontSize: '80%',
        }
        return (
          <Paper
            key={activity.title + index}
            style={index % 2 === 0 ? styleTick : styleTock}
          >
            <b>{activity.app}</b> <br/>
            {activity.title} <br/>

        {/* <div style={{margin: '5px 0px 0px 0px'}}>{duration + ' seconds'} </div>*/}

  

            <br/>
            <button name="productive" onClick={(e) => {
                changeCategory(activity.id, category, 'productive')}
              }>productive</button>
            <button onClick={() => {changeCategory(activity.id, category, 'neutral')}}>neutral</button>
            <button onClick={() => {changeCategory(activity.id, category, 'distracting')}}>distracting</button>

          </Paper>
        )
      })}
      </div>
    </div>
  );
}

const Activity = ({ activities, clickHandler }) => {
  const style = {
    margin: '8px',
    padding: '10px',
    width: 'calc(25% - 16px)',
    float: 'left',
    verticalAlign: 'top',
    minHeight: '525px',
    maxHeight: '525px',
  }

  return (
    <div>
      <Paper style={style}>
        {renderActivities('productive', activities, clickHandler)}
      </Paper>
      <Paper style={style}>
        {renderActivities('neutral', activities, clickHandler)}
      </Paper>
      <Paper style={style}>
        {renderActivities('distracting', activities, clickHandler)}
      </Paper>
      <Paper style={style}>
        <ProductivityScore />
      </Paper>
    </div>
  )
}
          
  let styleCategoryHeaderA = {
    font: 'Open Sans', 
    background: '#4CAF50', 
    padding: '10px 5px 10px 5px',
    textAlign: 'center',
    color: 'white',
    fontSize: '115%',
    margin: '0px 0px 15px 0px'
  };

  let styleCategoryHeaderB = {
    font: 'Open Sans', 
    background: '#4DB6AC', 
    padding: '10px 5px 10px 5px',
    textAlign: 'center',
    color: 'white',
    fontSize: '115%',
    margin: '0px 0px 15px 0px'
  };

  let styleCategoryHeaderC = {
    font: 'Open Sans', 
    background: '#FF7043', 
    padding: '10px 5px 10px 5px',
    textAlign: 'center',
    color: 'white',
    fontSize: '115%',
    margin: '0px 0px 15px 0px'
  };

const mapStateToProps = state => ({
  activities: state.activities
})

const mapDispatchToProps = (dispatch) => {
  return {
    clickHandler: (id, oldCat, newCat) => {
      if (oldCat !== newCat) dispatch(changeCategory(id, oldCat, newCat));
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Activity) 
