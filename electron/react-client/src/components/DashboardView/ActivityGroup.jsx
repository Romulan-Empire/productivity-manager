import React from "react";
import moment from "moment";
import momentFormat from "moment-duration-format";
import { DropTarget } from "react-dnd";

import { ItemTypes } from "../../constants.js";
import ActivityCard from "./ActivityCard.jsx";

import Paper from "material-ui/Paper";
import Divider from "material-ui/Divider";
import RaisedButton from "material-ui/RaisedButton";

const comparisonTarget = {
  drop(props, monitor) {
    const { activity, oldCategory } = monitor.getItem();
    const isTracked = props.preferences.trackedApps.includes(activity.app);
    const newCategory = props.category;
    const wasML = activity.productivity.source === 'ml';
    const user = props.user
    props.changeCategory(activity, oldCategory, newCategory, isTracked, user, wasML);
  }
};

const collect = (connect, monitor) => {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver()
  };
};

const ActivityGroup = props => {
  const {
    connectDropTarget,
    isOver,
    category,
    activities,
    changeCategory,
    deleteActivity,
    style,
    preferences,
    user,
    affirmCategorization
  } = props;
  const sortedActivities = [...activities].sort(
    (a, b) => b.duration - a.duration
  );
  return connectDropTarget(
    <div
      style={{
        background: 'white',
        width: "31%",
        height: "100%",
        display: "inline-block",
        verticalAlign: "top",
        margin: '8px'
      }}
    >
      <Paper style={{background: 'white', margin: '0px 0px 5px 0px'}}>
        <Paper zDepth={2} style={styleMap[category]}>
          {category[0].toUpperCase() + category.slice(1, category.length)}
          <span
            style={{
              fontStyle: "italic"
            }}
          >
            <br/>
            {getTotalDuration(activities)}
          </span>
        </Paper>  
                                
        <Paper zDepth={1} style={pickBetweenThreeStyles(category)}>
          {sortedActivities.map((activity, index) => {
            return (
              <ActivityCard
                key={activity + index + Math.random() * 10}
                activity={activity}
                index={index}
                category={category}
                changeCategory={changeCategory}
                deleteActivity={deleteActivity}
                preferences={preferences}
                user={user}
                affirmCategorization={affirmCategorization}
              />
            );
          })}
        </Paper>

        <Paper zDepth={1} style={
          function inlineStyle() {
            let style = {
              font: "Open Sans",
              background: "black",
              padding: "10px 5px 10px 5px",
              textAlign: "center",
              color: "white",
              fontWeight: "bolder",
              onMouseOver: "#FFF",
              borderRadius: "0px 0px 15px 15px"
            }

            style.background = colorBgMap[category];
            return style;
          }()
        }>
        </Paper>
      </Paper>
    </div>
  );
};

const colorBgMap = {
  productive: '#258039',
  neutral: '#F5BE41',
  distracting: '#CF3721'
}

const colorMap = {
  productive: '#F1F8E9',
  neutral: '#FFFDE7',
  distracting: '#FBE9E7'
}

const getTotalDuration = activities => {
  let duration = 0;
  activities.forEach(activity => {
    duration += activity.duration;
  });
  let formatDuration = moment
    .duration(duration, "seconds")
    .format("h[h], m[m] s[s]");
  return formatDuration;
};

const pickBetweenThreeStyles = (category) => {
  let cssStyle = {
    overflowY: 'scroll', minHeight: '475px', maxHeight: '475px'
  }

  cssStyle.background = colorMap[category];

  return cssStyle;
}

let styleCategoryP = {
  font: "Open Sans",
  background: "#258039",
  padding: "10px 5px 10px 5px",
  textAlign: "center",
  color: "white",
  fontWeight: "bolder",
  fontSize: "110%",
  onMouseOver: "#FFF",
  borderRadius: "15px 15px 0px 0px"
};

let styleCategoryN = {
  font: "Open Sans",
  background: "#F5BE41",
  padding: "10px 5px 10px 5px",
  textAlign: "center",
  color: "white",
  fontWeight: "bolder",
  fontSize: "110%",
  onMouseOver: "#FFF",
  borderRadius: "15px 15px 0px 0px"
};

let styleCategoryD = {
  font: "Open Sans",
  background: "#CF3721",
  padding: "10px 5px 10px 5px",
  textAlign: "center",
  color: "white",
  fontWeight: "bolder",
  fontSize: "110%",
  onMouseOver: "#FFF",
  borderRadius: "15px 15px 0px 0px"
};

const style = {
  margin: "8px",
  padding: "10px",
  width: "calc(25% - 16px)",
  float: "left",
  verticalAlign: "top",
  minHeight: "475px",
  maxHeight: "475px",
  background: "#E0F2F1"
};

const styleScore = {
  margin: "8px",
  padding: "10px",
  width: "calc(25% - 16px)",
  float: "left",
  verticalAlign: "top",
  minHeight: "475px",
  maxHeight: "475px",
  background: "#E0F2F1"
};

const styleMap = {
  productive: styleCategoryP,
  neutral: styleCategoryN,
  distracting: styleCategoryD
};

export default DropTarget(ItemTypes.CARD, comparisonTarget, collect)(ActivityGroup);
