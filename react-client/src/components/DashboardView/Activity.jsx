import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import ProductivityScore from '../../containers/ProductivityScore.jsx';

import Paper from 'material-ui/Paper';
import Divider from 'material-ui/Divider';
import RaisedButton from 'material-ui/RaisedButton';
import Chip from 'material-ui/Chip';

const renderActivities = (category, activities) => {

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
            <div style={{margin: '5px 0px 0px 0px'}}>{duration + ' seconds'} </div>
            <br/>
            <button>productive</button> <button>neutral</button> <button>distracting</button>
          </Paper>
        )
      })}
      </div>
    </div>
  );
}

const Activity = ({activities}) => {

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
        {renderActivities('productive', activities)}
      </Paper>
      <Paper style={style}>
        {renderActivities('neutral', activities)}
      </Paper>
      <Paper style={style}>
        {renderActivities('distracting', activities)}
      </Paper>
      <Paper style={style}>
        <ProductivityScore />
      </Paper>
    </div>
  )
}


const mapStateToProps = state => ({
  activities: state.activities
})

export default connect(mapStateToProps)(Activity) 