import React from 'react';
import Paper from 'material-ui/Paper';

import c3 from 'c3';
// import 'c3/c3.css';

class ProductivityScore extends React.Component {

  constructor(props) {
    super(props);    
  }

  componentDidMount() {

    var chart = c3.generate({
      bindto: '#gauge',
      data: {
          columns: [
              ['data', 92]
          ],
          type: 'gauge',
          // onclick: function (d, i) { console.log("onclick", d, i); },
          // onmouseover: function (d, i) { console.log("onmouseover", d, i); },
          // onmouseout: function (d, i) { console.log("onmouseout", d, i); }
      },
      gauge: {
         label: {
             format: function(value, ratio) {
                 return value;
             },
             show: false // to turn off the min/max labels.
         },
         min: 0, // 0 is default, //can handle negative min e.g. vacuum / voltage / current flow / rate of change
         max: 100, // 100 is default
      //  units: ' %',
        width: 40 // for adjusting arc thickness
      },
      color: {
          pattern: ['#FF0000', '#F97600', '#F6C600', '#60B044'], // the three color levels for the percentage values.
          threshold: {
                unit: 'percentage', // percentage is default
  //          max: 200, // 100 is default
              values: [30, 60, 90, 100]
          }
      },
      size: {
          height: 225
      }
  });

  }

  
  render() {

    return (
      <div style={{fontSize: '125%', textAlign: 'center'}}>
          <h3>Productivity Score Today Is:</h3>
          <div id='gauge' style={{lineHeight: '300px'}}>

          </div>
      </div>
    )
  }
}

export default ProductivityScore;