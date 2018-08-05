export const ItemTypes = {
  CARD: 'card'
};

export const stylePaper = {
  display: 'inline-block',
  align: 'top',
  background: '#E3F2FD',
  padding: '10px',
  height: '475px',
  width: '650px',
  margin: '25px',
  verticalAlign: 'top'
};

import moment from 'moment';
export const getDuration = (start, end) => {
  return moment
          .duration(
            moment(end, "MMMM Do YYYY, h:mm:ss a")
            .diff(moment(start, "MMMM Do YYYY, h:mm:ss a"))
          )
          .asSeconds();
};