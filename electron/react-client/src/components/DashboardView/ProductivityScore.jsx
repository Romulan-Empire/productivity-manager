import React from "react";
import ReactSpeedometer from "react-d3-speedometer";

class ProductivityScore extends React.Component {
  constructor(props) {
    super(props);
  }

  sumActivityDuration(activities, category) {
    return activities[category].reduce((sum, activity) => {
      return sum + activity.duration
    }, 0);
  }

  calculateProductivityScore() {
    const { activities } = this.props;
    const productiveDuration = this.sumActivityDuration(activities, 'productive');
    const distractingDuration = this.sumActivityDuration(activities, 'distracting');
    const productivityScore = Math.floor( (productiveDuration / (productiveDuration + distractingDuration) * 100 ) );
    return productivityScore;
  }


  render() {
    return (
        <div style={{ margin: '0px', background: 'white', font: 'Garamond', fontSize: "125%", textAlign: "center"}}>
          <h3>Your <br/>Productivity Score</h3><br/>

          <ReactSpeedometer 
            value={this.calculateProductivityScore()}
            minValue={0}
            maxValue={100}
            segments={5}
            width={200}
            height={350}
            needleColor={'black'}
            ringWidth={35}
            currentValueText={''}
          />

        </div>
    );
  }
}

export default ProductivityScore;
