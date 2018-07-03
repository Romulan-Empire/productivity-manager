import { connect } from 'react-redux';
import React from 'react';

import { changeCategory, deleteActivity, affirmCategorization } from '../actions/activityActions'
import ProductivityScore from './ProductivityScore.jsx';
import ActivityGroup from '../components/DashboardView/ActivityGroup.jsx';

import Paper from 'material-ui/Paper';

class DashboardContainer extends React.Component {
  constructor(props) {
    super(props);
  }
  
  render() {
    const { activities, changeCategory, deleteActivity, preferences, user, affirmCategorization } = this.props;
    
    return (
      <div style={{margin: '0px', background: 'white'}}>
        <Paper zDepth={1} style={{display: 'inline-block', background: 'white', margin: '0px', padding: '0px', width: '75%', minHeight: '500px', maxHeight: '700px', verticalAlign: 'top'}}>
          <ActivityGroup
            category='productive'
            activities={activities.productive}
            changeCategory={changeCategory}
            deleteActivity={deleteActivity}
            preferences={preferences}
            user={user}
            affirmCategorization={affirmCategorization}
          />
          <ActivityGroup
            category='neutral'
            activities={activities.neutral}
            changeCategory={changeCategory}
            deleteActivity={deleteActivity}
            preferences={preferences}
            user={user}
            affirmCategorization={affirmCategorization}
          />
          <ActivityGroup
            category='distracting'
            activities={activities.distracting}
            changeCategory={changeCategory}
            deleteActivity={deleteActivity}
            preferences={preferences}
            user={user}
            affirmCategorization={affirmCategorization}
          />
        </Paper>
        <Paper zDepth={1} style={{borderRadius: '15 15 15 15', display: 'inline-block', background: 'white', margin: '0', padding: '90px 0px 0px 0px', width: '25%', height: '450px', verticalAlign: 'top'}}>
          <ProductivityScore 
            activities={activities}
          />
        </Paper>
      </div>
    )
  }
};

const mapStateToProps = (state) => ({
  activities: state.activities,
  preferences: state.preferences,
  user: state.user
});

const mapDispatchToProps = (dispatch) => {
  return {
    changeCategory: (activity, oldCat, newCat, isTracked, user, wasML) => {
      if (oldCat !== newCat) {
        dispatch(changeCategory(activity, oldCat, newCat, isTracked, user, wasML))
      };
    },
    deleteActivity: (activity, category, isTracked, user) => {
      dispatch(deleteActivity(activity, category, isTracked, user));
    },
    affirmCategorization: (activity, category, isTracked, user) => {
      dispatch(affirmCategorization(activity, category, isTracked, user))
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DashboardContainer);

